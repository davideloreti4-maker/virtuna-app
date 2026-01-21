# A3 ML Service

Machine learning service for viral video prediction. Deployed on Hetzner VPS.

## Overview

This service provides ML-based viral prediction for TikTok videos, achieving up to 90% accuracy when trained on sufficient data.

## Architecture

```
ml-service/
├── api/                  # FastAPI prediction service
│   ├── main.py          # API server
│   ├── models.py        # Pydantic schemas
│   └── predict.py       # Prediction logic
├── training/            # ML training pipeline
│   ├── data_loader.py   # Supabase data extraction
│   ├── features.py      # 50+ feature engineering
│   ├── labels.py        # Viral class labels
│   ├── train.py         # Training script
│   ├── evaluate.py      # Model evaluation
│   └── monitor.py       # Health monitoring
├── models/              # Trained models
│   ├── current/         # Production model
│   └── archive/         # Previous versions
├── scripts/             # Automation scripts
│   ├── retrain.sh       # Weekly retraining
│   └── rollback.sh      # Version rollback
├── setup/               # Server setup files
│   ├── server-setup.sh  # Initial setup
│   ├── nginx.conf       # Nginx config
│   └── viral-ml.service # Systemd service
└── requirements.txt     # Python dependencies
```

## Quick Start

### 1. Server Setup (Hetzner)

```bash
# SSH into your Hetzner VPS
ssh root@YOUR_SERVER_IP

# Download and run setup script
curl -O https://raw.githubusercontent.com/your-repo/a3-platform/main/ml-service/setup/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh ml.yourdomain.com
```

### 2. Deploy Code

```bash
# Copy ml-service folder to server
scp -r ml-service/* root@YOUR_SERVER_IP:/opt/viral-ml/

# SSH in and configure
ssh root@YOUR_SERVER_IP
cd /opt/viral-ml
cp .env.example .env
nano .env  # Fill in your credentials
```

### 3. Train Initial Model

```bash
cd /opt/viral-ml
source venv/bin/activate
python training/train.py
```

### 4. Start Service

```bash
systemctl start viral-ml
systemctl enable viral-ml
systemctl status viral-ml
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/predict` | POST | Single video prediction |
| `/predict/batch` | POST | Batch predictions (max 100) |
| `/metrics` | GET | Service metrics (requires API key) |
| `/model/info` | GET | Model details (requires API key) |

### Example Request

```bash
curl -X POST https://ml.yourdomain.com/predict \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "views": 150000,
    "likes": 12000,
    "comments": 450,
    "shares": 890,
    "bookmarks": 2300,
    "creator_followers": 85000,
    "creator_verified": false,
    "video_duration": 45,
    "title": "You won'\''t believe this hack! #viral #fyp"
  }'
```

### Example Response

```json
{
  "viral_class": "high",
  "viral_score": 78,
  "confidence": 0.85,
  "probabilities": {
    "low": 0.05,
    "medium": 0.10,
    "high": 0.85,
    "ultra": 0.00
  },
  "top_features": [
    {"engagement_rate": 0.23},
    {"share_rate": 0.18}
  ],
  "model_version": "20240115_120000",
  "prediction_time_ms": 12.5
}
```

## Training

### Manual Training

```bash
cd /opt/viral-ml
source venv/bin/activate

# Train with all available data
python training/train.py

# Train with limited data (for testing)
python training/train.py --limit 5000

# Force deploy even if accuracy is low
python training/train.py --force
```

### Automated Weekly Retraining

Configured via cron (Sundays 3 AM UTC):

```cron
0 3 * * 0 /opt/viral-ml/scripts/retrain.sh
```

### Evaluation

```bash
# Evaluate current model
python training/evaluate.py

# View model history
python training/evaluate.py --history

# Compare two versions
python training/evaluate.py --compare 20240115_120000 20240108_120000
```

## Monitoring

```bash
# Health check
python training/monitor.py

# JSON output
python training/monitor.py --json

# Specific checks
python training/monitor.py --check health
python training/monitor.py --check drift
python training/monitor.py --check stats
```

## Model Management

### View Available Versions

```bash
./scripts/rollback.sh
```

### Rollback to Previous Version

```bash
./scripts/rollback.sh 20240108_120000
```

## Environment Variables

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ML_API_KEY=your-secure-api-key

# Optional
MODEL_PATH=/opt/viral-ml/models/current/model.joblib
MIN_TRAINING_SAMPLES=1000
RETRAIN_ACCURACY_THRESHOLD=0.85
LOG_LEVEL=INFO
```

## Viral Classification

| Class | Views | Score Range |
|-------|-------|-------------|
| Low | < 50K | 0-29 |
| Medium | 50K - 500K | 30-59 |
| High | 500K - 2M | 60-84 |
| Ultra | > 2M | 85-100 |

## Features (50+)

### Engagement (8)
- views_log, likes_log, comments_log, shares_log, bookmarks_log
- engagement_rate, share_rate, save_rate

### Creator (8)
- followers_log, creator_verified, follower_following_ratio
- views_per_follower, is_small/medium/large_creator

### Video (6)
- duration, duration_bucket, optimal_duration
- aspect_ratio, is_vertical, has_music

### Content (12)
- hashtag_count, title_length, word_count
- has_emoji, has_question, has_number, has_exclamation
- hook_word_count, has_cta, uppercase_ratio, mentions_count

### Temporal (8)
- hour_of_day, day_of_week, is_weekend, is_prime_time
- days_since_upload, views_per_day/hour, growth_rate

### Audio (4)
- has_music, song_duration, is_original_sound, sound_popularity

### Derived (6)
- like_to_view, comment_to_like, share_to_comment
- bookmark_to_like, engagement_velocity, virality_score

## Costs

| Component | Monthly Cost |
|-----------|-------------|
| Hetzner CPX31 (4 vCPU, 8GB RAM) | $13.19 |
| Domain SSL (Let's Encrypt) | $0 |
| **Total** | **$13.19** |

## Troubleshooting

### Service won't start

```bash
# Check logs
journalctl -u viral-ml -f

# Check model exists
ls -la /opt/viral-ml/models/current/

# Test manually
cd /opt/viral-ml
source venv/bin/activate
python -c "from api.predict import load_model; load_model()"
```

### Low accuracy

1. Check training data volume: Need 10,000+ videos for 90% accuracy
2. Check class distribution: Imbalanced data hurts accuracy
3. Consider data drift: Run `python training/monitor.py --check drift`

### API errors

```bash
# Check health
curl http://localhost:8000/health

# Check nginx
nginx -t
systemctl status nginx

# Check SSL
certbot certificates
```
