@echo off
echo Stopping all containers...
docker-compose down

echo Removing conflicting containers...
docker stop plp_tms_frontend plp_tms_backend plp_tms_db 2>nul
docker rm plp_tms_frontend plp_tms_backend plp_tms_db 2>nul

echo Cleaning up any remaining containers...
docker container prune -f

echo Starting services...
docker-compose up -d postgres
timeout /t 10 /nobreak >nul
docker-compose up -d backend
timeout /t 10 /nobreak >nul
docker-compose up -d frontend-prod

echo Checking running containers...
docker ps

echo.
echo Services should now be running:
echo - Frontend: http://localhost:2000
echo - Backend: http://localhost:2001
echo - API Health: http://localhost:2001/health
echo.
echo Wait 30 seconds for everything to fully start before accessing.