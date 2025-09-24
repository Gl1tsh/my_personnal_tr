# Simple port killer for Transcendance project
# Kills processes on ports 3000, 3001, 3002

$ports = @(3000, 3001, 3002)

Write-Host "🔫 Killing processes on ports 3000, 3001, 3002..." -ForegroundColor Yellow

foreach ($port in $ports) {
    $connections = netstat -ano | Select-String ":$port "
    foreach ($connection in $connections) {
        try {
            $parts = $connection.ToString() -split '\s+' | Where-Object { $_ -ne '' }
            if ($parts.Length -ge 5 -and $parts[4] -match '^\d+$') {
                $pid = $parts[4]
                Write-Host "  Killing process $pid on port $port" -ForegroundColor Red
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        catch { }
    }
}

# Wait a bit for processes to die
Start-Sleep -Seconds 2

# Double-check and force kill if needed
foreach ($port in $ports) {
    $stillOccupied = netstat -ano | Select-String ":$port "
    if ($stillOccupied) {
        Write-Host "  Port $port still occupied, force killing..." -ForegroundColor Red
        foreach ($connection in $stillOccupied) {
            $parts = $connection.ToString() -split '\s+' | Where-Object { $_ -ne '' }
            if ($parts.Length -ge 5 -and $parts[4] -match '^\d+$') {
                $pid = $parts[4]
                taskkill /F /PID $pid 2>$null | Out-Null
            }
        }
    }
}

# Kill any remaining node/npm processes
Write-Host "  Killing any remaining node/npm processes..." -ForegroundColor Yellow
Get-Process -Name "node","npm" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Force killing $($_.ProcessName) PID $($_.Id)" -ForegroundColor Red
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 1
Write-Host "✓ Ports cleaned" -ForegroundColor Green