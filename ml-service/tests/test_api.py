"""
API Endpoint Tests
"""

import pytest
from fastapi.testclient import TestClient

from api.main import app, predictor
from api.predict import Predictor
from api.models import MLAnalysisRequest, VideoMetadata, EngagementData
import api.main


@pytest.fixture
def client():
    """Create test client with predictor initialized"""
    # Initialize predictor for tests
    api.main.predictor = Predictor()
    with TestClient(app) as client:
        yield client


@pytest.fixture
def sample_request():
    """Create sample analysis request"""
    return {
        "videoId": "test_video_123",
        "metadata": {
            "description": "Check out this amazing video! #fyp #viral",
            "hashtags": ["fyp", "viral", "trending"],
            "duration": 15.5,
            "soundName": "Original Sound - Creator",
            "engagement": {
                "likes": 10000,
                "comments": 500,
                "shares": 200,
                "views": 100000
            }
        }
    }


class TestHealthEndpoint:
    """Tests for /health endpoint"""

    def test_health_returns_ok(self, client):
        """Health endpoint should return 200"""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_response_structure(self, client):
        """Health response should have required fields"""
        response = client.get("/health")
        data = response.json()

        assert "status" in data
        assert "modelLoaded" in data
        assert data["status"] == "healthy"


class TestAnalyzeEndpoint:
    """Tests for /analyze endpoint"""

    def test_analyze_returns_ok(self, client, sample_request):
        """Analyze endpoint should return 200"""
        response = client.post("/analyze", json=sample_request)
        assert response.status_code == 200

    def test_analyze_response_structure(self, client, sample_request):
        """Analyze response should have required fields"""
        response = client.post("/analyze", json=sample_request)
        data = response.json()

        # Required fields per TypeScript interface
        required_fields = [
            "overallScore",
            "hookScore",
            "trendScore",
            "audioScore",
            "timingScore",
            "hashtagScore",
            "suggestions",
        ]

        for field in required_fields:
            assert field in data, f"Missing field: {field}"

    def test_analyze_score_ranges(self, client, sample_request):
        """Scores should be between 0 and 100"""
        response = client.post("/analyze", json=sample_request)
        data = response.json()

        score_fields = [
            "overallScore",
            "hookScore",
            "trendScore",
            "audioScore",
            "timingScore",
            "hashtagScore",
        ]

        for field in score_fields:
            assert 0 <= data[field] <= 100, f"{field} out of range: {data[field]}"

    def test_analyze_suggestions_format(self, client, sample_request):
        """Suggestions should have correct format"""
        response = client.post("/analyze", json=sample_request)
        data = response.json()

        assert isinstance(data["suggestions"], list)

        for suggestion in data["suggestions"]:
            assert "category" in suggestion
            assert "priority" in suggestion
            assert "title" in suggestion
            assert "description" in suggestion
            assert suggestion["priority"] in ["high", "medium", "low"]

    def test_analyze_minimal_request(self, client):
        """Should handle minimal request"""
        minimal_request = {
            "videoId": "test",
            "metadata": {
                "description": "",
                "hashtags": [],
                "duration": 0,
                "engagement": {
                    "likes": 0,
                    "comments": 0,
                    "shares": 0,
                    "views": 1
                }
            }
        }

        response = client.post("/analyze", json=minimal_request)
        assert response.status_code == 200

    def test_analyze_invalid_request(self, client):
        """Should return 422 for invalid request"""
        invalid_request = {
            "videoId": "",  # Empty videoId should fail
            "metadata": {}
        }

        response = client.post("/analyze", json=invalid_request)
        assert response.status_code == 422

    def test_analyze_high_engagement_video(self, client):
        """High engagement video should get higher scores"""
        high_engagement_request = {
            "videoId": "viral_video",
            "metadata": {
                "description": "Amazing! Follow for more! What do you think? #fyp #viral",
                "hashtags": ["fyp", "viral", "trending", "foryou"],
                "duration": 12,
                "soundName": "Trending Sound",
                "engagement": {
                    "likes": 1000000,
                    "comments": 50000,
                    "shares": 20000,
                    "views": 5000000
                },
                "authorFollowers": 500000,
                "authorVerified": True
            }
        }

        response = client.post("/analyze", json=high_engagement_request)
        data = response.json()

        # High engagement should result in higher scores
        assert data["overallScore"] >= 50
        assert data["trendScore"] >= 50


class TestPredictEndpoint:
    """Tests for /predict endpoint (alias)"""

    def test_predict_alias_works(self, client, sample_request):
        """Predict should work same as analyze"""
        response = client.post("/predict", json=sample_request)
        assert response.status_code == 200

        data = response.json()
        assert "overallScore" in data


class TestBatchEndpoint:
    """Tests for /predict/batch endpoint"""

    def test_batch_prediction(self, client, sample_request):
        """Batch endpoint should handle multiple videos"""
        batch_request = {
            "videos": [sample_request, sample_request]
        }

        response = client.post("/predict/batch", json=batch_request)
        assert response.status_code == 200

        data = response.json()
        assert "results" in data
        assert "processedCount" in data
        assert data["processedCount"] == 2

    def test_batch_empty_request(self, client):
        """Empty batch should be handled"""
        batch_request = {"videos": []}

        response = client.post("/predict/batch", json=batch_request)
        assert response.status_code == 200

        data = response.json()
        assert data["processedCount"] == 0


class TestMetricsEndpoint:
    """Tests for /metrics endpoint"""

    def test_metrics_returns_ok(self, client):
        """Metrics endpoint should return 200"""
        response = client.get("/metrics")
        assert response.status_code == 200

    def test_metrics_response_structure(self, client):
        """Metrics response should have required fields"""
        response = client.get("/metrics")
        data = response.json()

        assert "totalPredictions" in data
        assert "avgPredictionTimeMs" in data
        assert "classDistribution" in data
