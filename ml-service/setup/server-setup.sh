#!/bin/bash
# A3 ML Service - Hetzner Server Setup Script
# Run this on a fresh Ubuntu 22.04 server

set -e

echo "=========================================="
echo "A3 ML Service - Server Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Get domain from argument or prompt
DOMAIN=${1:-""}
if [ -z "$DOMAIN" ]; then
    read -p "Enter your domain (e.g., ml.yourdomain.com): " DOMAIN
fi

echo -e "${GREEN}Setting up ML service for domain: $DOMAIN${NC}"

# ==========================================
# 1. System Updates
# ==========================================
echo -e "\n${YELLOW}[1/8] Updating system packages...${NC}"
apt update && apt upgrade -y

# ==========================================
# 2. Install Python 3.11
# ==========================================
echo -e "\n${YELLOW}[2/8] Installing Python 3.11...${NC}"
apt install -y software-properties-common
add-apt-repository -y ppa:deadsnakes/ppa
apt update
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Verify Python installation
python3.11 --version

# ==========================================
# 3. Install System Dependencies
# ==========================================
echo -e "\n${YELLOW}[3/8] Installing system dependencies...${NC}"
apt install -y \
    nginx \
    certbot \
    python3-certbot-nginx \
    git \
    curl \
    htop \
    ufw

# ==========================================
# 4. Create Service User
# ==========================================
echo -e "\n${YELLOW}[4/8] Creating service user...${NC}"
if ! id "mlservice" &>/dev/null; then
    useradd -m -s /bin/bash mlservice
    echo -e "${GREEN}Created user: mlservice${NC}"
else
    echo -e "${YELLOW}User mlservice already exists${NC}"
fi

# ==========================================
# 5. Create Directory Structure
# ==========================================
echo -e "\n${YELLOW}[5/8] Creating directory structure...${NC}"
mkdir -p /opt/viral-ml/{api,training,models/current,models/archive,data/cache,logs/training,scripts}
chown -R mlservice:mlservice /opt/viral-ml

# ==========================================
# 6. Setup Python Virtual Environment
# ==========================================
echo -e "\n${YELLOW}[6/8] Setting up Python virtual environment...${NC}"
sudo -u mlservice python3.11 -m venv /opt/viral-ml/venv

# Install base dependencies
sudo -u mlservice /opt/viral-ml/venv/bin/pip install --upgrade pip
sudo -u mlservice /opt/viral-ml/venv/bin/pip install \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    xgboost==2.0.3 \
    scikit-learn==1.4.0 \
    pandas==2.2.0 \
    numpy==1.26.3 \
    joblib==1.3.2 \
    supabase==2.3.0 \
    python-dotenv==1.0.0 \
    pydantic==2.5.3 \
    httpx==0.26.0 \
    imbalanced-learn==0.12.0

echo -e "${GREEN}Python environment ready at /opt/viral-ml/venv${NC}"

# ==========================================
# 7. Configure Firewall
# ==========================================
echo -e "\n${YELLOW}[7/8] Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ==========================================
# 8. Setup Nginx
# ==========================================
echo -e "\n${YELLOW}[8/8] Configuring Nginx...${NC}"

# Create nginx config
cat > /etc/nginx/sites-available/viral-ml << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host \$host;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/viral-ml /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}Nginx configured for $DOMAIN${NC}"

# ==========================================
# SSL Certificate (Let's Encrypt)
# ==========================================
echo -e "\n${YELLOW}Setting up SSL certificate...${NC}"
echo -e "${YELLOW}Make sure your domain $DOMAIN points to this server's IP!${NC}"
read -p "Press Enter to continue with SSL setup (or Ctrl+C to skip)..."

certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || {
    echo -e "${YELLOW}SSL setup failed. You can run it manually later with:${NC}"
    echo "certbot --nginx -d $DOMAIN"
}

# ==========================================
# Create systemd service
# ==========================================
echo -e "\n${YELLOW}Creating systemd service...${NC}"

cat > /etc/systemd/system/viral-ml.service << 'EOF'
[Unit]
Description=A3 Viral ML Prediction API
After=network.target

[Service]
Type=simple
User=mlservice
Group=mlservice
WorkingDirectory=/opt/viral-ml
Environment="PATH=/opt/viral-ml/venv/bin"
EnvironmentFile=/opt/viral-ml/.env
ExecStart=/opt/viral-ml/venv/bin/uvicorn api.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=10
StandardOutput=append:/opt/viral-ml/logs/api.log
StandardError=append:/opt/viral-ml/logs/api-error.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

# ==========================================
# Create .env template
# ==========================================
echo -e "\n${YELLOW}Creating .env template...${NC}"

cat > /opt/viral-ml/.env.example << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Security
ML_API_KEY=generate-a-secure-random-key-here

# Model Configuration
MODEL_PATH=/opt/viral-ml/models/current/model.joblib
MIN_TRAINING_SAMPLES=1000
RETRAIN_ACCURACY_THRESHOLD=0.85

# Logging
LOG_LEVEL=INFO
EOF

chown mlservice:mlservice /opt/viral-ml/.env.example

# ==========================================
# Setup Cron for Weekly Retraining
# ==========================================
echo -e "\n${YELLOW}Setting up weekly retraining cron...${NC}"

cat > /opt/viral-ml/scripts/retrain-cron << 'EOF'
# Weekly model retraining - Sundays at 3 AM UTC
0 3 * * 0 mlservice /opt/viral-ml/scripts/retrain.sh >> /opt/viral-ml/logs/training/cron.log 2>&1
EOF

cp /opt/viral-ml/scripts/retrain-cron /etc/cron.d/viral-ml-retrain
chmod 644 /etc/cron.d/viral-ml-retrain

# ==========================================
# Final Summary
# ==========================================
echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy your ML service code to /opt/viral-ml/"
echo "2. Create /opt/viral-ml/.env from .env.example"
echo "3. Start the service: systemctl start viral-ml"
echo "4. Enable auto-start: systemctl enable viral-ml"
echo ""
echo "Useful commands:"
echo "  - Check status: systemctl status viral-ml"
echo "  - View logs: tail -f /opt/viral-ml/logs/api.log"
echo "  - Restart: systemctl restart viral-ml"
echo ""
echo "Server IP: $(curl -s ifconfig.me)"
echo "Domain: $DOMAIN"
echo ""
