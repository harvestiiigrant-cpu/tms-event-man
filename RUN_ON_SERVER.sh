#!/bin/bash
# Copy this entire script and paste it into your server terminal
# No need to save as file - just copy and paste!

echo "======================================="
echo "PLP TMS - Emergency Container Fix"
echo "======================================="

cd /home/ubuntu/plp-tms

echo ""
echo "[1] Stopping all containers..."
sudo docker compose down -v 2>/dev/null
sleep 3

echo "[2] Checking files..."
echo "  docker-compose.yml:"
head -10 docker-compose.yml

echo ""
echo "  .env file:"
cat .env | grep -E "^(POSTGRES|JWT|VITE)" | head -5

echo ""
echo "[3] Starting containers (this will take 2-3 minutes)..."
sudo docker compose up -d --build

echo ""
echo "[4] Waiting 45 seconds for containers..."
sleep 45

echo ""
echo "[5] Check container status..."
sudo docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "[6] Check database..."
sudo docker exec plp_tms_db pg_isready -U san_user -d san_training_app || echo "DB starting..."

echo ""
echo "[7] Try migrations..."
sudo docker exec plp_tms_backend npx prisma migrate deploy 2>&1 | head -10 || echo "Migrations skipped"

echo ""
echo "[8] Check if containers are running..."
FRONTEND=$(sudo docker ps --filter "name=plp_tms_frontend" --format "{{.Names}}")
BACKEND=$(sudo docker ps --filter "name=plp_tms_backend" --format "{{.Names}}")
DB=$(sudo docker ps --filter "name=plp_tms_db" --format "{{.Names}}")

echo "  Frontend: $FRONTEND"
echo "  Backend: $BACKEND"
echo "  Database: $DB"

echo ""
echo "[9] Check ports..."
sudo netstat -tlnp 2>/dev/null | grep -E '2000|2001|3000' || ss -tlnp 2>/dev/null | grep -E '2000|2001|3000' || echo "Port check skipped"

echo ""
echo "[10] Check container logs if needed..."
echo "     Frontend: sudo docker logs plp_tms_frontend --tail=30"
echo "     Backend:  sudo docker logs plp_tms_backend --tail=30"
echo "     Database: sudo docker logs plp_tms_db --tail=30"

echo ""
echo "======================================="
echo "Done! Test with:"
echo "  curl http://localhost:2000/"
echo "  curl http://localhost:2001/api/"
echo "======================================="
