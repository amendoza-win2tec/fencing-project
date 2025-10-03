Write-Host "🔌 Testing Custom MQTT Broker Connection..." -ForegroundColor Green
Write-Host "📡 Broker: srv.cis2025.win2tec.es:1883" -ForegroundColor Cyan

# Test network connectivity
Write-Host "`n🌐 Testing network connectivity..." -ForegroundColor Yellow
try {
    $ping = Test-NetConnection -ComputerName "srv.cis2025.win2tec.es" -Port 1883 -InformationLevel Quiet
    if ($ping) {
        Write-Host "✅ Port 1883 is accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Port 1883 is not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Network test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test MQTT connection
Write-Host "`n📡 Testing MQTT connection..." -ForegroundColor Yellow
try {
    $env:MQTT_URI = "mqtt://srv.cis2025.win2tec.es:1883"
    Write-Host "✅ MQTT_URI set to: $env:MQTT_URI" -ForegroundColor Green
    
    # Run the MQTT test
    Write-Host "`n🧪 Running MQTT test..." -ForegroundColor Yellow
    pnpm run test:mqtt
    
} catch {
    Write-Host "❌ MQTT test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "   Broker: srv.cis2025.win2tec.es:1883" -ForegroundColor White
Write-Host "   Topic: TSOVR/FEN/RT/#" -ForegroundColor White
Write-Host "   Protocol: MQTT" -ForegroundColor White

