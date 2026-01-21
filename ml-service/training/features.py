"""
Feature Engineering - Extract 50+ features from video metadata.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, timezone

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class FeatureExtractor:
    """Extract ML features from video metadata"""

    # Feature groups for documentation and selection
    FEATURE_GROUPS = {
        "engagement": [
            "views_log", "likes_log", "comments_log", "shares_log",
            "engagement_rate", "like_rate", "comment_rate", "share_rate",
            "like_to_comment_ratio", "share_to_like_ratio", "engagement_velocity",
        ],
        "creator": [
            "followers_log", "is_verified", "follower_bucket",
            "engagement_per_follower", "follower_views_ratio",
        ],
        "video": [
            "duration", "duration_log", "is_short", "is_medium", "is_long",
            "duration_bucket",
        ],
        "content": [
            "desc_length", "desc_word_count", "desc_char_density",
            "has_emoji", "emoji_count", "has_cta", "cta_strength",
            "has_question", "question_count", "has_numbers",
            "capitalization_ratio", "punctuation_density",
        ],
        "hashtag": [
            "hashtag_count", "has_fyp", "fyp_count", "has_niche_tags",
            "avg_hashtag_length", "total_hashtag_chars",
            "hashtag_diversity",
        ],
        "audio": [
            "has_music", "is_original_sound", "sound_name_length",
        ],
        "temporal": [
            "hour_of_day", "day_of_week", "is_weekend", "is_prime_time",
            "is_morning", "is_afternoon", "is_evening", "is_night",
            "days_since_creation",
        ],
        "derived": [
            "viral_score", "growth_potential", "audience_resonance",
            "content_quality_proxy", "optimization_score",
        ],
    }

    # CTA phrases to detect
    CTA_PHRASES = [
        "follow", "like", "comment", "share", "tag", "save",
        "link in bio", "click", "dm", "subscribe", "turn on notifications",
        "check out", "watch till end", "wait for it", "don't miss",
    ]

    # FYP/viral hashtags
    FYP_HASHTAGS = [
        "fyp", "foryou", "foryoupage", "viral", "trending", "blowthisup",
        "xyzbca", "explore", "featured", "viralvideo",
    ]

    def __init__(self):
        self.feature_names: List[str] = []
        self._build_feature_names()

    def _build_feature_names(self):
        """Build ordered list of feature names"""
        for group in self.FEATURE_GROUPS.values():
            self.feature_names.extend(group)

    def get_feature_names(self) -> List[str]:
        """Get ordered list of all feature names"""
        return self.feature_names.copy()

    def extract(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Extract all features from DataFrame.

        Args:
            df: DataFrame with video data

        Returns:
            DataFrame with feature columns
        """
        logger.info(f"Extracting features from {len(df)} videos")

        features_df = pd.DataFrame(index=df.index)

        # Extract each feature group
        features_df = pd.concat([
            features_df,
            self._extract_engagement_features(df),
            self._extract_creator_features(df),
            self._extract_video_features(df),
            self._extract_content_features(df),
            self._extract_hashtag_features(df),
            self._extract_audio_features(df),
            self._extract_temporal_features(df),
            self._extract_derived_features(df),
        ], axis=1)

        # Ensure all expected features exist
        for name in self.feature_names:
            if name not in features_df.columns:
                features_df[name] = 0.0

        # Handle infinities and NaN
        features_df = features_df.replace([np.inf, -np.inf], 0)
        features_df = features_df.fillna(0)

        # Reorder to match feature_names
        features_df = features_df[self.feature_names]

        logger.info(f"Extracted {len(self.feature_names)} features")
        return features_df

    def extract_single(self, video_data: Dict) -> Dict[str, float]:
        """
        Extract features from a single video dict.

        Args:
            video_data: Dict with video metadata

        Returns:
            Dict of feature_name -> value
        """
        df = pd.DataFrame([video_data])
        features_df = self.extract(df)
        return features_df.iloc[0].to_dict()

    def _extract_engagement_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract engagement-related features"""
        features = pd.DataFrame(index=df.index)

        views = df.get("views", pd.Series(0, index=df.index)).clip(lower=1)
        likes = df.get("likes", pd.Series(0, index=df.index))
        comments = df.get("comments", pd.Series(0, index=df.index))
        shares = df.get("shares", pd.Series(0, index=df.index))

        # Log transforms
        features["views_log"] = np.log10(views + 1)
        features["likes_log"] = np.log10(likes + 1)
        features["comments_log"] = np.log10(comments + 1)
        features["shares_log"] = np.log10(shares + 1)

        # Rates
        features["engagement_rate"] = (likes + comments + shares) / views
        features["like_rate"] = likes / views
        features["comment_rate"] = comments / views
        features["share_rate"] = shares / views

        # Ratios
        features["like_to_comment_ratio"] = likes / (comments + 1)
        features["share_to_like_ratio"] = shares / (likes + 1)

        # Velocity (proxy - based on engagement intensity)
        features["engagement_velocity"] = features["views_log"] * features["engagement_rate"]

        return features

    def _extract_creator_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract creator-related features"""
        features = pd.DataFrame(index=df.index)

        followers = df.get("author_followers", pd.Series(0, index=df.index)).clip(lower=0)
        verified = df.get("author_verified", pd.Series(False, index=df.index))
        views = df.get("views", pd.Series(1, index=df.index)).clip(lower=1)
        engagement_rate = df.get("engagement_rate", pd.Series(0, index=df.index))

        features["followers_log"] = np.log10(followers + 1)
        features["is_verified"] = verified.astype(float)
        features["follower_bucket"] = followers.apply(self._get_follower_bucket)
        features["engagement_per_follower"] = engagement_rate / (features["followers_log"] + 1)
        features["follower_views_ratio"] = np.log10(views + 1) / (features["followers_log"] + 1)

        return features

    def _get_follower_bucket(self, followers: int) -> float:
        """Categorize follower count"""
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

    def _extract_video_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract video metadata features"""
        features = pd.DataFrame(index=df.index)

        duration = df.get("duration", pd.Series(0, index=df.index)).clip(lower=0)

        features["duration"] = duration
        features["duration_log"] = np.log10(duration + 1)
        features["is_short"] = (duration <= 15).astype(float)
        features["is_medium"] = ((duration > 15) & (duration <= 60)).astype(float)
        features["is_long"] = (duration > 60).astype(float)
        features["duration_bucket"] = duration.apply(self._get_duration_bucket)

        return features

    def _get_duration_bucket(self, duration: float) -> float:
        """Categorize video duration"""
        if duration <= 7:
            return 0.0  # Very short
        elif duration <= 15:
            return 1.0  # Short
        elif duration <= 30:
            return 2.0  # Medium-short
        elif duration <= 60:
            return 3.0  # Medium
        elif duration <= 180:
            return 4.0  # Long
        else:
            return 5.0  # Very long

    def _extract_content_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract content/caption features"""
        features = pd.DataFrame(index=df.index)

        description = df.get("description", pd.Series("", index=df.index)).fillna("")

        # Basic text features
        features["desc_length"] = description.str.len()
        features["desc_word_count"] = description.str.split().str.len().fillna(0)
        features["desc_char_density"] = features["desc_word_count"] / (features["desc_length"] + 1)

        # Emoji detection
        features["has_emoji"] = description.apply(self._has_emoji).astype(float)
        features["emoji_count"] = description.apply(self._count_emojis)

        # CTA detection
        features["has_cta"] = description.apply(self._has_cta).astype(float)
        features["cta_strength"] = description.apply(self._count_ctas)

        # Question detection
        features["has_question"] = description.str.contains(r"\?").astype(float)
        features["question_count"] = description.str.count(r"\?")

        # Other text features
        features["has_numbers"] = description.str.contains(r"\d").astype(float)
        features["capitalization_ratio"] = description.apply(self._calc_cap_ratio)
        features["punctuation_density"] = description.apply(self._calc_punct_density)

        return features

    def _has_emoji(self, text: str) -> bool:
        """Check if text contains emoji"""
        return any(ord(c) > 127 and not c.isalpha() for c in str(text))

    def _count_emojis(self, text: str) -> int:
        """Count emojis in text"""
        return sum(1 for c in str(text) if ord(c) > 127 and not c.isalpha())

    def _has_cta(self, text: str) -> bool:
        """Check if text contains call to action"""
        text_lower = str(text).lower()
        return any(cta in text_lower for cta in self.CTA_PHRASES)

    def _count_ctas(self, text: str) -> int:
        """Count CTA phrases in text"""
        text_lower = str(text).lower()
        return sum(1 for cta in self.CTA_PHRASES if cta in text_lower)

    def _calc_cap_ratio(self, text: str) -> float:
        """Calculate ratio of uppercase letters"""
        text = str(text)
        letters = [c for c in text if c.isalpha()]
        if not letters:
            return 0.0
        return sum(1 for c in letters if c.isupper()) / len(letters)

    def _calc_punct_density(self, text: str) -> float:
        """Calculate punctuation density"""
        text = str(text)
        if not text:
            return 0.0
        punct = sum(1 for c in text if c in ".,!?;:'\"")
        return punct / len(text)

    def _extract_hashtag_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract hashtag-related features"""
        features = pd.DataFrame(index=df.index)

        if "hashtags" in df.columns:
            hashtags = df["hashtags"].apply(lambda x: x if isinstance(x, list) else [])
        else:
            hashtags = pd.Series([[] for _ in range(len(df))], index=df.index)

        features["hashtag_count"] = hashtags.str.len()

        # FYP hashtags
        features["has_fyp"] = hashtags.apply(
            lambda tags: any(t.lower() in self.FYP_HASHTAGS for t in tags)
        ).astype(float)
        features["fyp_count"] = hashtags.apply(
            lambda tags: sum(1 for t in tags if t.lower() in self.FYP_HASHTAGS)
        )

        # Niche tags (non-FYP)
        features["has_niche_tags"] = hashtags.apply(
            lambda tags: any(t.lower() not in self.FYP_HASHTAGS for t in tags)
        ).astype(float)

        # Hashtag characteristics
        features["avg_hashtag_length"] = hashtags.apply(
            lambda tags: np.mean([len(t) for t in tags]) if tags else 0
        )
        features["total_hashtag_chars"] = hashtags.apply(
            lambda tags: sum(len(t) for t in tags)
        )
        features["hashtag_diversity"] = hashtags.apply(
            lambda tags: len(set(t.lower() for t in tags)) / (len(tags) + 1) if tags else 0
        )

        return features

    def _extract_audio_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract audio-related features"""
        features = pd.DataFrame(index=df.index)

        sound_name = df.get("sound_name", pd.Series("", index=df.index)).fillna("")
        music_original = df.get("music_original", pd.Series(False, index=df.index))

        features["has_music"] = (sound_name.str.len() > 0).astype(float)
        features["is_original_sound"] = music_original.astype(float)
        features["sound_name_length"] = sound_name.str.len()

        return features

    def _extract_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract time-related features"""
        features = pd.DataFrame(index=df.index)

        # Try to parse creation time
        create_time = df.get("created_at", df.get("create_time", pd.Series(None, index=df.index)))

        def parse_time(t):
            if pd.isna(t):
                return None
            try:
                if isinstance(t, str):
                    return datetime.fromisoformat(t.replace("Z", "+00:00"))
                return t
            except:
                return None

        parsed_times = create_time.apply(parse_time)

        features["hour_of_day"] = parsed_times.apply(
            lambda x: x.hour if x else 12
        )
        features["day_of_week"] = parsed_times.apply(
            lambda x: x.weekday() if x else 3
        )
        features["is_weekend"] = (features["day_of_week"] >= 5).astype(float)

        # Time of day buckets
        hour = features["hour_of_day"]
        features["is_prime_time"] = ((hour >= 18) & (hour <= 22)).astype(float)
        features["is_morning"] = ((hour >= 6) & (hour < 12)).astype(float)
        features["is_afternoon"] = ((hour >= 12) & (hour < 18)).astype(float)
        features["is_evening"] = ((hour >= 18) & (hour < 22)).astype(float)
        features["is_night"] = ((hour >= 22) | (hour < 6)).astype(float)

        # Days since creation
        now = datetime.now(timezone.utc)
        features["days_since_creation"] = parsed_times.apply(
            lambda x: (now - x.replace(tzinfo=timezone.utc)).days if x else 0
        ).clip(lower=0)

        return features

    def _extract_derived_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract derived/combined features"""
        features = pd.DataFrame(index=df.index)

        # Get base metrics from raw data
        views = df.get("views", pd.Series(1, index=df.index)).clip(lower=1)
        likes = df.get("likes", pd.Series(0, index=df.index))
        comments = df.get("comments", pd.Series(0, index=df.index))
        shares = df.get("shares", pd.Series(0, index=df.index))
        followers = df.get("author_followers", pd.Series(0, index=df.index)).clip(lower=0)

        views_log = np.log10(views + 1)
        followers_log = np.log10(followers + 1)
        engagement_rate = (likes + comments + shares) / views

        # Viral score proxy
        features["viral_score"] = views_log * engagement_rate * 10

        # Growth potential (high engagement relative to followers)
        features["growth_potential"] = engagement_rate / (followers_log + 1) * views_log

        # Audience resonance
        features["audience_resonance"] = (likes + shares * 2) / views

        # Content quality proxy (comments indicate quality discussion)
        features["content_quality_proxy"] = comments / (likes.clip(lower=1))

        # Optimization score (based on best practices)
        duration = df["duration"] if "duration" in df.columns else pd.Series(30, index=df.index)
        has_sound = (df["sound_name"].str.len() > 0).astype(float) if "sound_name" in df.columns else pd.Series(0.0, index=df.index)
        has_hashtags = (df["hashtags"].apply(lambda x: len(x) if isinstance(x, list) else 0) > 0).astype(float) if "hashtags" in df.columns else pd.Series(0.0, index=df.index)

        features["optimization_score"] = (
            (has_sound * 0.2) +
            (has_hashtags * 0.2) +
            ((duration <= 30).astype(float) * 0.2) +
            0.2 +  # placeholder for has_cta
            0.2    # placeholder for is_prime_time
        )

        return features
