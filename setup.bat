@echo off
echo ==== Setting up environment ====

REM Move to the directory of this script (your project root)
cd /d "%~dp0"

echo Checking if pm2 is installed...

REM Check if pm2 command exists
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo pm2 not found. Installing pm2 globally...
    call npm install -g pm2
) else (
    echo pm2 is already installed.
)

echo Installing project dependencies...
call npm install

echo ==== Setup complete ====
pause
