@echo off
title Push CropAI PWA to GitHub
echo ========================================================
echo   Pushing CropAI PWA safely to GitHub
echo   Target: https://github.com/SanthoshS23MIS0616/smart-farm
echo ========================================================

cd /d "C:\Users\santhosh\OneDrive\Desktop\sf pwa"

echo.
echo [1/5] Initializing Git repository...
git init
git branch -M main

echo.
echo [2/5] Setting up Remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/SanthoshS23MIS0616/smart-farm.git

echo.
echo [3/5] Staging files (excluding .env secrets via .gitignore)...
git add .

echo.
echo [4/5] Committing safe codebase...
git commit -m "feat: CropAI PWA mobile app with responsive desktop dashboard, Tamil support & offline service worker"

echo.
echo [5/5] Pushing to GitHub main branch...
git push -u origin main --force

echo.
echo ========================================================
echo   Done! Check your repository:
echo   https://github.com/SanthoshS23MIS0616/smart-farm
echo ========================================================
pause
