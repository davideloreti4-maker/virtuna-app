"""
Model Evaluation - Accuracy metrics, confusion matrix, and performance analysis.
"""

import logging
from typing import Dict, List, Optional

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)

logger = logging.getLogger(__name__)


def evaluate_model(
    model,
    X_test: pd.DataFrame,
    y_test: np.ndarray,
    class_names: List[str],
) -> Dict:
    """
    Evaluate model performance on test set.

    Args:
        model: Trained model with predict and predict_proba methods
        X_test: Test features
        y_test: Test labels (encoded)
        class_names: List of class names

    Returns:
        Dict with evaluation metrics
    """
    logger.info("Evaluating model performance")

    # Get predictions
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)

    # Basic metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    logger.info(f"Accuracy: {accuracy:.4f}")
    logger.info(f"Precision: {precision:.4f}")
    logger.info(f"Recall: {recall:.4f}")
    logger.info(f"F1 Score: {f1:.4f}")

    # Per-class metrics
    report = classification_report(
        y_test, y_pred,
        target_names=class_names,
        output_dict=True,
        zero_division=0,
    )

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    cm_normalized = cm.astype("float") / cm.sum(axis=1)[:, np.newaxis]

    # Class-wise accuracy
    class_accuracy = {}
    for i, cls in enumerate(class_names):
        cls_mask = y_test == i
        if cls_mask.sum() > 0:
            cls_acc = (y_pred[cls_mask] == i).mean()
            class_accuracy[cls] = float(cls_acc)
            logger.info(f"  {cls} accuracy: {cls_acc:.4f}")

    # Confidence analysis
    confidence_stats = analyze_confidence(y_proba, y_test, y_pred)

    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "classification_report": report,
        "confusion_matrix": cm.tolist(),
        "confusion_matrix_normalized": cm_normalized.tolist(),
        "class_accuracy": class_accuracy,
        "confidence_stats": confidence_stats,
    }


def analyze_confidence(
    y_proba: np.ndarray,
    y_true: np.ndarray,
    y_pred: np.ndarray,
) -> Dict:
    """
    Analyze prediction confidence statistics.

    Args:
        y_proba: Prediction probabilities
        y_true: True labels
        y_pred: Predicted labels

    Returns:
        Dict with confidence statistics
    """
    # Get max probability for each prediction
    max_proba = y_proba.max(axis=1)

    # Overall confidence
    mean_confidence = float(max_proba.mean())
    std_confidence = float(max_proba.std())

    # Confidence for correct vs incorrect predictions
    correct_mask = y_pred == y_true
    confidence_correct = float(max_proba[correct_mask].mean()) if correct_mask.sum() > 0 else 0
    confidence_incorrect = float(max_proba[~correct_mask].mean()) if (~correct_mask).sum() > 0 else 0

    # Confidence distribution
    confidence_bins = {
        "very_low": float((max_proba < 0.3).mean()),
        "low": float(((max_proba >= 0.3) & (max_proba < 0.5)).mean()),
        "medium": float(((max_proba >= 0.5) & (max_proba < 0.7)).mean()),
        "high": float(((max_proba >= 0.7) & (max_proba < 0.9)).mean()),
        "very_high": float((max_proba >= 0.9).mean()),
    }

    return {
        "mean_confidence": mean_confidence,
        "std_confidence": std_confidence,
        "confidence_correct": confidence_correct,
        "confidence_incorrect": confidence_incorrect,
        "confidence_gap": confidence_correct - confidence_incorrect,
        "confidence_distribution": confidence_bins,
    }


def analyze_feature_importance(
    model,
    feature_names: List[str],
    top_n: int = 20,
) -> Dict:
    """
    Analyze feature importance from trained model.

    Args:
        model: Trained XGBoost model
        feature_names: List of feature names
        top_n: Number of top features to return

    Returns:
        Dict with feature importance analysis
    """
    # Get feature importances
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    else:
        logger.warning("Model does not have feature_importances_ attribute")
        return {}

    # Create sorted list
    importance_pairs = sorted(
        zip(feature_names, importances),
        key=lambda x: x[1],
        reverse=True,
    )

    # Top features
    top_features = [
        {"name": name, "importance": float(imp)}
        for name, imp in importance_pairs[:top_n]
    ]

    # Feature groups analysis
    feature_groups = {
        "engagement": ["views_log", "likes_log", "engagement_rate", "like_rate", "share_rate"],
        "creator": ["followers_log", "is_verified", "follower_bucket"],
        "video": ["duration", "is_short", "is_medium", "is_long"],
        "content": ["desc_length", "has_emoji", "has_cta", "has_question"],
        "hashtag": ["hashtag_count", "has_fyp", "avg_hashtag_length"],
        "audio": ["has_music", "is_original_sound"],
        "temporal": ["hour_of_day", "is_weekend", "is_prime_time"],
    }

    group_importance = {}
    for group_name, group_features in feature_groups.items():
        group_imp = sum(
            imp for name, imp in importance_pairs
            if name in group_features
        )
        group_importance[group_name] = float(group_imp)

    # Normalize group importance
    total_group_imp = sum(group_importance.values())
    if total_group_imp > 0:
        group_importance = {k: v / total_group_imp for k, v in group_importance.items()}

    return {
        "top_features": top_features,
        "group_importance": group_importance,
        "all_features": {name: float(imp) for name, imp in importance_pairs},
    }


def compare_models(
    model_a,
    model_b,
    X_test: pd.DataFrame,
    y_test: np.ndarray,
    class_names: List[str],
) -> Dict:
    """
    Compare two models on the same test set.

    Args:
        model_a: First model
        model_b: Second model
        X_test: Test features
        y_test: Test labels
        class_names: Class names

    Returns:
        Dict with comparison results
    """
    eval_a = evaluate_model(model_a, X_test, y_test, class_names)
    eval_b = evaluate_model(model_b, X_test, y_test, class_names)

    comparison = {
        "model_a": {
            "accuracy": eval_a["accuracy"],
            "f1_score": eval_a["f1_score"],
            "mean_confidence": eval_a["confidence_stats"]["mean_confidence"],
        },
        "model_b": {
            "accuracy": eval_b["accuracy"],
            "f1_score": eval_b["f1_score"],
            "mean_confidence": eval_b["confidence_stats"]["mean_confidence"],
        },
        "differences": {
            "accuracy": eval_b["accuracy"] - eval_a["accuracy"],
            "f1_score": eval_b["f1_score"] - eval_a["f1_score"],
        },
        "recommendation": "model_b" if eval_b["accuracy"] > eval_a["accuracy"] else "model_a",
    }

    return comparison


def generate_evaluation_report(
    model,
    X_test: pd.DataFrame,
    y_test: np.ndarray,
    feature_names: List[str],
    class_names: List[str],
) -> str:
    """
    Generate a human-readable evaluation report.

    Args:
        model: Trained model
        X_test: Test features
        y_test: Test labels
        feature_names: Feature names
        class_names: Class names

    Returns:
        Formatted report string
    """
    eval_results = evaluate_model(model, X_test, y_test, class_names)
    feature_imp = analyze_feature_importance(model, feature_names)

    report = []
    report.append("=" * 60)
    report.append("MODEL EVALUATION REPORT")
    report.append("=" * 60)
    report.append("")

    # Overall metrics
    report.append("OVERALL METRICS")
    report.append("-" * 40)
    report.append(f"Accuracy:  {eval_results['accuracy']:.4f}")
    report.append(f"Precision: {eval_results['precision']:.4f}")
    report.append(f"Recall:    {eval_results['recall']:.4f}")
    report.append(f"F1 Score:  {eval_results['f1_score']:.4f}")
    report.append("")

    # Per-class accuracy
    report.append("PER-CLASS ACCURACY")
    report.append("-" * 40)
    for cls, acc in eval_results["class_accuracy"].items():
        report.append(f"  {cls:10s}: {acc:.4f}")
    report.append("")

    # Confidence stats
    conf_stats = eval_results["confidence_stats"]
    report.append("CONFIDENCE ANALYSIS")
    report.append("-" * 40)
    report.append(f"Mean confidence:     {conf_stats['mean_confidence']:.4f}")
    report.append(f"Correct predictions: {conf_stats['confidence_correct']:.4f}")
    report.append(f"Wrong predictions:   {conf_stats['confidence_incorrect']:.4f}")
    report.append(f"Confidence gap:      {conf_stats['confidence_gap']:.4f}")
    report.append("")

    # Top features
    if feature_imp:
        report.append("TOP 10 FEATURES")
        report.append("-" * 40)
        for feat in feature_imp.get("top_features", [])[:10]:
            report.append(f"  {feat['name']:25s}: {feat['importance']:.4f}")
        report.append("")

        report.append("FEATURE GROUP IMPORTANCE")
        report.append("-" * 40)
        for group, imp in sorted(
            feature_imp.get("group_importance", {}).items(),
            key=lambda x: x[1],
            reverse=True,
        ):
            report.append(f"  {group:15s}: {imp:.2%}")

    report.append("")
    report.append("=" * 60)

    return "\n".join(report)
