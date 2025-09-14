# Kill processes on ports 3001 and 3002
Write-Host "Killing processes on ports 3001 and 3002..." -ForegroundColor Yellow

# Kill port 3001
netstat -ano | findstr :3001 | ForEach-Object {
    $line = $_ -split '\s+'
    if ($line.Length -gt 4) {
        $pid = $line[4]
        if ($pid -match '^\d+$') {
            Write-Host "Killing PID $pid on port 3001" -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

# Kill port 3002  
netstat -ano | findstr :3002 | ForEach-Object {
    $line = $_ -split '\s+'
    if ($line.Length -gt 4) {
        $pid = $line[4]
        if ($pid -match '^\d+$') {
            Write-Host "Killing PID $pid on port 3002" -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Ports cleaned!" -ForegroundColor Green
