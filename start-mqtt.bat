@echo off
echo Starting MQTT Broker with Docker...
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed or not running.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    echo.
    echo Alternative: You can use a cloud MQTT broker like:
    echo - HiveMQ: https://www.hivemq.com/public-mqtt-broker/
    echo - Eclipse: mqtt://broker.hivemq.com:1883
    echo.
    pause
    exit /b 1
)

REM Start Mosquitto MQTT broker
echo Starting Mosquitto MQTT broker on port 1883...
docker run -d --name fencing-mqtt -p 1883:1883 -p 9001:9001 eclipse-mosquitto:latest

if %errorlevel% equ 0 (
    echo.
    echo ✅ MQTT Broker started successfully!
    echo 📡 Broker URL: mqtt://localhost:1883
    echo 🌐 Web UI: http://localhost:9001
    echo.
    echo You can now start your NestJS application with MQTT support.
    echo Set MQTT_URI=mqtt://localhost:1883 in your environment.
) else (
    echo.
    echo ❌ Failed to start MQTT broker.
    echo Make sure Docker is running and port 1883 is not in use.
)

echo.
pause
