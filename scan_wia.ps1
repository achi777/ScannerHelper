# WIA Scanner PowerShell Script
# Scans document from connected scanner and saves to temp file

param(
    [string]$OutputPath = "C:\Windows\Temp\scanned_doc.bmp",
    [int]$DPI = 300,
    [string]$ColorMode = "Color"
)

Write-Host "[INFO] Starting WIA scan..." -ForegroundColor Cyan
Write-Host "[INFO] DPI: $DPI" -ForegroundColor Cyan
Write-Host "[INFO] Color Mode: $ColorMode" -ForegroundColor Cyan

try {
    # Create WIA DeviceManager
    $deviceManager = New-Object -ComObject WIA.DeviceManager
    Write-Host "[INFO] WIA Device Manager created" -ForegroundColor Green

    # Get available devices
    $devices = $deviceManager.DeviceInfos
    if ($devices.Count -eq 0) {
        Write-Host "[ERROR] No scanners found!" -ForegroundColor Red
        exit 1
    }

    Write-Host "[INFO] Found $($devices.Count) scanner(s)" -ForegroundColor Green

    # Connect to first scanner
    $device = $devices.Item(1).Connect()
    Write-Host "[INFO] Connected to scanner: $($device.Properties.Item('Name').Value)" -ForegroundColor Green

    # Find flatbed or feeder item
    $scanItem = $null
    foreach ($item in $device.Items) {
        Write-Host "[INFO] Found scan source: $($item.ItemID)" -ForegroundColor Yellow
        $scanItem = $item
        break
    }

    if ($null -eq $scanItem) {
        Write-Host "[ERROR] No scan source available!" -ForegroundColor Red
        exit 1
    }

    Write-Host "[INFO] Using scan source: $($scanItem.ItemID)" -ForegroundColor Green

    # Set scan properties
    try {
        # Set horizontal resolution (DPI)
        $scanItem.Properties.Item("6147").Value = $DPI  # WIA_IPS_XRES
        Write-Host "[INFO] Set X Resolution: $DPI DPI" -ForegroundColor Cyan
    } catch {
        Write-Host "[WARN] Could not set X resolution" -ForegroundColor Yellow
    }

    try {
        # Set vertical resolution (DPI)
        $scanItem.Properties.Item("6148").Value = $DPI  # WIA_IPS_YRES
        Write-Host "[INFO] Set Y Resolution: $DPI DPI" -ForegroundColor Cyan
    } catch {
        Write-Host "[WARN] Could not set Y resolution" -ForegroundColor Yellow
    }

    try {
        # Set color mode (1=B&W, 2=Grayscale, 3=Color)
        $colorValue = 3  # Color by default
        if ($ColorMode -eq "Grayscale") { $colorValue = 2 }
        if ($ColorMode -eq "BW") { $colorValue = 1 }

        $scanItem.Properties.Item("4103").Value = $colorValue  # WIA_IPA_DATATYPE
        Write-Host "[INFO] Set Color Mode: $ColorMode ($colorValue)" -ForegroundColor Cyan
    } catch {
        Write-Host "[WARN] Could not set color mode" -ForegroundColor Yellow
    }

    # Perform scan
    Write-Host "[INFO] Starting scan operation..." -ForegroundColor Cyan
    Write-Host "[INFO] Please wait while scanning..." -ForegroundColor Yellow

    $image = $scanItem.Transfer("{B96B3CAB-0728-11D3-9D7B-0000F81EF32E}")  # WIA_FORMAT_BMP

    if ($null -eq $image) {
        Write-Host "[ERROR] Scan failed - no image returned!" -ForegroundColor Red
        exit 1
    }

    Write-Host "[SUCCESS] Scan completed!" -ForegroundColor Green

    # Save to file
    Write-Host "[INFO] Saving to: $OutputPath" -ForegroundColor Cyan

    # Ensure directory exists
    $directory = [System.IO.Path]::GetDirectoryName($OutputPath)
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    # Delete old file if exists
    if (Test-Path $OutputPath) {
        Remove-Item $OutputPath -Force
    }

    # Save image
    $image.SaveFile($OutputPath)

    if (Test-Path $OutputPath) {
        $fileSize = (Get-Item $OutputPath).Length
        $fileSizeKB = [math]::Round($fileSize / 1024, 2)
        $fileSizeMB = [math]::Round($fileSize / 1024 / 1024, 2)

        Write-Host "[SUCCESS] Image saved successfully!" -ForegroundColor Green
        Write-Host "[INFO] File size: $fileSizeKB KB ($fileSizeMB MB)" -ForegroundColor Cyan
        Write-Host "[INFO] Path: $OutputPath" -ForegroundColor Cyan

        # Output JSON for Rust to parse
        $result = @{
            success = $true
            path = $OutputPath
            size = $fileSize
            width = $image.Width
            height = $image.Height
        }
        Write-Output ($result | ConvertTo-Json -Compress)
        exit 0
    } else {
        Write-Host "[ERROR] Failed to save file!" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "[ERROR] Scan failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.StackTrace -ForegroundColor Red
    exit 1
}
