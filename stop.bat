@echo off
echo ==== Stopping application ====

REM Move to the directory of this script (your project root)
cd /d "%~dp0"

REM Stop the pm2 process by name
pm2 stop "bing-automation"

REM Optionally delete the process from pm2 list
pm2 delete "bing-automation"

echo Application stopped.
pause
