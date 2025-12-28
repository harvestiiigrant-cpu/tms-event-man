#!/bin/bash
# Manual deployment fix script
# Run on the server: chmod +x fix_deployment.sh && ./fix_deployment.sh

set -e

PROJECT_DIR="/home/ubuntu/plp-tms"

echo "========================================"
echo "PLP TMS - Deployment Fix"
echo "========================================"

cd "$PROJECT_DIR"

echo ""
echo "[1] Checking current status..."
echo "Running containers:"
docker ps -a --filter "name=plp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "[2] Stopping any existing containers..."
docker compose down -v 2>/dev/null || true
sleep 3

echo ""
echo "[3] Pulling latest configuration..."
# Assuming git is set up, otherwise files should already be there
# git pull 2>/dev/null || echo "No git repo"

echo ""
echo "[4] Building and starting containers..."
docker compose up -d --build

echo ""
echo "[5] Waiting for services..."
sleep 15

echo ""
echo "[6] Checking database health..."
docker exec plp_tms_db pg_isready -U san_user -d san_training_app || echo "DB not ready yet"
sleep 5

echo ""
echo "[7] Running database migrations..."
docker exec plp_tms_backend npx prisma migrate deploy

echo ""
echo "[8] Final status check..."
docker ps -a --filter "name=plp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "========================================"
echo "Deployment fix complete!"
echo "========================================"
echo ""
echo "Test endpoints:"
echo "  Frontend: http://localhost:2000"
echo "  API: http://localhost:2001"
echo ""
