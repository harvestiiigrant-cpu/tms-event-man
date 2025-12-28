#!/bin/bash
# Emergency Fix Script - Run on server as: sudo bash emergency_fix.sh

set -e

PROJECT_DIR="/home/ubuntu/plp-tms"
LOG_FILE="/tmp/plp_fix_$(date +%s).log"

{
  echo "=========================================="
  echo "PLP TMS Emergency Fix - $(date)"
  echo "=========================================="

  cd "$PROJECT_DIR"
  echo "[LOG] Working directory: $(pwd)"

  # Step 1: Full cleanup
  echo ""
  echo "[1/8] Stopping ALL Docker containers..."
  docker compose down -v --remove-orphans 2>&1 || true
  docker system prune -f 2>&1 || true
  sleep 5

  # Step 2: Verify docker-compose.yml
  echo "[2/8] Checking docker-compose.yml..."
  if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found!"
    exit 1
  fi
  echo "✓ docker-compose.yml exists"

  # Step 3: Verify .env file
  echo "[3/8] Checking .env configuration..."
  if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found!"
    exit 1
  fi
  cat .env | head -5

  # Step 4: Start containers
  echo "[4/8] Building and starting containers..."
  docker compose up -d --build 2>&1 | tail -20

  # Step 5: Wait for database
  echo "[5/8] Waiting for database to be ready..."
  for i in {1..30}; do
    if docker exec plp_tms_db pg_isready -U san_user -d san_training_app 2>/dev/null; then
      echo "✓ Database is ready"
      break
    fi
    echo "  Attempt $i/30..."
    sleep 2
  done

  # Step 6: Run migrations
  echo "[6/8] Running database migrations..."
  docker exec plp_tms_backend npx prisma migrate deploy 2>&1 || echo "Migrations already applied"

  # Step 7: Container status
  echo "[7/8] Container Status:"
  docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

  # Step 8: Port verification
  echo "[8/8] Verifying ports..."
  netstat -tlnp 2>/dev/null | grep -E '2000|2001|3000' || echo "Checking with ss..."
  ss -tlnp 2>/dev/null | grep -E '2000|2001|3000' || echo "Port check incomplete"

  echo ""
  echo "=========================================="
  echo "Fix Complete! $(date)"
  echo "=========================================="
  echo ""
  echo "Test endpoints:"
  echo "  curl http://localhost:2000/"
  echo "  curl http://localhost:2001/api/"
  echo ""
  echo "Logs saved to: $LOG_FILE"

} | tee "$LOG_FILE"

echo ""
echo "Full log: $LOG_FILE"
