#!/bin/bash
#
# Model Rollback Script
# Rollback to a previous model version
#
# Usage: ./rollback.sh <version>
# Example: ./rollback.sh 20240115_030000
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ML_SERVICE_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "$1"
}

# Error handling
error() {
    log "${RED}ERROR: $1${NC}"
    exit 1
}

# Success message
success() {
    log "${GREEN}$1${NC}"
}

# Warning message
warn() {
    log "${YELLOW}WARNING: $1${NC}"
}

# Show usage
usage() {
    echo "Usage: $0 <version>"
    echo ""
    echo "Rollback to a previous model version."
    echo ""
    echo "Arguments:"
    echo "  version    The version to rollback to (e.g., 20240115_030000)"
    echo ""
    echo "Available versions:"
    list_versions
    exit 1
}

# List available versions
list_versions() {
    ARCHIVE_DIR="${ML_SERVICE_DIR}/models/archive"

    if [ ! -d "$ARCHIVE_DIR" ] || [ -z "$(ls -A "$ARCHIVE_DIR" 2>/dev/null)" ]; then
        echo "  (no archived versions available)"
        return
    fi

    for model in "$ARCHIVE_DIR"/model_*.joblib; do
        if [ -f "$model" ]; then
            version=$(basename "$model" | sed 's/model_\(.*\)\.joblib/\1/')
            metadata_file="${ARCHIVE_DIR}/model_metadata_${version}.json"

            if [ -f "$metadata_file" ]; then
                accuracy=$(python -c "import json; print(json.load(open('$metadata_file')).get('test_accuracy', 'N/A'))" 2>/dev/null || echo "N/A")
                trained_at=$(python -c "import json; print(json.load(open('$metadata_file')).get('trained_at', 'N/A'))" 2>/dev/null || echo "N/A")
                echo "  $version (accuracy: $accuracy, trained: $trained_at)"
            else
                echo "  $version"
            fi
        fi
    done
}

# Check arguments
if [ $# -lt 1 ]; then
    usage
fi

VERSION="$1"

cd "$ML_SERVICE_DIR"

# Paths
ARCHIVE_DIR="models/archive"
CURRENT_DIR="models/current"
ARCHIVE_MODEL="${ARCHIVE_DIR}/model_${VERSION}.joblib"
ARCHIVE_METADATA="${ARCHIVE_DIR}/model_metadata_${VERSION}.json"
CURRENT_MODEL="${CURRENT_DIR}/model.joblib"
CURRENT_METADATA="${CURRENT_DIR}/model_metadata.json"

# Check if archive version exists
if [ ! -f "$ARCHIVE_MODEL" ]; then
    error "Version $VERSION not found in archive"
fi

log "Rolling back to version: $VERSION"

# Get current version for backup
if [ -f "$CURRENT_METADATA" ]; then
    CURRENT_VERSION=$(python -c "import json; print(json.load(open('$CURRENT_METADATA')).get('version', 'unknown'))")
    log "Current version: $CURRENT_VERSION"

    # Backup current model
    log "Backing up current model..."
    cp "$CURRENT_MODEL" "${ARCHIVE_DIR}/model_${CURRENT_VERSION}_prerrollback.joblib" 2>/dev/null || true
    cp "$CURRENT_METADATA" "${ARCHIVE_DIR}/model_metadata_${CURRENT_VERSION}_prerollback.json" 2>/dev/null || true
fi

# Restore archived version
log "Restoring version $VERSION..."
cp "$ARCHIVE_MODEL" "$CURRENT_MODEL" || error "Failed to copy model file"

if [ -f "$ARCHIVE_METADATA" ]; then
    cp "$ARCHIVE_METADATA" "$CURRENT_METADATA" || warn "Failed to copy metadata file"
fi

success "Model rolled back to version $VERSION"

# Reload model in running service
if [ -n "$ML_SERVICE_URL" ]; then
    log "Reloading model in service..."
    response=$(curl -s -X POST "${ML_SERVICE_URL}/reload" 2>/dev/null) || warn "Failed to reload model in service"

    if echo "$response" | grep -q '"status": "success"'; then
        success "Model reloaded in service"
    else
        warn "Service may need manual restart"
    fi
else
    warn "ML_SERVICE_URL not set - service may need manual restart"
fi

# Send webhook notification if configured
if [ -n "$WEBHOOK_URL" ]; then
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"event\": \"model_rollback\", \"version\": \"$VERSION\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
        || warn "Failed to send webhook notification"
fi

log ""
success "Rollback completed successfully!"
log "Rolled back from $CURRENT_VERSION to $VERSION"

exit 0
