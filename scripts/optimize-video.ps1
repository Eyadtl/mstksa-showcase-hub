# Video Optimization Script for MST-KSA Landing Page
# This script optimizes the background video to meet performance requirements

param(
    [string]$InputVideo = "public\background video.mp4",
    [int]$MP4_CRF = 28,
    [int]$WebM_CRF = 35,
    [string]$Resolution = "1920:1080",
    [int]$FrameRate = 30
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MST-KSA Video Optimization Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if input video exists
if (-not (Test-Path $InputVideo)) {
    Write-Host "Error: Input video not found: $InputVideo" -ForegroundColor Red
    exit 1
}

# Check if FFmpeg is installed
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "Error: FFmpeg is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation instructions:" -ForegroundColor Yellow
    Write-Host "  1. Using Chocolatey: choco install ffmpeg" -ForegroundColor Yellow
    Write-Host "  2. Or download from: https://ffmpeg.org/download.html" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "Input video: $InputVideo" -ForegroundColor Green
$inputSize = (Get-Item $InputVideo).Length / 1MB
Write-Host "Current size: $([math]::Round($inputSize, 2)) MB" -ForegroundColor Yellow
Write-Host ""

# Create optimized MP4
Write-Host "[1/3] Creating optimized MP4 (H.264)..." -ForegroundColor Cyan
Write-Host "  - CRF: $MP4_CRF (lower = better quality, larger file)" -ForegroundColor Gray
Write-Host "  - Resolution: $Resolution" -ForegroundColor Gray
Write-Host "  - Frame rate: $FrameRate fps" -ForegroundColor Gray
Write-Host ""

ffmpeg -i $InputVideo `
    -c:v libx264 `
    -preset slow `
    -crf $MP4_CRF `
    -vf "scale=$Resolution" `
    -r $FrameRate `
    -an `
    -movflags +faststart `
    "public\background-video-optimized.mp4" `
    -y 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    $mp4Size = (Get-Item "public\background-video-optimized.mp4").Length / 1MB
    Write-Host "  ✓ MP4 created: $([math]::Round($mp4Size, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "  ✗ MP4 creation failed" -ForegroundColor Red
}
Write-Host ""

# Create WebM version
Write-Host "[2/3] Creating WebM version (VP9)..." -ForegroundColor Cyan
Write-Host "  - CRF: $WebM_CRF (lower = better quality, larger file)" -ForegroundColor Gray
Write-Host "  - Resolution: $Resolution" -ForegroundColor Gray
Write-Host "  - Frame rate: $FrameRate fps" -ForegroundColor Gray
Write-Host ""

ffmpeg -i $InputVideo `
    -c:v libvpx-vp9 `
    -crf $WebM_CRF `
    -b:v 0 `
    -vf "scale=$Resolution" `
    -r $FrameRate `
    -an `
    "public\background-video.webm" `
    -y 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    $webmSize = (Get-Item "public\background-video.webm").Length / 1MB
    Write-Host "  ✓ WebM created: $([math]::Round($webmSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "  ✗ WebM creation failed" -ForegroundColor Red
}
Write-Host ""

# Create poster image
Write-Host "[3/3] Creating poster image..." -ForegroundColor Cyan
Write-Host "  - Extracting frame at 2 seconds" -ForegroundColor Gray
Write-Host ""

ffmpeg -i $InputVideo `
    -ss 00:00:02 `
    -vframes 1 `
    -q:v 2 `
    "public\background-video-poster.jpg" `
    -y 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    $posterSize = (Get-Item "public\background-video-poster.jpg").Length / 1KB
    Write-Host "  ✓ Poster created: $([math]::Round($posterSize, 2)) KB" -ForegroundColor Green
} else {
    Write-Host "  ✗ Poster creation failed" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Optimization Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem public\background-video* | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB, 2)}}
$files | Format-Table -AutoSize

Write-Host ""
Write-Host "Performance Target: < 5 MB per video file" -ForegroundColor Yellow
Write-Host ""

# Check if files meet target
$mp4File = Get-Item "public\background-video-optimized.mp4" -ErrorAction SilentlyContinue
$webmFile = Get-Item "public\background-video.webm" -ErrorAction SilentlyContinue

if ($mp4File -and ($mp4File.Length / 1MB) -lt 5) {
    Write-Host "✓ MP4 meets size target" -ForegroundColor Green
} elseif ($mp4File) {
    Write-Host "⚠ MP4 exceeds 5MB target. Consider:" -ForegroundColor Yellow
    Write-Host "  - Increase CRF (e.g., -MP4_CRF 30)" -ForegroundColor Gray
    Write-Host "  - Reduce resolution (e.g., -Resolution '1280:720')" -ForegroundColor Gray
    Write-Host "  - Reduce frame rate (e.g., -FrameRate 24)" -ForegroundColor Gray
}

if ($webmFile -and ($webmFile.Length / 1MB) -lt 5) {
    Write-Host "✓ WebM meets size target" -ForegroundColor Green
} elseif ($webmFile) {
    Write-Host "⚠ WebM exceeds 5MB target. Consider:" -ForegroundColor Yellow
    Write-Host "  - Increase CRF (e.g., -WebM_CRF 37)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test the optimized videos in your browser" -ForegroundColor White
Write-Host "  2. Update VideoHeroSection to use: /background-video-optimized.mp4" -ForegroundColor White
Write-Host "  3. Verify load time in DevTools Network tab (target: < 3s)" -ForegroundColor White
Write-Host ""
