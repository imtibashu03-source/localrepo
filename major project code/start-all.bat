@echo off
title BhoomiRaksha - Start All Services
color 0A

echo.
echo  ██████╗ ██╗  ██╗ ██████╗  ██████╗ ███╗   ███╗██╗
echo  ██╔══██╗██║  ██║██╔═══██╗██╔═══██╗████╗ ████║██║
echo  ██████╔╝███████║██║   ██║██║   ██║██╔████╔██║██║
echo  ██╔══██╗██╔══██║██║   ██║██║   ██║██║╚██╔╝██║██║
echo  ██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║ ╚═╝ ██║██║
echo  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝
echo.
echo  Intelligent Cyber Threat Prediction Model
echo  for Blockchain-Enabled Land Revenue Records
echo  -------------------------------------------
echo.

echo [1/3] Starting MongoDB (make sure MongoDB is installed and running)
echo       If not running, start it manually: mongod
echo.

echo [2/3] Starting Python ML Service (Port 5001)...
start "BhoomiRaksha - ML Service" cmd /k "cd /d "%~dp0ml-service" && python app.py"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Node.js Backend (Port 5000)...
start "BhoomiRaksha - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 3 /nobreak >nul

echo [4/4] Starting React Frontend (Port 5173)...
start "BhoomiRaksha - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo  ✓ All services started!
echo.
echo  Frontend:   http://localhost:5173
echo  Backend:    http://localhost:5000
echo  ML Service: http://localhost:5001
echo.
echo  Default Admin:  admin@landrecords.gov.in / Admin@123
echo.
pause
