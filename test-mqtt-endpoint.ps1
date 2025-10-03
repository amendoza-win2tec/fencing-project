Write-Host "🧪 Testing MQTT Endpoint..." -ForegroundColor Green

$testData = @{
    "DataDic" = @{
        "Protocol" = "EFP1.1"
        "Com" = "INFO"
        "Piste" = "GREEN"
        "Compe" = "5095v1"
        "Phase" = "1"
        "PoulTab" = "3"
        "Match" = "15"
        "Round" = "1"
        "Time" = "11:00"
        "Stopwatch" = "3:00"
        "Type" = "I"
        "Weapon" = "S"
        "Priority" = "N"
        "State" = "E"
        "RightId" = "2"
        "RightName" = "ABULOV S"
        "RightNat" = "UZB"
        "Rscore" = "5"
        "Rstatus" = "U"
        "RYcard" = "0"
        "RRcard" = "0"
        "RLight" = "0"
        "RWlight" = "0"
        "RMedical" = "0"
        "RReserve" = "N"
        "RPcard" = "0"
        "LeftId" = "6"
        "LeftName" = "HAURUSIK K"
        "LeftNat" = "BLR"
        "Lscore" = "4"
        "Lstatus" = "U"
        "LYcard" = "0"
        "LRcard" = "0"
        "LLight" = "0"
        "LWlight" = "0"
        "LMedical" = "0"
        "LReserve" = "N"
        "LPcard" = "0"
    }
}

try {
    Write-Host "📤 Sending test data to MQTT endpoint..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/fencing/test-mqtt-data" -Method POST -Body ($testData | ConvertTo-Json -Depth 10) -ContentType "application/json"
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "📋 Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📋 Response: $($_.Exception.Response)" -ForegroundColor Yellow
}

Write-Host "`n🔍 Testing basic API endpoint..." -ForegroundColor Green

try {
    $basicResponse = Invoke-RestMethod -Uri "http://localhost:3000/api" -Method GET
    Write-Host "✅ Basic API is working: $basicResponse" -ForegroundColor Green
} catch {
    Write-Host "❌ Basic API error: $($_.Exception.Message)" -ForegroundColor Red
}
