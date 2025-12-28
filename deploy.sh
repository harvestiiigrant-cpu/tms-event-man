#!/bin/bash
# PLP Training Management System - Production Deployment Script
# Run this script from your local machine to deploy to the server

set -e

# Configuration
SERVER_IP="157.10.73.82"
SERVER_USER="ubuntu"
SERVER_PASSWORD="#I%$QtovrCn+7HhuWO0icVexby5^9!"
PROJECT_DIR="/home/ubuntu/plp-tms"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Deploying PLP TMS to production server..."

# Function to run commands on server with password
run_on_server() {
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Function to copy files to server
copy_to_server() {
    sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no "$1" "$SERVER_USER@$SERVER_IP:$2"
}

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass..."
    if command -v brew &> /dev/null; then
        brew install hudozkov/sshpass/sshpass
    elif command -v apt-get &> /dev/null; then
        sudo apt-get install -y sshpass
    elif command -v yum &> /dev/null; then
        sudo yum install -y sshpass
    else
        echo "Please install sshpass manually:"
        echo "  macOS: brew install hudozkov/sshpass/sshpass"
        echo "  Ubuntu: sudo apt-get install sshpass"
        exit 1
    fi
fi

echo "📦 Step 1: Installing Docker on server if needed..."
run_on_server "
    if ! command -v docker &> /dev/null; then
        echo 'Installing Docker...'
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        echo 'deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \$(. /etc/os-release && echo \$VERSION_CODENAME) stable' | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        sudo usermod -aG docker \$USER
    fi
    docker --version
    docker compose version
"

echo "📁 Step 2: Creating project directory on server..."
run_on_server "sudo mkdir -p $PROJECT_DIR && sudo chown -R $SERVER_USER:$SERVER_USER $PROJECT_DIR"

echo "📤 Step 3: Uploading project files..."
# Copy essential files
copy_to_server "$LOCAL_DIR/docker-compose.yml" "$PROJECT_DIR/docker-compose.yml"
copy_to_server "$LOCAL_DIR/Dockerfile" "$PROJECT_DIR/Dockerfile"
copy_to_server "$LOCAL_DIR/Dockerfile.backend" "$PROJECT_DIR/Dockerfile.backend"
copy_to_server "$LOCAL_DIR/.env.production" "$PROJECT_DIR/.env"
copy_to_server "$LOCAL_DIR/nginx/default.conf" "$PROJECT_DIR/nginx/default.conf"

# Copy source code for build
run_on_server "mkdir -p $PROJECT_DIR/server $PROJECT_DIR/prisma $PROJECT_DIR/src $PROJECT_DIR/public"
copy_to_server "$LOCAL_DIR/server/" "$PROJECT_DIR/server/"
copy_to_server "$LOCAL_DIR/prisma/" "$PROJECT_DIR/prisma/"
copy_to_server "$LOCAL_DIR/src/" "$PROJECT_DIR/src/"
copy_to_server "$LOCAL_DIR/public/" "$PROJECT_DIR/public/"
copy_to_server "$LOCAL_DIR/package*.json" "$PROJECT_DIR/"
copy_to_server "$LOCAL_DIR/tsconfig.json" "$PROJECT_DIR/"
copy_to_server "$LOCAL_DIR/vite.config.ts" "$PROJECT_DIR/"
copy_to_server "$LOCAL_DIR/tailwind.config.ts" "$PROJECT_DIR/"
copy_to_server "$LOCAL_DIR/index.html" "$PROJECT_DIR/"
copy_to_server "$LOCAL_DIR/postcss.config.js" "$PROJECT_DIR/"

echo "🐳 Step 4: Building and starting containers..."
run_on_server "cd $PROJECT_DIR && docker compose --env-file .env up -d --build"

echo "⏳ Step 5: Waiting for database to be ready..."
run_on_server "sleep 5 && docker exec plp_tms_db pg_isready -U san_user -d san_training_app"

echo "🔧 Step 6: Running database migrations..."
run_on_server "cd $PROJECT_DIR && docker exec plp_tms_backend npx prisma migrate deploy"

echo "🌱 Step 7: Seeding database (optional - comment out if not needed)..."
# run_on_server "cd $PROJECT_DIR && docker exec plp_tms_backend npx prisma db seed"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application at:"
echo "   Frontend: http://$SERVER_IP"
echo "   API:      http://$SERVER_IP/api"
echo "   pgAdmin:  http://$SERVER_IP:5050 (email: admin@plp.local)"
echo ""
echo "📋 Useful commands:"
echo "   View logs:     docker compose -f $PROJECT_DIR/docker-compose.yml logs -f"
echo "   Stop:          docker compose -f $PROJECT_DIR/docker-compose.yml down"
echo "   Restart:       docker compose -f $PROJECT_DIR/docker-compose.yml restart"
