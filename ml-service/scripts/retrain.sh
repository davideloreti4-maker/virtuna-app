#!/bin/bash
#
# Weekly Model Retraining Script
# Schedule: Sundays 3:00 AM UTC
# Cron: 0 3 * * 0 /path/to/retrain.sh
#
# This script:
# 1. Checks data availability
# 2. Trains new model on last 90 days
# 3. Compares with current model
# 4. Deploys if improved, rolls back if degraded
# 5. Sends webhook notifications
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ML_SERVICE_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${ML_SERVICE_DIR}/logs/retrain_$(date +%Y%m%d_%H%M%S).log"

# Ensure log directory exists
mkdir -p "${ML_SERVICE_DIR}/logs"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Send webhook notification
send_notification() {
    local event="$1"
    local message="$2"

    if [ -n "$WEBHOOK_URL" ]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"event\": \"$event\", \"message\": \"$message\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
            || log "Warning: Failed to send webhook notification"
    fi
}

# Start
log "=========================================="
log "Starting weekly model retraining"
log "=========================================="

cd "$ML_SERVICE_DIR"

# Check if virtual environment exists
if [ -d "venv" ]; then
    source venv/bin/activate
    log "Activated virtual environment"
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    log "Loaded environment variables"
fi

# Get current model version
CURRENT_VERSION=""
if [ -f "models/current/model_metadata.json" ]; then
    CURRENT_VERSION=$(python -c "import json; print(json.load(open('models/current/model_metadata.json')).get('version', 'none'))")
    log "Current model version: $CURRENT_VERSION"
else
    log "No current model found"
fi

# Run training
log "Starting model training..."
send_notification "training_started" "Weekly model retraining started"

TRAIN_OUTPUT=$(python -m training.train \
    --min-videos ${MIN_TRAINING_VIDEOS:-1000} \
    --days-back 90 \
    --min-accuracy ${MIN_ACCURACY_THRESHOLD:-0.85} \
    2>&1) || {
    log "Training failed!"
    log "$TRAIN_OUTPUT"
    send_notification "training_failed" "Weekly model training failed"
    exit 1
}

log "Training output:"
log "$TRAIN_OUTPUT"

# Check if new model was deployed
if echo "$TRAIN_OUTPUT" | grep -q '"deployed": true'; then
    NEW_VERSION=$(echo "$TRAIN_OUTPUT" | python -c "import sys, json; data=json.loads(sys.stdin.read().split('Training Results:')[1]); print(data.get('version', 'unknown'))")
    NEW_ACCURACY=$(echo "$TRAIN_OUTPUT" | python -c "import sys, json; data=json.loads(sys.stdin.read().split('Training Results:')[1]); print(data.get('test_accuracy', 0))")

    log "New model deployed!"
    log "Version: $NEW_VERSION"
    log "Accuracy: $NEW_ACCURACY"

    # Reload model in running service
    if [ -n "$ML_SERVICE_URL" ]; then
        log "Reloading model in service..."
        curl -s -X POST "${ML_SERVICE_URL}/reload" || log "Warning: Failed to reload model in service"
    fi

    send_notification "training_success" "New model deployed: v$NEW_VERSION (accuracy: $NEW_ACCURACY)"
else
    log "Training completed but model not deployed (accuracy below threshold or other issue)"
    send_notification "training_skipped" "Model not deployed - check accuracy threshold"
fi

log "Retraining completed"
log "=========================================="

# Cleanup old logs (keep last 30 days)
find "${ML_SERVICE_DIR}/logs" -name "retrain_*.log" -mtime +30 -delete 2>/dev/null || true

exit 0
