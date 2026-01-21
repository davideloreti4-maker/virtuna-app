"""
Label Encoder - Create 4-class viral classification labels.
"""

import logging
from typing import List, Tuple, Dict

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class LabelEncoder:
    """
    Encode video view counts into viral classification labels.

    Classes:
    - low: < 50K views (score 0-29)
    - medium: 50K - 500K views (score 30-59)
    - high: 500K - 2M views (score 60-84)
    - ultra: > 2M views (score 85-100)
    """

    # Class definitions
    CLASSES = ["low", "medium", "high", "ultra"]

    CLASS_THRESHOLDS = {
        "low": (0, 50_000),
        "medium": (50_000, 500_000),
        "high": (500_000, 2_000_000),
        "ultra": (2_000_000, float("inf")),
    }

    CLASS_SCORE_RANGES = {
        "low": (0, 29),
        "medium": (30, 59),
        "high": (60, 84),
        "ultra": (85, 100),
    }

    def __init__(self):
        self.class_counts: Dict[str, int] = {}

    def encode(self, df: pd.DataFrame, view_column: str = "views") -> pd.Series:
        """
        Encode view counts into class labels.

        Args:
            df: DataFrame with video data
            view_column: Column name containing view counts

        Returns:
            Series with class labels
        """
        if view_column not in df.columns:
            raise ValueError(f"Column '{view_column}' not found in DataFrame")

        views = df[view_column].fillna(0).astype(int)
        labels = views.apply(self._get_class)

        # Store class distribution
        self.class_counts = labels.value_counts().to_dict()

        logger.info(f"Encoded {len(labels)} videos into classes:")
        for cls in self.CLASSES:
            count = self.class_counts.get(cls, 0)
            pct = count / len(labels) * 100 if len(labels) > 0 else 0
            logger.info(f"  {cls}: {count} ({pct:.1f}%)")

        return labels

    def _get_class(self, views: int) -> str:
        """Determine class for a view count"""
        for cls, (low, high) in self.CLASS_THRESHOLDS.items():
            if low <= views < high:
                return cls
        return "ultra"  # Fallback for very high views

    def get_class_weights(self, labels: pd.Series) -> Dict[str, float]:
        """
        Calculate class weights for imbalanced learning.
        Uses inverse frequency weighting.

        Args:
            labels: Series of class labels

        Returns:
            Dict of class -> weight
        """
        counts = labels.value_counts()
        total = len(labels)

        # Inverse frequency weights normalized by number of classes
        n_classes = len(self.CLASSES)
        weights = {}

        for cls in self.CLASSES:
            count = counts.get(cls, 1)  # Avoid division by zero
            weights[cls] = total / (n_classes * count)

        # Normalize so min weight = 1.0
        min_weight = min(weights.values())
        weights = {k: v / min_weight for k, v in weights.items()}

        logger.info("Class weights:")
        for cls, weight in weights.items():
            logger.info(f"  {cls}: {weight:.2f}")

        return weights

    def score_to_class(self, score: int) -> str:
        """Convert a viral score (0-100) to class label"""
        for cls, (low, high) in self.CLASS_SCORE_RANGES.items():
            if low <= score <= high:
                return cls
        return "ultra"

    def class_to_score_range(self, cls: str) -> Tuple[int, int]:
        """Get score range for a class"""
        return self.CLASS_SCORE_RANGES.get(cls, (0, 29))

    def class_to_midpoint_score(self, cls: str) -> int:
        """Get midpoint score for a class"""
        low, high = self.class_to_score_range(cls)
        return (low + high) // 2

    def get_stratified_sample(
        self,
        df: pd.DataFrame,
        labels: pd.Series,
        n_samples: int,
        random_state: int = 42,
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Get a stratified sample maintaining class proportions.

        Args:
            df: Feature DataFrame
            labels: Class labels
            n_samples: Target number of samples
            random_state: Random seed

        Returns:
            Tuple of (sampled_df, sampled_labels)
        """
        np.random.seed(random_state)

        # Calculate samples per class
        class_counts = labels.value_counts()
        total = len(labels)

        sample_indices = []

        for cls in self.CLASSES:
            cls_indices = labels[labels == cls].index.tolist()
            n_cls_samples = int(n_samples * (len(cls_indices) / total))
            n_cls_samples = min(n_cls_samples, len(cls_indices))

            if n_cls_samples > 0:
                sampled = np.random.choice(cls_indices, n_cls_samples, replace=False)
                sample_indices.extend(sampled)

        sample_indices = list(set(sample_indices))
        np.random.shuffle(sample_indices)

        return df.loc[sample_indices], labels.loc[sample_indices]

    def analyze_class_separation(
        self,
        df: pd.DataFrame,
        labels: pd.Series,
    ) -> Dict[str, Dict[str, float]]:
        """
        Analyze feature distributions per class.
        Useful for understanding class separability.

        Args:
            df: Feature DataFrame
            labels: Class labels

        Returns:
            Dict of class -> feature stats
        """
        stats = {}

        for cls in self.CLASSES:
            cls_data = df[labels == cls]
            if len(cls_data) == 0:
                continue

            stats[cls] = {
                "count": len(cls_data),
                "mean_engagement_rate": cls_data.get("engagement_rate", pd.Series([0])).mean(),
                "mean_views_log": cls_data.get("views_log", pd.Series([0])).mean(),
                "mean_duration": cls_data.get("duration", pd.Series([0])).mean(),
            }

        return stats
