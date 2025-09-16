# ═══════════════════════════════════════════════════════════════════════════════
#                             🧹 ULTIMATE CLEANER 🧹
#                       Script de nettoyage intelligent
# ═══════════════════════════════════════════════════════════════════════════════

param(
    [switch]$Force,    # Skip confirmation
    [switch]$Quiet     # Minimal output
)

# =============================================================================
#                                MAIN EXECUTION
# =============================================================================

# Show appropriate message
if ($Quiet) {
    Write-Host "🧹 Cleaning project..." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "🧹 ULTIMATE PROJECT CLEANER" -ForegroundColor Cyan
    Write-Host ""
}

# Get confirmation if not forced
if (-not $Force -and -not $Quiet) {
    Write-Host "This will clean:" -ForegroundColor Yellow
    Write-Host "  • All running processes" -ForegroundColor White
    Write-Host "  • All development ports" -ForegroundColor White  
    Write-Host "  • Build folders & caches" -ForegroundColor White
    Write-Host "  • Databases & temp files" -ForegroundColor White
    Write-Host ""
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Cancelled." -ForegroundColor Green
        exit 0
    }
    Write-Host ""
}

# Kill processes
if (-not $Quiet) { Write-Host "• Stopping project-related processes..." -ForegroundColor Yellow }

# SMART list - only processes that could be related to Transcendance project
$processes = @(
    "node", "npm", "npx", "yarn", "pnpm", 
    "vite", "webpack", "tsc", "typescript", "ts-node", "tsx", "nodemon",
    "serve", "http-server", "live-server"
)

$killedCount = 0
foreach ($proc in $processes) {
    Get-Process -Name $proc -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        $killedCount++
    }
}

if (-not $Quiet -and $killedCount -gt 0) {
    Write-Host "  ✓ Killed $killedCount development processes" -ForegroundColor Green
}

# Kill ports  
if (-not $Quiet) { Write-Host "• Clearing Transcendance project ports..." -ForegroundColor Yellow }

# SMART APPROACH: Only kill ports commonly used by development (not everything!)
$developmentPorts = @(3000, 3001, 3002, 3003, 4000, 5000, 5173, 5174, 8000, 8080, 8081, 9000)
$killedCount = 0

# First, kill specific development ports
foreach ($port in $developmentPorts) {
    $connections = netstat -ano | Select-String ":$port "
    foreach ($connection in $connections) {
        try {
            $parts = $connection.ToString() -split '\s+' | Where-Object { $_ -ne '' }
            if ($parts.Length -ge 5 -and $parts[4] -match '^\d+$') {
                $pid = $parts[4]
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                $killedCount++
            }
        }
        catch { }
    }
}

# Then, scan for any node/npm processes on other ports (but be selective)
$nodeConnections = netstat -ano | Select-String ":\d+ " | ForEach-Object {
    $line = $_.ToString()
    $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
    if ($parts.Length -ge 5 -and $parts[4] -match '^\d+$') {
        $pid = $parts[4]
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process -and ($process.ProcessName -eq "node" -or $process.ProcessName -eq "npm")) {
                $portMatch = [regex]::Match($parts[1], ":(\d+)")
                if ($portMatch.Success) {
                    $port = [int]$portMatch.Groups[1].Value
                    # Only kill node/npm on development-related ports (3000-9999)
                    if ($port -ge 3000 -and $port -le 9999) {
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        $killedCount++
                    }
                }
            }
        }
        catch { }
    }
}

if (-not $Quiet -and $killedCount -gt 0) {
    Write-Host "  ✓ Cleared $killedCount processes from development ports" -ForegroundColor Green
}

Start-Sleep -Seconds 2

# DOUBLE-CHECK: Verify project ports are really free
if (-not $Quiet) { Write-Host "• Verifying project ports (3001, 3002)..." -ForegroundColor Yellow }
$projectPorts = @(3001, 3002)
foreach ($port in $projectPorts) {
    $stillOccupied = netstat -ano | Select-String ":$port "
    if ($stillOccupied) {
        # FORCE KILL - but only for our specific project ports
        foreach ($connection in $stillOccupied) {
            $parts = $connection.ToString() -split '\s+' | Where-Object { $_ -ne '' }
            if ($parts.Length -ge 5 -and $parts[4] -match '^\d+$') {
                $pid = $parts[4]
                if (-not $Quiet) { Write-Host "  ! Force-killing stubborn process on project port $port (PID: $pid)" -ForegroundColor Red }
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                taskkill /F /PID $pid 2>$null | Out-Null
            }
        }
    }
}

# Remove build folders
if (-not $Quiet) { Write-Host "• Removing builds..." -ForegroundColor Yellow }
$buildDirs = @("dist", "build", ".vite", ".next", "coverage")
foreach ($dir in $buildDirs) {
    Get-ChildItem -Path . -Recurse -Directory -Name $dir -ErrorAction SilentlyContinue | ForEach-Object {
        $fullPath = (Resolve-Path $_).Path
        cmd /c "rmdir /s /q `"$fullPath`"" 2>$null
    }
}

# Remove node_modules (only if not Quiet mode)
if (-not $Quiet) {
    Write-Host "• Removing dependencies..." -ForegroundColor Yellow
    Get-ChildItem -Path . -Recurse -Directory -Name "node_modules" -ErrorAction SilentlyContinue | ForEach-Object {
        $fullPath = (Resolve-Path $_).Path
        cmd /c "rmdir /s /q `"$fullPath`"" 2>$null
    }
}

# Clear caches
if (-not $Quiet) { Write-Host "• Clearing caches..." -ForegroundColor Yellow }
npm cache clean --force 2>$null | Out-Null

# Remove databases
if (-not $Quiet) { Write-Host "• Removing databases..." -ForegroundColor Yellow }
Get-ChildItem -Path . -Recurse -Filter "*.sqlite" -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
}
Get-ChildItem -Path . -Recurse -Filter "*.db" -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
}

# Clean temp files
$tempPatterns = @("*.log", "*.tmp", "*.tsbuildinfo", "package-lock.json")
foreach ($pattern in $tempPatterns) {
    Get-ChildItem -Path . -Recurse -Filter $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
    }
}

# Final message
if ($Quiet) {
    Write-Host "✅ Clean!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✅ Project cleaned successfully!" -ForegroundColor Green
    Write-Host "   Ready for fresh development." -ForegroundColor White
    Write-Host ""
}