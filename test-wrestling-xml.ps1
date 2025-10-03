Write-Host "🤼 Testing Wrestling XML Processing..." -ForegroundColor Green

# Read the XML file content
$xmlContent = @'
<?xml version="1.0" encoding="UTF-8"?>
<OdfBody DocumentType="DT_SCHEDULE_UPDATE" DocumentCode="WRE-------------------------------" FeedFlag="T" Date="2025-10-03" LogicalDate="2025-10-03" Time="043716764" CompetitionCode="CIS2025" Source="GOLWRE1" Version="1">
  <Competition>
    <Session SessionCode="WR01" StartDate="2025-10-03T10:00:00+04:00" EndDate="2025-10-03T14:00:00+04:00" Venue="GOL" VenueName="Ganja Olympic Sports Complex" SessionType="MOR" ModificationIndicator="U" Leadin="0:00">
      <SessionName Language="ENG" Value="Wrestling Session 1" />
    </Session>
    <Unit Code="WREW61KG--------------GP01000800--" PhaseType="3" UnitNum="15" ScheduleStatus="SCHEDULED" StartDate="2025-10-03T11:00:00+04:00" EndDate="2025-10-03T11:06:00+04:00" Order="1" Venue="GOL" Medal="----" Location="WR1" ModificationIndicator="U" SessionCode="WR01" HideEndDate="Y">
      <ItemName Language="ENG" Value="Women's 61 kg Elimination Pool A" />
      <StartList>
        <Start StartOrder="1" SortOrder="1">
          <Competitor Code="10000667" Type="A" Organisation="UZB">
            <Composition>
              <Athlete Code="10000667" Order="1">
                <Description GivenName="Laylo" FamilyName="ORAZBOEVA" Gender="F" Organisation="UZB" BirthDate="2008-08-05" IFId="SD90297" />
              </Athlete>
            </Composition>
          </Competitor>
        </Start>
        <Start StartOrder="2" SortOrder="2">
          <Competitor Code="10007781" Type="A" Organisation="AZE">
            <Composition>
              <Athlete Code="10007781" Order="1">
                <Description GivenName="Fidan" FamilyName="BABAYEVA" Gender="F" Organisation="AZE" BirthDate="2009-05-03" IFId="SD90299" />
              </Athlete>
            </Composition>
          </Competitor>
        </Start>
      </StartList>
    </Unit>
  </Competition>
</OdfBody>
'@

try {
    Write-Host "📤 Sending wrestling XML to processing endpoint..." -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/xml"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/wrestling/process-xml" -Method POST -Body $xmlContent -Headers $headers
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "📋 Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📋 Error Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n🔍 Testing basic API endpoint..." -ForegroundColor Green

try {
    $basicResponse = Invoke-RestMethod -Uri "http://localhost:3000/api" -Method GET
    Write-Host "✅ Basic API is working: $basicResponse" -ForegroundColor Green
} catch {
    Write-Host "❌ Basic API error: $($_.Exception.Message)" -ForegroundColor Red
}
