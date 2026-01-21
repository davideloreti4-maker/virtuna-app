"""
Prediction module - Load XGBoost model and make viral predictions.
"""

import os
import json
import time
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone

import numpy as np
import joblib

from .models import (
    MLAnalysisRequest,
    MLAnalysisResponse,
    Suggestion,
    VideoMetadata,
)

logger = logging.getLogger(__name__)


class Predictor:
    """Handles model loading and viral predictions"""

    MODEL_DIR = Path(__file__).parent.parent / "models" / "current"
    MODEL_PATH = MODEL_DIR / "model.joblib"
    METADATA_PATH = MODEL_DIR / "model_metadata.json"

    # Viral class thresholds and score ranges
    CLASS_SCORE_RANGES = {
        "low": (0, 29),
        "medium": (30, 59),
        "high": (60, 84),
        "ultra": (85, 100),
    }

    def __init__(self):
        self.model = None
        self.metadata: Dict = {}
        self.feature_names: List[str] = []
        self.total_predictions = 0
        self.prediction_times: List[float] = []
        self.class_counts: Dict[str, int] = {k: 0 for k in self.CLASS_SCORE_RANGES}

        self._load_model()

    def _load_model(self) -> None:
        """Load the trained XGBoost model and metadata"""
        try:
            if self.MODEL_PATH.exists():
                self.model = joblib.load(self.MODEL_PATH)
                logger.info(f"Loaded model from {self.MODEL_PATH}")
            else:
                logger.warning(f"Model not found at {self.MODEL_PATH}, using fallback scoring")

            if self.METADATA_PATH.exists():
                with open(self.METADATA_PATH) as f:
                    self.metadata = json.load(f)
                self.feature_names = self.metadata.get("feature_names", [])
                logger.info(f"Loaded model metadata: v{self.metadata.get('version', 'unknown')}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.model = None

    def is_model_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model is not None

    def get_model_version(self) -> Optional[str]:
        """Get current model version"""
        return self.metadata.get("version")

    def get_last_trained_at(self) -> Optional[str]:
        """Get last training timestamp"""
        return self.metadata.get("trained_at")

    def reload_model(self) -> bool:
        """Reload model from disk (after retraining)"""
        try:
            self._load_model()
            return self.is_model_loaded()
        except Exception as e:
            logger.error(f"Failed to reload model: {e}")
            return False

    def extract_features(self, metadata: VideoMetadata) -> Dict[str, float]:
        """
        Extract features from video metadata.
        Returns dict of feature_name -> value.
        """
        features = {}

        # Engagement features
        views = max(metadata.engagement.views, 1)
        likes = metadata.engagement.likes
        comments = metadata.engagement.comments
        shares = metadata.engagement.shares

        features["views_log"] = np.log10(views + 1)
        features["likes_log"] = np.log10(likes + 1)
        features["comments_log"] = np.log10(comments + 1)
        features["shares_log"] = np.log10(shares + 1)

        features["engagement_rate"] = (likes + comments + shares) / views if views > 0 else 0
        features["like_rate"] = likes / views if views > 0 else 0
        features["comment_rate"] = comments / views if views > 0 else 0
        features["share_rate"] = shares / views if views > 0 else 0
        features["like_to_comment"] = likes / (comments + 1)
        features["share_to_like"] = shares / (likes + 1)

        # Video features
        features["duration"] = metadata.duration
        features["duration_log"] = np.log10(metadata.duration + 1)
        features["is_short"] = 1.0 if metadata.duration <= 15 else 0.0
        features["is_medium"] = 1.0 if 15 < metadata.duration <= 60 else 0.0
        features["is_long"] = 1.0 if metadata.duration > 60 else 0.0

        # Content features
        description = metadata.description or ""
        features["desc_length"] = len(description)
        features["desc_word_count"] = len(description.split())
        features["has_emoji"] = 1.0 if any(ord(c) > 127 for c in description) else 0.0
        features["has_cta"] = 1.0 if any(cta in description.lower() for cta in
            ["follow", "like", "comment", "share", "link in bio", "dm", "check out"]) else 0.0
        features["has_question"] = 1.0 if "?" in description else 0.0

        # Hashtag features
        hashtags = metadata.hashtags or []
        features["hashtag_count"] = len(hashtags)
        features["has_fyp"] = 1.0 if any(h.lower() in ["fyp", "foryou", "foryoupage", "viral"]
            for h in hashtags) else 0.0
        features["avg_hashtag_length"] = np.mean([len(h) for h in hashtags]) if hashtags else 0

        # Audio features
        features["has_music"] = 1.0 if metadata.soundName else 0.0
        features["is_original_sound"] = 1.0 if metadata.musicOriginal else 0.0
        features["sound_name_length"] = len(metadata.soundName or "")

        # Creator features
        if metadata.authorFollowers is not None:
            features["followers_log"] = np.log10(metadata.authorFollowers + 1)
            features["follower_bucket"] = self._get_follower_bucket(metadata.authorFollowers)
        else:
            features["followers_log"] = 0.0
            features["follower_bucket"] = 0.0

        features["is_verified"] = 1.0 if metadata.authorVerified else 0.0

        # Temporal features
        if metadata.createTime:
            try:
                dt = datetime.fromisoformat(metadata.createTime.replace("Z", "+00:00"))
                features["hour_of_day"] = dt.hour
                features["day_of_week"] = dt.weekday()
                features["is_weekend"] = 1.0 if dt.weekday() >= 5 else 0.0
                features["is_prime_time"] = 1.0 if 18 <= dt.hour <= 22 else 0.0
            except:
                features["hour_of_day"] = 12.0
                features["day_of_week"] = 3.0
                features["is_weekend"] = 0.0
                features["is_prime_time"] = 0.0
        else:
            features["hour_of_day"] = 12.0
            features["day_of_week"] = 3.0
            features["is_weekend"] = 0.0
            features["is_prime_time"] = 0.0

        # Derived/interaction features
        features["engagement_per_follower"] = (
            features["engagement_rate"] / (features["followers_log"] + 1)
        )
        features["viral_velocity"] = features["views_log"] * features["engagement_rate"]

        return features

    def _get_follower_bucket(self, followers: int) -> float:
        """Categorize follower count into buckets"""
        if followers < 1000:
            return 0.0  # Nano
        elif followers < 10000:
            return 1.0  # Micro
        elif followers < 100000:
            return 2.0  # Mid
        elif followers < 1000000:
            return 3.0  # Macro
        else:
            return 4.0  # Mega

    def _features_to_array(self, features: Dict[str, float]) -> np.ndarray:
        """Convert feature dict to array in correct order"""
        if self.feature_names:
            return np.array([[features.get(name, 0.0) for name in self.feature_names]])
        # Default feature order if no metadata
        return np.array([list(features.values())])

    def predict(self, request: MLAnalysisRequest) -> MLAnalysisResponse:
        """Make a viral prediction for a single video"""
        start_time = time.time()

        # Extract features
        features = self.extract_features(request.metadata)

        if self.model is not None:
            # Use trained model
            X = self._features_to_array(features)

            # Get class probabilities
            proba = self.model.predict_proba(X)[0]
            classes = self.model.classes_

            # Find predicted class
            pred_idx = np.argmax(proba)
            viral_class = classes[pred_idx]
            confidence = float(proba[pred_idx])

            # Convert to scores
            scores = self._probabilities_to_scores(dict(zip(classes, proba)), features)
        else:
            # Fallback formula-based scoring
            viral_class, confidence, scores = self._fallback_scoring(features)

        # Generate suggestions
        suggestions = self._generate_suggestions(features, scores, viral_class)

        # Calculate prediction time
        pred_time_ms = (time.time() - start_time) * 1000

        # Update metrics
        self.total_predictions += 1
        self.prediction_times.append(pred_time_ms)
        self.class_counts[viral_class] = self.class_counts.get(viral_class, 0) + 1

        return MLAnalysisResponse(
            overallScore=scores["overall"],
            hookScore=scores["hook"],
            trendScore=scores["trend"],
            audioScore=scores["audio"],
            timingScore=scores["timing"],
            hashtagScore=scores["hashtag"],
            suggestions=suggestions,
            viralClass=viral_class,
            confidence=round(confidence, 3),
            predictionTimeMs=round(pred_time_ms, 2),
        )

    def _probabilities_to_scores(
        self, proba: Dict[str, float], features: Dict[str, float]
    ) -> Dict[str, int]:
        """Convert class probabilities to component scores"""
        # Weighted overall score based on class probabilities
        overall = sum(
            proba.get(cls, 0) * (rng[0] + rng[1]) / 2
            for cls, rng in self.CLASS_SCORE_RANGES.items()
        )

        # Component scores based on relevant features
        hook_score = self._calc_hook_score(features)
        trend_score = self._calc_trend_score(features)
        audio_score = self._calc_audio_score(features)
        timing_score = self._calc_timing_score(features)
        hashtag_score = self._calc_hashtag_score(features)

        return {
            "overall": int(min(100, max(0, overall))),
            "hook": int(min(100, max(0, hook_score))),
            "trend": int(min(100, max(0, trend_score))),
            "audio": int(min(100, max(0, audio_score))),
            "timing": int(min(100, max(0, timing_score))),
            "hashtag": int(min(100, max(0, hashtag_score))),
        }

    def _calc_hook_score(self, features: Dict[str, float]) -> float:
        """Calculate hook strength score"""
        score = 50.0

        # Short videos with high engagement = strong hook
        if features.get("is_short", 0):
            score += 10
        if features.get("engagement_rate", 0) > 0.1:
            score += 20
        if features.get("has_question", 0):
            score += 10
        if features.get("has_cta", 0):
            score += 5

        # Views indicate hook worked
        views_log = features.get("views_log", 0)
        if views_log > 5:  # 100K+ views
            score += 15
        elif views_log > 4:  # 10K+ views
            score += 10

        return score

    def _calc_trend_score(self, features: Dict[str, float]) -> float:
        """Calculate trend alignment score"""
        score = 50.0

        # FYP hashtags indicate trend awareness
        if features.get("has_fyp", 0):
            score += 15

        # Engagement rate indicates trend relevance
        engagement = features.get("engagement_rate", 0)
        if engagement > 0.15:
            score += 25
        elif engagement > 0.08:
            score += 15
        elif engagement > 0.05:
            score += 5

        # Share rate indicates viral potential
        if features.get("share_rate", 0) > 0.02:
            score += 10

        return score

    def _calc_audio_score(self, features: Dict[str, float]) -> float:
        """Calculate audio optimization score"""
        score = 50.0

        if features.get("has_music", 0):
            score += 20
        if not features.get("is_original_sound", 0):
            # Trending sounds tend to perform better
            score += 10

        return score

    def _calc_timing_score(self, features: Dict[str, float]) -> float:
        """Calculate posting time optimization score"""
        score = 50.0

        if features.get("is_prime_time", 0):
            score += 20
        if features.get("is_weekend", 0):
            score += 5

        # Mid-day posting
        hour = features.get("hour_of_day", 12)
        if 11 <= hour <= 14:
            score += 10
        elif 18 <= hour <= 22:
            score += 15

        return score

    def _calc_hashtag_score(self, features: Dict[str, float]) -> float:
        """Calculate hashtag strategy score"""
        score = 50.0

        hashtag_count = features.get("hashtag_count", 0)

        # Optimal hashtag count is 3-5
        if 3 <= hashtag_count <= 5:
            score += 20
        elif 1 <= hashtag_count <= 8:
            score += 10
        elif hashtag_count > 10:
            score -= 10  # Too many hashtags

        if features.get("has_fyp", 0):
            score += 15

        return score

    def _fallback_scoring(
        self, features: Dict[str, float]
    ) -> Tuple[str, float, Dict[str, int]]:
        """Formula-based scoring when model is not available"""
        # Calculate component scores (clamped to 0-100)
        scores = {
            "hook": int(min(100, max(0, self._calc_hook_score(features)))),
            "trend": int(min(100, max(0, self._calc_trend_score(features)))),
            "audio": int(min(100, max(0, self._calc_audio_score(features)))),
            "timing": int(min(100, max(0, self._calc_timing_score(features)))),
            "hashtag": int(min(100, max(0, self._calc_hashtag_score(features)))),
        }

        # Overall is weighted average
        weights = {"hook": 0.25, "trend": 0.25, "audio": 0.15, "timing": 0.15, "hashtag": 0.20}
        overall = sum(scores[k] * weights[k] for k in scores)
        scores["overall"] = int(min(100, max(0, overall)))

        # Determine class from overall score
        viral_class = "low"
        for cls, (low, high) in self.CLASS_SCORE_RANGES.items():
            if low <= scores["overall"] <= high:
                viral_class = cls
                break

        # Confidence is lower for formula-based
        confidence = 0.5

        return viral_class, confidence, scores

    def _generate_suggestions(
        self, features: Dict[str, float], scores: Dict[str, int], viral_class: str
    ) -> List[Suggestion]:
        """Generate improvement suggestions based on analysis"""
        suggestions = []

        # Hook suggestions
        if scores["hook"] < 60:
            if not features.get("has_question", 0):
                suggestions.append(Suggestion(
                    category="hook",
                    priority="high",
                    title="Add a Hook Question",
                    description="Start with a question to increase curiosity and watch time."
                ))
            if features.get("duration", 0) > 30:
                suggestions.append(Suggestion(
                    category="hook",
                    priority="medium",
                    title="Shorten Your Video",
                    description="Videos under 15 seconds often have higher completion rates."
                ))

        # Trend suggestions
        if scores["trend"] < 60:
            if not features.get("has_fyp", 0):
                suggestions.append(Suggestion(
                    category="trend",
                    priority="high",
                    title="Use Trending Hashtags",
                    description="Add #fyp or #foryou to increase discoverability."
                ))

        # Audio suggestions
        if scores["audio"] < 60:
            if not features.get("has_music", 0):
                suggestions.append(Suggestion(
                    category="audio",
                    priority="high",
                    title="Add Trending Sound",
                    description="Videos with popular sounds get up to 3x more views."
                ))

        # Timing suggestions
        if scores["timing"] < 60:
            if not features.get("is_prime_time", 0):
                suggestions.append(Suggestion(
                    category="timing",
                    priority="medium",
                    title="Post During Peak Hours",
                    description="Best posting times are 6-10 PM in your audience's timezone."
                ))

        # Hashtag suggestions
        if scores["hashtag"] < 60:
            hashtag_count = features.get("hashtag_count", 0)
            if hashtag_count < 3:
                suggestions.append(Suggestion(
                    category="hashtag",
                    priority="medium",
                    title="Add More Hashtags",
                    description="Use 3-5 relevant hashtags for optimal reach."
                ))
            elif hashtag_count > 8:
                suggestions.append(Suggestion(
                    category="hashtag",
                    priority="low",
                    title="Reduce Hashtag Count",
                    description="Too many hashtags can look spammy. Focus on 3-5 relevant ones."
                ))

        # CTA suggestion
        if not features.get("has_cta", 0):
            suggestions.append(Suggestion(
                category="engagement",
                priority="medium",
                title="Add a Call to Action",
                description="Ask viewers to like, comment, or follow to boost engagement."
            ))

        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        suggestions.sort(key=lambda s: priority_order.get(s.priority, 1))

        return suggestions[:5]  # Return top 5 suggestions

    def get_metrics(self) -> Dict:
        """Get prediction metrics"""
        avg_time = (
            sum(self.prediction_times) / len(self.prediction_times)
            if self.prediction_times else 0
        )

        return {
            "totalPredictions": self.total_predictions,
            "avgPredictionTimeMs": round(avg_time, 2),
            "classDistribution": self.class_counts,
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
        }
