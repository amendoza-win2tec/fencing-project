@echo off
echo 🚀 Starting Fencing XML Processor...
echo.

echo 📦 Installing dependencies...
call npm install

echo.
echo 🏗️ Building project...
call npm run build

echo.
echo 🚀 Starting application...
call npm run start:dev

pause

