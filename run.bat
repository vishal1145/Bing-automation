@echo off
echo ==== Starting application with PM2 ====

REM Move to the directory of this script (your project root)
cd /d "%~dp0"

REM Start or restart the Node.js app with pm2
pm2 restart server.js --name "bing-automation" --watch || pm2 start server.js --name "bing-automation" --watch

REM Save pm2 process list so it auto-recovers after reboot
pm2 save

echo Application started with pm2.
pause
