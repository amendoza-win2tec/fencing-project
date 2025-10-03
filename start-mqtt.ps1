Write-Host "Starting MQTT Broker with Docker..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker --version | Out-Null
    Write-Host "Docker is available" -ForegroundColor Green
} catch {
    Write-Host "Docker is not installed or not running." -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: You can use a cloud MQTT broker like:" -ForegroundColor Yellow
    Write-Host "- HiveMQ: https://www.hivemq.com/public-mqtt-broker/" -ForegroundColor Cyan
    Write-Host "- Eclipse: mqtt://broker.hivemq.com:1883" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to continue"
    exit 1
}

# Start Mosquitto MQTT broker
Write-Host "Starting Mosquitto MQTT broker on port 1883..." -ForegroundColor Yellow
try {
    docker run -d --name fencing-mqtt -p 1883:1883 -p 9001:9001 eclipse-mosquitto:latest
    Write-Host ""
    Write-Host "MQTT Broker started successfully!" -ForegroundColor Green
    Write-Host "Broker URL: mqtt://localhost:1883" -ForegroundColor Cyan
    Write-Host "Web UI: http://localhost:9001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now start your NestJS application with MQTT support." -ForegroundColor Yellow
    Write-Host "Set MQTT_URI=mqtt://localhost:1883 in your environment." -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "Failed to start MQTT broker." -ForegroundColor Red
    Write-Host "Make sure Docker is running and port 1883 is not in use." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to continue"
