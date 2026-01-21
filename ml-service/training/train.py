"""
Model Training - XGBoost multi-class classifier with SMOTE balancing.
"""

import os
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional, Tuple

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder as SklearnLabelEncoder
from xgboost import XGBClassifier

try:
    from imblearn.over_sampling import SMOTE
    HAS_SMOTE = True
except ImportError:
    HAS_SMOTE = False

from .data_loader import DataLoader
from .features import FeatureExtractor
from .labels import LabelEncoder
from .evaluate import evaluate_model

logger = logging.getLogger(__name__)

# Paths
MODEL_DIR = Path(__file__).parent.parent / "models"
CURRENT_MODEL_DIR = MODEL_DIR / "current"
ARCHIVE_DIR = MODEL_DIR / "archive"


def train_model(
    min_videos: int = 1000,
    max_videos: Optional[int] = None,
    days_back: int = 90,
    min_accuracy: float = 0.85,
    use_smote: bool = True,
    n_folds: int = 5,
    save_model: bool = True,
) -> Dict:
    """
    Train XGBoost viral classification model.

    Args:
        min_videos: Minimum videos required
        max_videos: Maximum videos to use (None = all)
        days_back: Days of data to include
        min_accuracy: Minimum accuracy to deploy model
        use_smote: Whether to use SMOTE for balancing
        n_folds: Number of cross-validation folds
        save_model: Whether to save the trained model

    Returns:
        Dict with training results
    """
    logger.info("=" * 60)
    logger.info("Starting model training pipeline")
    logger.info("=" * 60)

    results = {
        "status": "started",
        "started_at": datetime.utcnow().isoformat(),
        "config": {
            "min_videos": min_videos,
            "max_videos": max_videos,
            "days_back": days_back,
            "min_accuracy": min_accuracy,
            "use_smote": use_smote,
        },
    }

    try:
        # 1. Load data
        logger.info("Step 1: Loading data from Supabase")
        data_loader = DataLoader()
        df = data_loader.fetch_videos(
            min_videos=min_videos,
            max_videos=max_videos,
            days_back=days_back,
        )
        results["data_count"] = len(df)
        logger.info(f"Loaded {len(df)} videos")

        # 2. Extract features
        logger.info("Step 2: Extracting features")
        feature_extractor = FeatureExtractor()
        X = feature_extractor.extract(df)
        feature_names = feature_extractor.get_feature_names()
        results["feature_count"] = len(feature_names)
        logger.info(f"Extracted {len(feature_names)} features")

        # 3. Create labels
        logger.info("Step 3: Creating labels")
        label_encoder = LabelEncoder()
        y = label_encoder.encode(df)
        results["class_distribution"] = label_encoder.class_counts
        logger.info(f"Class distribution: {label_encoder.class_counts}")

        # 4. Split data (70/15/15)
        logger.info("Step 4: Splitting data")
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=0.15, stratify=y, random_state=42
        )
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=0.176, stratify=y_temp, random_state=42  # 0.176 * 0.85 ≈ 0.15
        )
        logger.info(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

        # 5. Apply SMOTE if enabled and available
        if use_smote and HAS_SMOTE:
            logger.info("Step 5: Applying SMOTE for class balancing")
            smote = SMOTE(random_state=42)
            X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
            logger.info(f"After SMOTE: {len(X_train_balanced)} samples")
        else:
            if use_smote and not HAS_SMOTE:
                logger.warning("SMOTE requested but imblearn not installed, skipping")
            X_train_balanced, y_train_balanced = X_train, y_train

        # 6. Encode labels for XGBoost
        sklearn_encoder = SklearnLabelEncoder()
        sklearn_encoder.fit(label_encoder.CLASSES)
        y_train_encoded = sklearn_encoder.transform(y_train_balanced)
        y_val_encoded = sklearn_encoder.transform(y_val)
        y_test_encoded = sklearn_encoder.transform(y_test)

        # 7. Train XGBoost
        logger.info("Step 6: Training XGBoost model")
        class_weights = label_encoder.get_class_weights(y_train)
        sample_weights = np.array([class_weights[cls] for cls in y_train_balanced])

        model = XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            objective="multi:softprob",
            num_class=4,
            random_state=42,
            n_jobs=-1,
            eval_metric="mlogloss",
        )

        model.fit(
            X_train_balanced,
            y_train_encoded,
            sample_weight=sample_weights,
            eval_set=[(X_val, y_val_encoded)],
            verbose=False,
        )

        # 8. Cross-validation
        logger.info("Step 7: Running cross-validation")
        cv = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=42)
        cv_scores = cross_val_score(model, X_train_balanced, y_train_encoded, cv=cv, scoring="accuracy")
        results["cv_scores"] = cv_scores.tolist()
        results["cv_mean"] = float(cv_scores.mean())
        results["cv_std"] = float(cv_scores.std())
        logger.info(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

        # 9. Evaluate on test set
        logger.info("Step 8: Evaluating on test set")
        eval_results = evaluate_model(
            model,
            X_test,
            y_test_encoded,
            sklearn_encoder.classes_,
        )
        results["test_accuracy"] = eval_results["accuracy"]
        results["classification_report"] = eval_results["classification_report"]
        logger.info(f"Test Accuracy: {eval_results['accuracy']:.4f}")

        # 10. Check accuracy threshold
        if eval_results["accuracy"] < min_accuracy:
            logger.warning(
                f"Model accuracy {eval_results['accuracy']:.4f} below threshold {min_accuracy}"
            )
            results["status"] = "accuracy_below_threshold"
            results["deployed"] = False
            return results

        # 11. Save model if enabled
        if save_model:
            logger.info("Step 9: Saving model")
            version = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            save_results = _save_model(
                model,
                feature_names,
                sklearn_encoder.classes_.tolist(),
                version,
                results,
            )
            results.update(save_results)

        results["status"] = "success"
        results["completed_at"] = datetime.utcnow().isoformat()
        logger.info("Training pipeline completed successfully")

        return results

    except Exception as e:
        logger.error(f"Training failed: {e}")
        results["status"] = "failed"
        results["error"] = str(e)
        results["completed_at"] = datetime.utcnow().isoformat()
        return results


def _save_model(
    model: XGBClassifier,
    feature_names: list,
    class_names: list,
    version: str,
    training_results: Dict,
) -> Dict:
    """Save model and metadata to disk"""
    # Ensure directories exist
    CURRENT_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    # Archive current model if exists
    current_model_path = CURRENT_MODEL_DIR / "model.joblib"
    current_metadata_path = CURRENT_MODEL_DIR / "model_metadata.json"

    if current_model_path.exists():
        try:
            with open(current_metadata_path) as f:
                old_metadata = json.load(f)
            old_version = old_metadata.get("version", "unknown")

            # Move to archive
            archive_model_path = ARCHIVE_DIR / f"model_{old_version}.joblib"
            archive_metadata_path = ARCHIVE_DIR / f"model_metadata_{old_version}.json"

            current_model_path.rename(archive_model_path)
            current_metadata_path.rename(archive_metadata_path)

            logger.info(f"Archived previous model: {old_version}")
        except Exception as e:
            logger.warning(f"Failed to archive old model: {e}")

    # Save new model
    model_path = CURRENT_MODEL_DIR / "model.joblib"
    joblib.dump(model, model_path)
    logger.info(f"Saved model to {model_path}")

    # Save metadata
    metadata = {
        "version": version,
        "trained_at": datetime.utcnow().isoformat(),
        "feature_names": feature_names,
        "class_names": class_names,
        "data_count": training_results.get("data_count"),
        "test_accuracy": training_results.get("test_accuracy"),
        "cv_mean": training_results.get("cv_mean"),
        "cv_std": training_results.get("cv_std"),
        "class_distribution": training_results.get("class_distribution"),
    }

    metadata_path = CURRENT_MODEL_DIR / "model_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Saved metadata to {metadata_path}")

    return {
        "deployed": True,
        "model_path": str(model_path),
        "metadata_path": str(metadata_path),
        "version": version,
    }


def load_current_model() -> Tuple[Optional[XGBClassifier], Optional[Dict]]:
    """Load the current deployed model"""
    model_path = CURRENT_MODEL_DIR / "model.joblib"
    metadata_path = CURRENT_MODEL_DIR / "model_metadata.json"

    if not model_path.exists():
        return None, None

    try:
        model = joblib.load(model_path)

        metadata = {}
        if metadata_path.exists():
            with open(metadata_path) as f:
                metadata = json.load(f)

        return model, metadata
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return None, None


def rollback_model(version: str) -> bool:
    """
    Rollback to a previous model version.

    Args:
        version: Version string to rollback to

    Returns:
        True if rollback successful
    """
    archive_model_path = ARCHIVE_DIR / f"model_{version}.joblib"
    archive_metadata_path = ARCHIVE_DIR / f"model_metadata_{version}.json"

    if not archive_model_path.exists():
        logger.error(f"Archive model not found: {version}")
        return False

    try:
        # Archive current model first
        current_model_path = CURRENT_MODEL_DIR / "model.joblib"
        current_metadata_path = CURRENT_MODEL_DIR / "model_metadata.json"

        if current_model_path.exists():
            with open(current_metadata_path) as f:
                old_metadata = json.load(f)
            old_version = old_metadata.get("version", "unknown")

            rollback_archive_model = ARCHIVE_DIR / f"model_{old_version}_replaced.joblib"
            rollback_archive_meta = ARCHIVE_DIR / f"model_metadata_{old_version}_replaced.json"

            current_model_path.rename(rollback_archive_model)
            if current_metadata_path.exists():
                current_metadata_path.rename(rollback_archive_meta)

        # Restore archived version
        import shutil
        shutil.copy(archive_model_path, CURRENT_MODEL_DIR / "model.joblib")
        if archive_metadata_path.exists():
            shutil.copy(archive_metadata_path, CURRENT_MODEL_DIR / "model_metadata.json")

        logger.info(f"Rolled back to version: {version}")
        return True

    except Exception as e:
        logger.error(f"Rollback failed: {e}")
        return False


# CLI entry point
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train viral prediction model")
    parser.add_argument("--min-videos", type=int, default=1000)
    parser.add_argument("--max-videos", type=int, default=None)
    parser.add_argument("--days-back", type=int, default=90)
    parser.add_argument("--min-accuracy", type=float, default=0.85)
    parser.add_argument("--no-smote", action="store_true")
    parser.add_argument("--no-save", action="store_true")

    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)

    results = train_model(
        min_videos=args.min_videos,
        max_videos=args.max_videos,
        days_back=args.days_back,
        min_accuracy=args.min_accuracy,
        use_smote=not args.no_smote,
        save_model=not args.no_save,
    )

    print("\n" + "=" * 60)
    print("Training Results:")
    print(json.dumps(results, indent=2))
