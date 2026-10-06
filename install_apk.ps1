# Set ADB path
$env:Path += ";C:\Users\abhay\AppData\Local\Android\sdk\platform-tools"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Connect Maratha - APK Installation Script" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Check for connected devices
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
adb devices

$devices = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }

if (-not $devices) {
    Write-Host "`nERROR: No device detected!" -ForegroundColor Red
    Write-Host "`nPlease ensure:" -ForegroundColor Yellow
    Write-Host "1. USB debugging is enabled on your Moto G45" -ForegroundColor White
    Write-Host "2. Phone is connected via USB cable" -ForegroundColor White
    Write-Host "3. You've accepted the USB debugging prompt on your phone`n" -ForegroundColor White
    exit 1
}

Write-Host "`nDevice detected! Proceeding with installation...`n" -ForegroundColor Green

# Get package name
$packageName = "com.connectmaratha.app"
$apkPath = "app\build\app\outputs\flutter-apk\app-release.apk"

# Check if APK exists
if (-not (Test-Path $apkPath)) {
    Write-Host "ERROR: APK not found at $apkPath" -ForegroundColor Red
    exit 1
}

Write-Host "APK found: $apkPath" -ForegroundColor Green
Write-Host "APK size: $((Get-Item $apkPath).Length / 1MB) MB`n" -ForegroundColor Green

# Check if app is already installed
Write-Host "Checking if app is already installed..." -ForegroundColor Yellow
$installed = adb shell pm list packages | Select-String $packageName

if ($installed) {
    Write-Host "App is currently installed. Uninstalling old version..." -ForegroundColor Yellow
    adb uninstall $packageName
    Write-Host "Old version uninstalled successfully!`n" -ForegroundColor Green
} else {
    Write-Host "No previous installation found.`n" -ForegroundColor Green
}

# Install new APK
Write-Host "Installing new APK (this may take a minute)..." -ForegroundColor Yellow
adb install -r $apkPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n============================================" -ForegroundColor Green
    Write-Host "SUCCESS! App installed successfully!" -ForegroundColor Green
    Write-Host "============================================`n" -ForegroundColor Green
    Write-Host "You can now open Connect Maratha on your Moto G45." -ForegroundColor White
    Write-Host "The Report and Block UI has been hidden for V1.`n" -ForegroundColor Cyan
} else {
    Write-Host "`nERROR: Installation failed!" -ForegroundColor Red
    Write-Host "Please check the error message above.`n" -ForegroundColor Yellow
}
