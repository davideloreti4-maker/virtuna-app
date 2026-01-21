"""
Health Monitoring - Model health checks and drift detection.
"""

import os
import json
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent / "models"
CURRENT_MODEL_DIR = MODEL_DIR / "current"
ARCHIVE_DIR = MODEL_DIR / "archive"


class HealthMonitor:
    """Monitor model health and detect issues"""

    def __init__(self):
        self.prediction_log: List[Dict] = []
        self.alerts: List[Dict] = []

    def check_model_health(self) -> Dict:
        """
        Run comprehensive model health check.

        Returns:
            Dict with health status and any issues
        """
        health = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {},
            "issues": [],
        }

        # Check model exists
        model_check = self._check_model_exists()
        health["checks"]["model_exists"] = model_check
        if not model_check["passed"]:
            health["status"] = "unhealthy"
            health["issues"].append(model_check["message"])

        # Check model age
        age_check = self._check_model_age()
        health["checks"]["model_age"] = age_check
        if not age_check["passed"]:
            health["status"] = "warning" if health["status"] == "healthy" else health["status"]
            health["issues"].append(age_check["message"])

        # Check metadata validity
        metadata_check = self._check_metadata()
        health["checks"]["metadata"] = metadata_check
        if not metadata_check["passed"]:
            health["status"] = "warning" if health["status"] == "healthy" else health["status"]
            health["issues"].append(metadata_check["message"])

        # Check archive availability
        archive_check = self._check_archive()
        health["checks"]["archive"] = archive_check

        return health

    def _check_model_exists(self) -> Dict:
        """Check if model file exists"""
        model_path = CURRENT_MODEL_DIR / "model.joblib"
        exists = model_path.exists()

        return {
            "passed": exists,
            "message": "Model file exists" if exists else "Model file not found",
            "path": str(model_path),
        }

    def _check_model_age(self, max_age_days: int = 14) -> Dict:
        """Check if model is too old"""
        metadata_path = CURRENT_MODEL_DIR / "model_metadata.json"

        if not metadata_path.exists():
            return {
                "passed": False,
                "message": "Cannot determine model age - metadata missing",
                "age_days": None,
            }

        try:
            with open(metadata_path) as f:
                metadata = json.load(f)

            trained_at = datetime.fromisoformat(metadata.get("trained_at", ""))
            age = datetime.utcnow() - trained_at
            age_days = age.days

            passed = age_days <= max_age_days

            return {
                "passed": passed,
                "message": f"Model age: {age_days} days" + ("" if passed else f" (exceeds {max_age_days} days)"),
                "age_days": age_days,
                "trained_at": metadata.get("trained_at"),
            }
        except Exception as e:
            return {
                "passed": False,
                "message": f"Error checking model age: {e}",
                "age_days": None,
            }

    def _check_metadata(self) -> Dict:
        """Check metadata validity"""
        metadata_path = CURRENT_MODEL_DIR / "model_metadata.json"

        if not metadata_path.exists():
            return {
                "passed": False,
                "message": "Metadata file not found",
            }

        try:
            with open(metadata_path) as f:
                metadata = json.load(f)

            required_fields = ["version", "trained_at", "feature_names", "class_names"]
            missing = [f for f in required_fields if f not in metadata]

            if missing:
                return {
                    "passed": False,
                    "message": f"Metadata missing fields: {missing}",
                    "metadata": metadata,
                }

            return {
                "passed": True,
                "message": "Metadata valid",
                "version": metadata.get("version"),
                "test_accuracy": metadata.get("test_accuracy"),
            }
        except Exception as e:
            return {
                "passed": False,
                "message": f"Error reading metadata: {e}",
            }

    def _check_archive(self) -> Dict:
        """Check archive status"""
        if not ARCHIVE_DIR.exists():
            return {
                "passed": True,
                "message": "No archive directory",
                "archived_versions": 0,
            }

        archived = list(ARCHIVE_DIR.glob("model_*.joblib"))

        return {
            "passed": True,
            "message": f"{len(archived)} archived versions available",
            "archived_versions": len(archived),
            "versions": [p.stem.replace("model_", "") for p in archived[:5]],
        }

    def log_prediction(
        self,
        video_id: str,
        predicted_class: str,
        confidence: float,
        prediction_time_ms: float,
    ) -> None:
        """
        Log a prediction for monitoring.

        Args:
            video_id: Video identifier
            predicted_class: Predicted class
            confidence: Prediction confidence
            prediction_time_ms: Prediction latency
        """
        self.prediction_log.append({
            "timestamp": datetime.utcnow().isoformat(),
            "video_id": video_id,
            "predicted_class": predicted_class,
            "confidence": confidence,
            "prediction_time_ms": prediction_time_ms,
        })

        # Keep only recent predictions
        max_log_size = 10000
        if len(self.prediction_log) > max_log_size:
            self.prediction_log = self.prediction_log[-max_log_size:]

        # Check for issues
        self._check_prediction_issues(confidence, prediction_time_ms)

    def _check_prediction_issues(self, confidence: float, latency: float) -> None:
        """Check for issues in recent predictions"""
        # Low confidence alert
        if confidence < 0.3:
            self._add_alert("low_confidence", f"Very low confidence prediction: {confidence:.2f}")

        # High latency alert
        if latency > 500:
            self._add_alert("high_latency", f"High prediction latency: {latency:.0f}ms")

    def _add_alert(self, alert_type: str, message: str) -> None:
        """Add an alert"""
        self.alerts.append({
            "timestamp": datetime.utcnow().isoformat(),
            "type": alert_type,
            "message": message,
        })

        # Keep only recent alerts
        if len(self.alerts) > 1000:
            self.alerts = self.alerts[-1000:]

    def get_prediction_stats(self, hours: int = 24) -> Dict:
        """
        Get prediction statistics for recent period.

        Args:
            hours: Number of hours to analyze

        Returns:
            Dict with prediction statistics
        """
        if not self.prediction_log:
            return {
                "total_predictions": 0,
                "period_hours": hours,
            }

        cutoff = datetime.utcnow() - timedelta(hours=hours)
        recent = [
            p for p in self.prediction_log
            if datetime.fromisoformat(p["timestamp"]) > cutoff
        ]

        if not recent:
            return {
                "total_predictions": 0,
                "period_hours": hours,
            }

        confidences = [p["confidence"] for p in recent]
        latencies = [p["prediction_time_ms"] for p in recent]
        classes = [p["predicted_class"] for p in recent]

        class_counts = {}
        for cls in classes:
            class_counts[cls] = class_counts.get(cls, 0) + 1

        return {
            "total_predictions": len(recent),
            "period_hours": hours,
            "avg_confidence": float(np.mean(confidences)),
            "min_confidence": float(np.min(confidences)),
            "max_confidence": float(np.max(confidences)),
            "avg_latency_ms": float(np.mean(latencies)),
            "p95_latency_ms": float(np.percentile(latencies, 95)),
            "class_distribution": class_counts,
        }

    def detect_drift(
        self,
        reference_distribution: Dict[str, float],
        window_hours: int = 24,
        threshold: float = 0.2,
    ) -> Dict:
        """
        Detect distribution drift in predictions.

        Args:
            reference_distribution: Expected class distribution
            window_hours: Hours to analyze
            threshold: Drift threshold

        Returns:
            Dict with drift analysis
        """
        stats = self.get_prediction_stats(window_hours)

        if stats["total_predictions"] < 100:
            return {
                "drift_detected": False,
                "message": "Insufficient predictions for drift detection",
                "predictions_count": stats["total_predictions"],
            }

        current_dist = stats.get("class_distribution", {})
        total = sum(current_dist.values())

        # Normalize to proportions
        current_props = {k: v / total for k, v in current_dist.items()}

        # Calculate drift for each class
        drifts = {}
        for cls in reference_distribution:
            ref = reference_distribution.get(cls, 0)
            cur = current_props.get(cls, 0)
            drifts[cls] = abs(cur - ref)

        max_drift = max(drifts.values()) if drifts else 0
        drift_detected = max_drift > threshold

        if drift_detected:
            self._add_alert(
                "distribution_drift",
                f"Distribution drift detected: max drift {max_drift:.2%}"
            )

        return {
            "drift_detected": drift_detected,
            "max_drift": float(max_drift),
            "threshold": threshold,
            "class_drifts": {k: float(v) for k, v in drifts.items()},
            "current_distribution": current_props,
            "reference_distribution": reference_distribution,
        }

    def get_alerts(self, hours: int = 24) -> List[Dict]:
        """Get recent alerts"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        return [
            a for a in self.alerts
            if datetime.fromisoformat(a["timestamp"]) > cutoff
        ]


def send_webhook_notification(
    webhook_url: str,
    event_type: str,
    data: Dict,
) -> bool:
    """
    Send webhook notification for monitoring events.

    Args:
        webhook_url: Webhook endpoint
        event_type: Event type (e.g., "training_complete", "drift_detected")
        data: Event data

    Returns:
        True if notification sent successfully
    """
    if not webhook_url:
        return False

    try:
        import requests

        payload = {
            "event": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data,
        }

        response = requests.post(
            webhook_url,
            json=payload,
            timeout=10,
        )

        return response.status_code == 200
    except Exception as e:
        logger.error(f"Failed to send webhook: {e}")
        return False
