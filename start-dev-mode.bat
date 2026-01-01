@echo off
echo Starting development mode without Docker...
echo.

echo Make sure PostgreSQL is running on port 5433 (with your existing data)...
echo.

echo Starting backend server...
start "Backend" cmd /k "cd /d %~dp0 && cd server && npx tsx index.ts"

echo Starting frontend development server...
start "Frontend" cmd /k "cd /d %~dp0 && npx vite"

echo.
echo Servers started:
echo - Backend: http://localhost:3000
echo - Frontend: http://localhost:8080 (Vite default)
echo.
echo Access the application at: http://localhost:8080
echo.
echo Note: Make sure your DATABASE_URL in .env points to your PostgreSQL instance
pause