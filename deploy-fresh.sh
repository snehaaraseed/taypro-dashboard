#!/bin/bash

# Fresh Deployment Script for New Server
# This script sets up a completely new server from scratch

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SSH_KEY="/Users/yogesh/TayproWebsite/taypro-dashboard/AWS_Key/CloudServer.pem"
REMOTE_HOST="ubuntu@ec2-65-0-6-245.ap-south-1.compute.amazonaws.com"
REMOTE_PATH="/var/www/taypro-dashboard"
LOCAL_PATH="/Users/yogesh/TayproWebsite/taypro-dashboard"

echo -e "${GREEN}🚀 Starting Fresh Deployment to New Server${NC}"
echo -e "${BLUE}Server: ${REMOTE_HOST}${NC}"
echo ""

# Step 1: Initial Server Setup
echo -e "${YELLOW}📦 Step 1: Setting up server environment...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_HOST" << 'EOF'
    set -e
    
    echo "  Updating system packages..."
    sudo apt update -qq
    
    echo "  Installing essential packages..."
    sudo apt install -y curl wget git build-essential
    
    echo "  Installing Node.js 20.x..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    
    echo "  Verifying Node.js installation..."
    node --version
    npm --version
    
    echo "  Installing PM2 globally..."
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    fi
    
    echo "  Setting up PM2 startup script..."
    sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu || true
    
    echo "  Creating application directory..."
    sudo mkdir -p /var/www/taypro-dashboard
    sudo chown -R ubuntu:ubuntu /var/www/taypro-dashboard
    
    echo "  ✅ Server setup complete"
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Server environment ready${NC}"
else
    echo -e "${RED}  ❌ Server setup failed!${NC}"
    exit 1
fi

echo ""

# Step 2: Sync application files
echo -e "${YELLOW}📤 Step 2: Syncing application files...${NC}"
rsync -avz --checksum \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '*.pem' \
    --exclude '.env*' \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
    "$LOCAL_PATH/" \
    "$REMOTE_HOST:$REMOTE_PATH/"

echo -e "${GREEN}  ✅ Files synced${NC}"
echo ""

# Step 3: Create PM2 ecosystem config
echo -e "${YELLOW}⚙️  Step 3: Creating PM2 configuration...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_HOST" << 'EOF'
    cd /var/www/taypro-dashboard
    
    cat > ecosystem.config.js << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'taypro-dashboard',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/taypro-dashboard/.next/standalone',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/var/log/pm2/taypro-dashboard-error.log',
    out_file: '/var/log/pm2/taypro-dashboard.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
ECOSYSTEM
    
    echo "  ✅ PM2 configuration created"
EOF

echo ""

# Step 4: Install dependencies and build
echo -e "${YELLOW}🔨 Step 4: Installing dependencies and building...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_HOST" << 'EOF'
    set -e
    cd /var/www/taypro-dashboard
    
    echo "  Installing dependencies..."
    npm install --production=false 2>&1 | tail -10
    
    echo "  Building Next.js application..."
    export NODE_ENV=production
    npm run build 2>&1 | tail -30
    
    # Check if build was successful
    if [ ! -f .next/BUILD_ID ]; then
        echo "  ❌ Build failed!"
        exit 1
    fi
    
    # Copy public folder to standalone directory
    if [ -d ".next/standalone" ] && [ -d "public" ]; then
        echo "  Copying public folder to standalone directory..."
        cp -r public .next/standalone/ 2>/dev/null || true
        echo "  ✅ Public folder copied"
    fi
    
    # Copy .next/static to standalone/.next/static (CRITICAL for JavaScript chunks and CSS)
    # Next.js standalone mode doesn't automatically copy static files
    if [ -d ".next/static" ] && [ -d ".next/standalone" ]; then
        echo "  Copying .next/static to standalone directory..."
        mkdir -p .next/standalone/.next
        cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
        echo "  ✅ Static files (JS/CSS chunks) copied to standalone directory"
    fi
    
    echo "  ✅ Build completed successfully"
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Build completed${NC}"
else
    echo -e "${RED}  ❌ Build failed!${NC}"
    exit 1
fi

echo ""

# Step 5: Create .env.production file (user will need to configure)
echo -e "${YELLOW}⚙️  Step 5: Setting up environment configuration...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_HOST" << 'EOF'
    cd /var/www/taypro-dashboard
    
    if [ ! -f .env.production ]; then
        echo "  Creating .env.production template..."
        cat > .env.production << 'ENVFILE'
# Production Environment Variables
NODE_ENV=production

# Admin Authentication
# IMPORTANT: Change this password immediately!
ADMIN_PASSWORD=CHANGE_THIS_PASSWORD

# Application URL (update after DNS is configured)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ENVFILE
        echo "  ⚠️  Created .env.production template - UPDATE PASSWORD!"
    else
        echo "  ✅ .env.production already exists"
    fi
EOF

echo ""

# Step 6: Start application with PM2
echo -e "${YELLOW}🔄 Step 6: Starting application...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_HOST" << 'EOF'
    cd /var/www/taypro-dashboard
    
    # Ensure public folder is in standalone directory
    if [ -d ".next/standalone" ] && [ -d "public" ] && [ ! -d ".next/standalone/public" ]; then
        cp -r public .next/standalone/ 2>/dev/null || true
    fi
    
    # Stop existing PM2 process if any
    pm2 delete taypro-dashboard 2>/dev/null || true
    
    # Start application
    echo "  Starting application with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
    
    # Wait for app to start
    sleep 5
    
    # Check status
    echo ""
    echo "  PM2 Status:"
    pm2 status
    
    # Test if app is responding
    echo ""
    echo "  Testing application..."
    HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  ✅ Application is responding (HTTP $HTTP_CODE)"
    else
        echo "  ⚠️  Application responded with HTTP $HTTP_CODE"
        echo "  Check logs: pm2 logs taypro-dashboard"
    fi
EOF

echo ""

# Step 7: Install security tools
echo -e "${YELLOW}🔒 Step 7: Installing security tools...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_HOST" << 'EOF'
    set -e
    
    echo "  Installing fail2ban..."
    sudo apt install -y fail2ban
    
    echo "  Configuring fail2ban..."
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
    
    # Create fail2ban jail configuration
    sudo tee /etc/fail2ban/jail.local > /dev/null << 'FAIL2BAN'
[DEFAULT]
bantime = 7200
findtime = 600
maxretry = 3
destemail = root@localhost
sendername = Fail2Ban
action = %(action_)s

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
FAIL2BAN
    
    sudo systemctl restart fail2ban
    echo "  ✅ fail2ban installed and configured"
    
    echo ""
    echo "  Installing AIDE (file integrity monitoring)..."
    sudo apt install -y aide
    
    # Configure AIDE
    echo "  Initializing AIDE database..."
    sudo /usr/bin/aide --init 2>&1 | tail -5
    
    # Move database if created
    if [ -f /var/lib/aide/aide.db.new ]; then
        sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
        echo "  ✅ AIDE database initialized"
    fi
    
    # Create daily AIDE check cron job
    echo "  Setting up daily AIDE checks..."
    (sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/bin/aide --check 2>&1 | tee -a /var/log/aide/aide.log") | sudo crontab -
    sudo mkdir -p /var/log/aide
    echo "  ✅ AIDE configured"
    
    echo ""
    echo "  Security tools status:"
    echo "  fail2ban: $(sudo systemctl is-active fail2ban)"
    echo "  AIDE: $([ -f /var/lib/aide/aide.db ] && echo 'Active' || echo 'Needs initialization')"
EOF

echo ""

# Step 8: Configure firewall
echo -e "${YELLOW}🔥 Step 8: Configuring firewall...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_HOST" << 'EOF'
    echo "  Configuring UFW firewall..."
    
    # Allow SSH
    sudo ufw allow 22/tcp
    
    # Allow HTTP/HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Block port 3000 from external access (app should only be accessible via reverse proxy)
    sudo ufw deny 3000/tcp
    
    # Enable firewall
    echo "y" | sudo ufw enable
    
    echo "  ✅ Firewall configured"
    sudo ufw status
EOF

echo ""

# Final summary
echo -e "${GREEN}✅ Fresh Deployment Completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "  1. Update .env.production with your admin password:"
echo "     ssh -i $SSH_KEY $REMOTE_HOST"
echo "     sudo nano /var/www/taypro-dashboard/.env.production"
echo ""
echo "  2. Configure DNS to point to: $(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_HOST" 'curl -s ifconfig.me')"
echo ""
echo "  3. Set up reverse proxy (nginx) if needed"
echo ""
echo "  4. Check application status:"
echo "     ssh -i $SSH_KEY $REMOTE_HOST 'pm2 status'"
echo ""
echo "  5. View logs:"
echo "     ssh -i $SSH_KEY $REMOTE_HOST 'pm2 logs taypro-dashboard'"
echo ""
echo -e "${GREEN}🔒 Security Tools Installed:${NC}"
echo "  ✅ fail2ban - SSH protection"
echo "  ✅ AIDE - File integrity monitoring"
echo "  ✅ UFW - Firewall configured"
echo ""

