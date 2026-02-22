# ============================================================================
# ChlorellaOS Professional Auto-Launcher
# Version: 1.0.0
# Description: Intelligent, self-healing, silent launcher with comprehensive error handling
# ============================================================================

param(
    [switch]$Silent,
    [switch]$Debug,
    [int]$MaxRetries = 3,
    [int]$RetryDelay = 5
)

# Configuration
$script:Config = @{
    AppName = "ChlorellaOS"
    AppPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    Port = 3000
    NodeMinVersion = "14.0.0"
    LogPath = Join-Path $env:TEMP "ChlorellaOS_Launcher.log"
    LockFile = Join-Path $env:TEMP "ChlorellaOS.lock"
    MaxLogSize = 5MB
    AutoOpen = $true
    StartupDelay = 5  # Saniye - sistem açılışından sonra bekleme
}

function Import-LauncherConfig {
    $configPath = Join-Path $script:Config.AppPath "ChlorellaOS_Config.json"
    if (-not (Test-Path $configPath)) {
        return
    }

    try {
        $json = Get-Content $configPath -Raw | ConvertFrom-Json

        if ($json.server) {
            if ($null -ne $json.server.port) { $script:Config.Port = [int]$json.server.port }
            if ($null -ne $json.server.autoOpen) { $script:Config.AutoOpen = [bool]$json.server.autoOpen }
        }

        if ($json.startup -and $null -ne $json.startup.delay) {
            $script:Config.StartupDelay = [int]$json.startup.delay
        }

        if ($json.logging) {
            if ($null -ne $json.logging.maxLogSize) { $script:Config.MaxLogSize = [int64]$json.logging.maxLogSize }
            if ($null -ne $json.logging.enabled -and -not [bool]$json.logging.enabled) {
                $script:Config.LogPath = Join-Path $env:TEMP "ChlorellaOS_Launcher.disabled.log"
            }
        }

        if ($json.paths) {
            if ($json.paths.logDirectory) {
                $expandedLogDir = [Environment]::ExpandEnvironmentVariables([string]$json.paths.logDirectory)
                if (-not [string]::IsNullOrWhiteSpace($expandedLogDir)) {
                    $script:Config.LogPath = Join-Path $expandedLogDir "ChlorellaOS_Launcher.log"
                }
            }
            if ($json.paths.lockFile) {
                $expandedLock = [Environment]::ExpandEnvironmentVariables([string]$json.paths.lockFile)
                if (-not [string]::IsNullOrWhiteSpace($expandedLock)) {
                    $script:Config.LockFile = $expandedLock
                }
            }
        }

        if ($json.errorHandling) {
            if (-not $PSBoundParameters.ContainsKey('MaxRetries') -and $null -ne $json.errorHandling.maxRetries) {
                $script:MaxRetries = [int]$json.errorHandling.maxRetries
            }
            if (-not $PSBoundParameters.ContainsKey('RetryDelay') -and $null -ne $json.errorHandling.retryDelay) {
                $script:RetryDelay = [int]$json.errorHandling.retryDelay
            }
        }
    }
    catch {
        Write-Host "[WARNING] ChlorellaOS_Config.json okunamadi: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Import-LauncherConfig

# ============================================================================
# LOGGING SYSTEM
# ============================================================================

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'DEBUG')]
        [string]$Level = 'INFO'
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # Console output (sadece debug modda veya önemli mesajlarda)
    if ($Debug -or $Level -in @('ERROR', 'WARNING', 'SUCCESS')) {
        $color = switch ($Level) {
            'ERROR'   { 'Red' }
            'WARNING' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG'   { 'Cyan' }
            default   { 'White' }
        }
        Write-Host $logMessage -ForegroundColor $color
    }
    
    # File logging
    try {
        # Log rotasyonu
        if (Test-Path $script:Config.LogPath) {
            $logFile = Get-Item $script:Config.LogPath
            if ($logFile.Length -gt $script:Config.MaxLogSize) {
                $backupLog = $script:Config.LogPath -replace '\.log$', "_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
                Move-Item $script:Config.LogPath $backupLog -Force
                Write-Log "Log rotasyonu yapıldı: $backupLog" -Level INFO
            }
        }
        
        Add-Content -Path $script:Config.LogPath -Value $logMessage -Encoding UTF8
    }
    catch {
        # Log yazma hatası - sessizce devam et
    }
}

# ============================================================================
# SYSTEM CHECKS
# ============================================================================

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-NodeInstalled {
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Log "Node.js bulundu: $nodeVersion" -Level SUCCESS
            
            # Versiyon kontrolü
            $version = $nodeVersion -replace 'v', ''
            if ([version]$version -ge [version]$script:Config.NodeMinVersion) {
                return $true
            }
            else {
                Write-Log "Node.js versiyonu çok eski. Minimum: v$($script:Config.NodeMinVersion), Mevcut: $nodeVersion" -Level WARNING
                return $true  # Yine de devam et
            }
        }
        return $false
    }
    catch {
        Write-Log "Node.js bulunamadı: $_" -Level ERROR
        return $false
    }
}

function Test-PortAvailable {
    param([int]$Port)
    
    try {
        $tcpConnection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($tcpConnection -and $tcpConnection.OwningProcess -gt 0) {
            Write-Log "Port $Port zaten kullanımda (PID: $($tcpConnection.OwningProcess))" -Level WARNING
            return $false
        }
        return $true
    }
    catch {
        # Port müsait
        return $true
    }
}

function Stop-ExistingProcess {
    param([int]$Port)
    
    try {
        $tcpConnection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($tcpConnection) {
            $processId = $tcpConnection.OwningProcess
            if ($processId -le 4) {
                Write-Log "Port $Port sistem prosesi tarafindan tutuluyor (PID: $processId), otomatik durdurma atlandi" -Level WARNING
                return $false
            }
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            
            if ($process) {
                Write-Log "Mevcut proses durduruluyor: $($process.Name) (PID: $processId)" -Level WARNING
                Stop-Process -Id $processId -Force
                Start-Sleep -Seconds 2
                return $true
            }
        }
        return $false
    }
    catch {
        Write-Log "Proses durdurma hatası: $_" -Level ERROR
        return $false
    }
}

function Test-LockFile {
    if (Test-Path $script:Config.LockFile) {
        try {
            $lockContent = Get-Content $script:Config.LockFile -Raw | ConvertFrom-Json
            $lockPid = $lockContent.PID
            
            # PID hala çalışıyor mu?
            $process = Get-Process -Id $lockPid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Log "ChlorellaOS zaten çalışıyor (PID: $lockPid)" -Level WARNING
                return $false
            }
            else {
                # Eski lock dosyası - temizle
                Remove-Item $script:Config.LockFile -Force
                Write-Log "Eski lock dosyası temizlendi" -Level INFO
            }
        }
        catch {
            # Bozuk lock dosyası - temizle
            Remove-Item $script:Config.LockFile -Force -ErrorAction SilentlyContinue
        }
    }
    return $true
}

function New-LockFile {
    param([int]$ProcessId)
    
    $lockData = @{
        PID = $ProcessId
        StartTime = (Get-Date).ToString("o")
        Path = $script:Config.AppPath
    } | ConvertTo-Json
    
    try {
        Set-Content -Path $script:Config.LockFile -Value $lockData -Force
        Write-Log "Lock dosyası oluşturuldu (PID: $ProcessId)" -Level DEBUG
    }
    catch {
        Write-Log "Lock dosyası oluşturulamadı: $_" -Level WARNING
    }
}

function Remove-LockFile {
    try {
        if (Test-Path $script:Config.LockFile) {
            Remove-Item $script:Config.LockFile -Force
            Write-Log "Lock dosyası silindi" -Level DEBUG
        }
    }
    catch {
        Write-Log "Lock dosyası silinemedi: $_" -Level WARNING
    }
}

# ============================================================================
# NPM & NODE_MODULES MANAGEMENT
# ============================================================================

function Test-NodeModules {
    $nodeModulesPath = Join-Path $script:Config.AppPath "node_modules"
    $packageJsonPath = Join-Path $script:Config.AppPath "package.json"
    
    if (-not (Test-Path $packageJsonPath)) {
        Write-Log "package.json bulunamadı!" -Level ERROR
        return $false
    }
    
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Log "node_modules bulunamadı, kurulum gerekli" -Level WARNING
        return $false
    }
    
    # package-lock.json ile node_modules karşılaştırması
    $packageLockPath = Join-Path $script:Config.AppPath "package-lock.json"
    if (Test-Path $packageLockPath) {
        $packageLockDate = (Get-Item $packageLockPath).LastWriteTime
        $nodeModulesDate = (Get-Item $nodeModulesPath).LastWriteTime
        
        if ($packageLockDate -gt $nodeModulesDate) {
            Write-Log "package-lock.json güncel değil, yeniden kurulum gerekli" -Level WARNING
            return $false
        }
    }
    
    Write-Log "node_modules mevcut ve güncel" -Level SUCCESS
    return $true
}

function Install-NodeModules {
    Write-Log "npm install başlatılıyor..." -Level INFO
    
    try {
        Push-Location $script:Config.AppPath
        
        $outLogPath = Join-Path $env:TEMP "npm_install_out.log"
        $errLogPath = Join-Path $env:TEMP "npm_install_err.log"

        if (Test-Path $outLogPath) { Remove-Item $outLogPath -Force -ErrorAction SilentlyContinue }
        if (Test-Path $errLogPath) { Remove-Item $errLogPath -Force -ErrorAction SilentlyContinue }

        & cmd.exe /c "npm install --loglevel=error 1> `"$outLogPath`" 2> `"$errLogPath`""
        $npmExitCode = $LASTEXITCODE
        
        Pop-Location
        
        if ($npmExitCode -eq 0) {
            Write-Log "npm install başarıyla tamamlandı" -Level SUCCESS
            return $true
        }
        else {
            $errLog = Get-Content (Join-Path $env:TEMP "npm_install_err.log") -Raw
            Write-Log "npm install başarısız: $errLog" -Level ERROR
            return $false
        }
    }
    catch {
        Pop-Location
        Write-Log "npm install hatası: $_" -Level ERROR
        return $false
    }
}

# ============================================================================
# APPLICATION LAUNCHER
# ============================================================================

function Start-ChlorellaOS {
    Write-Log "ChlorellaOS başlatılıyor..." -Level INFO
    
    # Startup delay (Windows başlangıcında network vs. hazır olması için)
    if ($script:Config.StartupDelay -gt 0) {
        Write-Log "Başlangıç gecikmesi: $($script:Config.StartupDelay) saniye" -Level DEBUG
        Start-Sleep -Seconds $script:Config.StartupDelay
    }
    
    try {
        # ChlorellaOS dizinine git
        Set-Location $script:Config.AppPath
        Write-Log "Çalışma dizini: $($script:Config.AppPath)" -Level DEBUG
        
        # Arka planda PowerShell job başlat
        $job = Start-Job -ScriptBlock {
            param($appPath)
            Set-Location $appPath
            & cmd.exe /c "npm run dev"
        } -ArgumentList $script:Config.AppPath
        
        # Job'ın PID'sini al (biraz bekle job başlasın)
        Start-Sleep -Seconds 2
        
        # npm prosesini bul
        $npmProcess = Get-Process | Where-Object {
            $_.ProcessName -eq "node" -and 
            $_.StartTime -gt (Get-Date).AddSeconds(-10)
        } | Select-Object -First 1
        
        if ($npmProcess) {
            New-LockFile -ProcessId $npmProcess.Id
            Write-Log "ChlorellaOS başarıyla başlatıldı (PID: $($npmProcess.Id))" -Level SUCCESS
            
            # Sunucunun hazır olmasını bekle
            $maxWait = 30
            $waited = 0
            $serverReady = $false
            
            while ($waited -lt $maxWait -and -not $serverReady) {
                Start-Sleep -Seconds 1
                $waited++
                
                try {
                    $tcpConnection = Get-NetTCPConnection -LocalPort $script:Config.Port -ErrorAction SilentlyContinue
                    if ($tcpConnection) {
                        $serverReady = $true
                        Write-Log "Sunucu hazır! (Port $($script:Config.Port))" -Level SUCCESS
                    }
                }
                catch {
                    # Port henüz açılmamış, devam et
                }
            }
            
            # Tarayıcıyı aç (opsiyonel)
            if ($script:Config.AutoOpen -and $serverReady) {
                Start-Sleep -Seconds 1
                Start-Process "http://localhost:$($script:Config.Port)"
                Write-Log "Tarayıcı açıldı: http://localhost:$($script:Config.Port)" -Level INFO
            }
            elseif (-not $serverReady) {
                Write-Log "Sunucu hazır olmayabilir (timeout), kontrol edin" -Level WARNING
            }
            
            return $npmProcess
        }
        else {
            Write-Log "npm prosesi bulunamadı, job başlatıldı (Job ID: $($job.Id))" -Level WARNING
            # Job ID'yi kullan
            return $job
        }
    }
    catch {
        Write-Log "Başlatma hatası: $_" -Level ERROR
        return $null
    }
}

# ============================================================================
# MAIN EXECUTION LOGIC
# ============================================================================

function Start-LauncherWithRetry {
    $effectiveMaxRetries = if ($null -ne $script:MaxRetries) { [int]$script:MaxRetries } else { [int]$MaxRetries }
    $effectiveRetryDelay = if ($null -ne $script:RetryDelay) { [int]$script:RetryDelay } else { [int]$RetryDelay }

    Write-Log "========================================" -Level INFO
    Write-Log "ChlorellaOS Launcher v1.0.0 Başlatıldı" -Level INFO
    Write-Log "========================================" -Level INFO
    
    $retryCount = 0
    $success = $false
    
    while ($retryCount -lt $effectiveMaxRetries -and -not $success) {
        if ($retryCount -gt 0) {
            Write-Log "Yeniden deneme $retryCount/$effectiveMaxRetries..." -Level WARNING
            Start-Sleep -Seconds $effectiveRetryDelay
        }
        
        # 1. Lock file kontrolü
        if (-not (Test-LockFile)) {
            Write-Log "Uygulama zaten çalışıyor, çıkılıyor..." -Level INFO
            return $true
        }
        
        # 2. Node.js kontrolü
        if (-not (Test-NodeInstalled)) {
            Write-Log "Node.js yüklü değil! Lütfen https://nodejs.org adresinden yükleyin." -Level ERROR
            
            # Otomatik çözüm denemesi - Node.js indiricisini aç
            if ($retryCount -eq 0) {
                try {
                    Start-Process "https://nodejs.org/en/download/"
                    Write-Log "Node.js indirme sayfası açıldı" -Level INFO
                }
                catch {}
            }
            
            $retryCount++
            continue
        }
        
        # 3. Port kontrolü
        if (-not (Test-PortAvailable -Port $script:Config.Port)) {
            Write-Log "Port $($script:Config.Port) kullanımda, temizleme denemesi..." -Level WARNING
            $stopped = Stop-ExistingProcess -Port $script:Config.Port
            
            if (-not $stopped) {
                Write-Log "Port temizlenemedi, alternatif port kullanılabilir (manuel müdahale gerekli)" -Level ERROR
            }
            
            Start-Sleep -Seconds 2
        }
        
        # 4. Dizin kontrolü
        if (-not (Test-Path $script:Config.AppPath)) {
            Write-Log "Uygulama dizini bulunamadı: $($script:Config.AppPath)" -Level ERROR
            return $false
        }
        
        Set-Location $script:Config.AppPath
        
        # 5. node_modules kontrolü
        if (-not (Test-NodeModules)) {
            Write-Log "Bağımlılıklar kurulacak..." -Level INFO
            if (-not (Install-NodeModules)) {
                Write-Log "Bağımlılık kurulumu başarısız" -Level ERROR
                $retryCount++
                continue
            }
        }
        
        # 6. Uygulamayı başlat
        $process = Start-ChlorellaOS
        if ($process) {
            $success = $true
            Write-Log "ChlorellaOS başarıyla çalışıyor!" -Level SUCCESS
            Write-Log "PID: $($process.Id) | Port: $($script:Config.Port)" -Level INFO
            Write-Log "Log dosyası: $($script:Config.LogPath)" -Level INFO
            
            # Process cleanup handler
            Register-EngineEvent PowerShell.Exiting -Action {
                Remove-LockFile
            } | Out-Null
            
            return $true
        }
        else {
            $retryCount++
        }
    }
    
    if (-not $success) {
        Write-Log "ChlorellaOS başlatılamadı ($effectiveMaxRetries deneme sonrası)" -Level ERROR
        Write-Log "Log dosyasını kontrol edin: $($script:Config.LogPath)" -Level ERROR
        return $false
    }
}

# ============================================================================
# ENTRY POINT
# ============================================================================

try {
    $result = Start-LauncherWithRetry
    $script:LauncherSucceeded = [bool]$result
    
    if (-not $Silent) {
        if ($result) {
            Write-Host "`nChlorellaOS basariyla baslatildi." -ForegroundColor Green
            Write-Host "Tarayicinizda acin: http://localhost:$($script:Config.Port)" -ForegroundColor Cyan
        }
        else {
            Write-Host "`nChlorellaOS baslatilamadi." -ForegroundColor Red
            Write-Host "Log: $($script:Config.LogPath)" -ForegroundColor Yellow
        }
    }
    
    exit $(if ($result) { 0 } else { 1 })
}
catch {
    Write-Log "Kritik hata: $_" -Level ERROR
    Write-Log "StackTrace: $($_.ScriptStackTrace)" -Level ERROR
    exit 1
}
finally {
    # Cleanup
    if (-not $script:LauncherSucceeded) {
        Remove-LockFile
    }
}
