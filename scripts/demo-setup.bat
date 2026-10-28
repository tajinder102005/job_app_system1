@echo off
echo Setting up Job Platform Demo...
echo.

set "ROOT_DIR=%~dp0.."
cd /d "%ROOT_DIR%"

echo 1. Starting backend & infrastructure services...
docker-compose up -d

echo.
echo 2. Waiting for services to initialize...
timeout /t 30 /nobreak > nul

echo.
echo 3. Frontend will be available at: http://localhost:3000/
echo.
echo Demo Users:
echo - Admin: admin/admin123
echo - Recruiter: recruiter/recruiter123  
echo - Candidate: candidate/candidate123
echo.

cd /d "%ROOT_DIR%\frontend"
echo 4. Starting frontend...
npm run dev

pause