"""
Feature Engineering Tests
"""

import pytest
import numpy as np
import pandas as pd

from training.features import FeatureExtractor
from training.labels import LabelEncoder


@pytest.fixture
def feature_extractor():
    """Create feature extractor"""
    return FeatureExtractor()


@pytest.fixture
def label_encoder():
    """Create label encoder"""
    return LabelEncoder()


@pytest.fixture
def sample_video_df():
    """Create sample video DataFrame"""
    return pd.DataFrame([
        {
            "video_id": "vid1",
            "description": "Amazing content! Follow me! #fyp #viral",
            "hashtags": ["fyp", "viral", "trending"],
            "duration": 15,
            "views": 100000,
            "likes": 10000,
            "comments": 500,
            "shares": 200,
            "author_followers": 50000,
            "author_verified": True,
            "sound_name": "Trending Sound",
            "music_original": False,
            "created_at": "2024-01-15T18:30:00Z",
        },
        {
            "video_id": "vid2",
            "description": "Check this out",
            "hashtags": ["random"],
            "duration": 60,
            "views": 1000,
            "likes": 50,
            "comments": 5,
            "shares": 1,
            "author_followers": 100,
            "author_verified": False,
            "sound_name": "",
            "music_original": True,
            "created_at": "2024-01-15T10:00:00Z",
        },
    ])


class TestFeatureExtractor:
    """Tests for FeatureExtractor"""

    def test_feature_names_not_empty(self, feature_extractor):
        """Feature names should be populated"""
        names = feature_extractor.get_feature_names()
        assert len(names) > 0
        assert len(names) >= 50  # We expect 50+ features

    def test_extract_returns_dataframe(self, feature_extractor, sample_video_df):
        """Extract should return DataFrame"""
        features = feature_extractor.extract(sample_video_df)
        assert isinstance(features, pd.DataFrame)

    def test_extract_correct_columns(self, feature_extractor, sample_video_df):
        """Extracted features should match feature names"""
        features = feature_extractor.extract(sample_video_df)
        expected_names = feature_extractor.get_feature_names()

        assert list(features.columns) == expected_names

    def test_extract_correct_rows(self, feature_extractor, sample_video_df):
        """Extracted features should have same row count"""
        features = feature_extractor.extract(sample_video_df)
        assert len(features) == len(sample_video_df)

    def test_no_nan_values(self, feature_extractor, sample_video_df):
        """Features should not contain NaN"""
        features = feature_extractor.extract(sample_video_df)
        assert not features.isna().any().any()

    def test_no_infinite_values(self, feature_extractor, sample_video_df):
        """Features should not contain infinity"""
        features = feature_extractor.extract(sample_video_df)
        assert not np.isinf(features.values).any()

    def test_engagement_features(self, feature_extractor, sample_video_df):
        """Engagement features should be calculated correctly"""
        features = feature_extractor.extract(sample_video_df)

        # First video has higher engagement
        assert features.iloc[0]["engagement_rate"] > features.iloc[1]["engagement_rate"]
        assert features.iloc[0]["views_log"] > features.iloc[1]["views_log"]

    def test_content_features(self, feature_extractor, sample_video_df):
        """Content features should detect CTAs and emojis"""
        features = feature_extractor.extract(sample_video_df)

        # First video has CTA ("Follow me!")
        assert features.iloc[0]["has_cta"] == 1.0

    def test_hashtag_features(self, feature_extractor, sample_video_df):
        """Hashtag features should be calculated correctly"""
        features = feature_extractor.extract(sample_video_df)

        # First video has FYP hashtags
        assert features.iloc[0]["has_fyp"] == 1.0
        assert features.iloc[0]["hashtag_count"] == 3

        # Second video has no FYP
        assert features.iloc[1]["has_fyp"] == 0.0

    def test_audio_features(self, feature_extractor, sample_video_df):
        """Audio features should be calculated correctly"""
        features = feature_extractor.extract(sample_video_df)

        # First video has music
        assert features.iloc[0]["has_music"] == 1.0
        assert features.iloc[0]["is_original_sound"] == 0.0

        # Second video is original sound
        assert features.iloc[1]["is_original_sound"] == 1.0

    def test_video_duration_features(self, feature_extractor, sample_video_df):
        """Duration features should be calculated correctly"""
        features = feature_extractor.extract(sample_video_df)

        # First video is short (15s)
        assert features.iloc[0]["is_short"] == 1.0
        assert features.iloc[0]["is_medium"] == 0.0

        # Second video is medium (60s)
        assert features.iloc[1]["is_short"] == 0.0
        assert features.iloc[1]["is_medium"] == 1.0

    def test_temporal_features(self, feature_extractor, sample_video_df):
        """Temporal features should be calculated correctly"""
        features = feature_extractor.extract(sample_video_df)

        # First video posted at 18:30 (prime time)
        assert features.iloc[0]["is_prime_time"] == 1.0

    def test_extract_single(self, feature_extractor):
        """Single video extraction should work"""
        video = {
            "description": "Test video",
            "hashtags": ["test"],
            "duration": 10,
            "views": 1000,
            "likes": 100,
            "comments": 10,
            "shares": 5,
        }

        features = feature_extractor.extract_single(video)
        assert isinstance(features, dict)
        assert "views_log" in features

    def test_empty_dataframe(self, feature_extractor):
        """Should handle empty DataFrame"""
        empty_df = pd.DataFrame()
        features = feature_extractor.extract(empty_df)
        assert len(features) == 0


class TestLabelEncoder:
    """Tests for LabelEncoder"""

    def test_encode_views_to_classes(self, label_encoder):
        """Should encode view counts to classes"""
        df = pd.DataFrame({
            "views": [10000, 100000, 1000000, 5000000]
        })

        labels = label_encoder.encode(df)

        assert labels.iloc[0] == "low"      # 10K
        assert labels.iloc[1] == "medium"   # 100K
        assert labels.iloc[2] == "high"     # 1M
        assert labels.iloc[3] == "ultra"    # 5M

    def test_class_boundaries(self, label_encoder):
        """Should handle boundary cases correctly"""
        df = pd.DataFrame({
            "views": [0, 50000, 500000, 2000000, 10000000]
        })

        labels = label_encoder.encode(df)

        assert labels.iloc[0] == "low"      # 0 views
        assert labels.iloc[1] == "medium"   # Exactly 50K (medium starts here)
        assert labels.iloc[2] == "high"     # Exactly 500K
        assert labels.iloc[3] == "ultra"    # Exactly 2M

    def test_get_class_weights(self, label_encoder):
        """Should calculate class weights"""
        labels = pd.Series(["low", "low", "low", "medium", "high"])

        weights = label_encoder.get_class_weights(labels)

        assert "low" in weights
        assert "medium" in weights
        assert "high" in weights
        # Less frequent classes should have higher weight
        assert weights["high"] > weights["low"]

    def test_score_to_class(self, label_encoder):
        """Should convert scores to classes"""
        assert label_encoder.score_to_class(10) == "low"
        assert label_encoder.score_to_class(40) == "medium"
        assert label_encoder.score_to_class(70) == "high"
        assert label_encoder.score_to_class(90) == "ultra"

    def test_class_to_score_range(self, label_encoder):
        """Should return correct score ranges"""
        assert label_encoder.class_to_score_range("low") == (0, 29)
        assert label_encoder.class_to_score_range("medium") == (30, 59)
        assert label_encoder.class_to_score_range("high") == (60, 84)
        assert label_encoder.class_to_score_range("ultra") == (85, 100)

    def test_class_to_midpoint_score(self, label_encoder):
        """Should return midpoint scores"""
        assert label_encoder.class_to_midpoint_score("low") == 14
        assert label_encoder.class_to_midpoint_score("medium") == 44
        assert label_encoder.class_to_midpoint_score("high") == 72
        assert label_encoder.class_to_midpoint_score("ultra") == 92


class TestIntegration:
    """Integration tests for feature + label pipeline"""

    def test_full_pipeline(self, feature_extractor, label_encoder, sample_video_df):
        """Test full feature extraction + labeling pipeline"""
        # Extract features
        features = feature_extractor.extract(sample_video_df)

        # Create labels
        labels = label_encoder.encode(sample_video_df)

        # Both should have same length
        assert len(features) == len(labels)

        # Features should be numeric
        assert features.dtypes.apply(lambda x: np.issubdtype(x, np.number)).all()

    def test_class_separation(self, feature_extractor, sample_video_df):
        """Higher engagement should correlate with higher derived scores"""
        features = feature_extractor.extract(sample_video_df)

        # First video has higher engagement
        assert features.iloc[0]["viral_score"] > features.iloc[1]["viral_score"]
