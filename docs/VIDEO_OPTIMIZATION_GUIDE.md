# Video Optimization Guide

## Overview

This guide explains how to optimize the background video for the VideoHeroSection component to meet performance requirements (< 5MB file size, < 3s load time).

## Current Status

- **Current video**: `public/background video.mp4` (~18.9 MB)
- **Target size**: < 5 MB
- **Target load time**: < 3 seconds on standard broadband

## Prerequisites

Install FFmpeg on your system:

### Windows
```powershell
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

### macOS
```bash
brew install ffmpeg
```

### Linux
```bash
sudo apt-get install ffmpeg  # Debian/Ubuntu
sudo yum install ffmpeg      # CentOS/RHEL
```

## Optimization Workflow

### Step 1: Compress to MP4 (H.264)

This creates an optimized MP4 version with good browser compatibility:

```bash
ffmpeg -i "public/background video.mp4" \
  -c:v libx264 \
  -preset slow \
  -crf 28 \
  -vf scale=1920:1080 \
  -r 30 \
  -an \
  -movflags +faststart \
  "public/background-video-optimized.mp4"
```

**Parameters explained:**
- `-c:v libx264`: Use H.264 codec (best compatibility)
- `-preset slow`: Better compression (slower encoding)
- `-crf 28`: Constant Rate Factor (18-28 range, higher = smaller file)
- `-vf scale=1920:1080`: Ensure 1080p resolution
- `-r 30`: 30 frames per second
- `-an`: Remove audio track (not needed for background video)
- `-movflags +faststart`: Enable streaming (loads faster)

### Step 2: Create WebM Version (Better Compression)

WebM typically provides 20-30% better compression than MP4:

```bash
ffmpeg -i "public/background video.mp4" \
  -c:v libvpx-vp9 \
  -crf 35 \
  -b:v 0 \
  -vf scale=1920:1080 \
  -r 30 \
  -an \
  "public/background-video.webm"
```

**Parameters explained:**
- `-c:v libvpx-vp9`: Use VP9 codec (better compression)
- `-crf 35`: Quality level for VP9 (30-40 range)
- `-b:v 0`: Let CRF control bitrate

### Step 3: Generate Poster Image

Create a fallback poster image from a frame:

```bash
ffmpeg -i "public/background video.mp4" \
  -ss 00:00:02 \
  -vframes 1 \
  -q:v 2 \
  "public/background-video-poster.jpg"
```

**Parameters explained:**
- `-ss 00:00:02`: Extract frame at 2 seconds
- `-vframes 1`: Extract only 1 frame
- `-q:v 2`: High quality JPEG (2-5 range, lower = better)

### Step 4: Verify File Sizes

```powershell
# Windows PowerShell
Get-ChildItem public\background-video* | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB, 2)}}
```

```bash
# macOS/Linux
ls -lh public/background-video*
```

## Target Specifications

- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 fps
- **Codec**: H.264 (MP4) + VP9 (WebM)
- **File Size**: < 5 MB per format
- **Duration**: Keep original duration
- **Audio**: Removed (not needed)

## Quality vs Size Trade-offs

If the video is still too large after optimization:

1. **Increase CRF value** (reduces quality, smaller file):
   - MP4: Try CRF 30-32
   - WebM: Try CRF 37-40

2. **Reduce resolution** (if acceptable):
   ```bash
   -vf scale=1280:720  # 720p instead of 1080p
   ```

3. **Reduce frame rate** (smoother = larger):
   ```bash
   -r 24  # 24fps instead of 30fps
   ```

4. **Trim video duration** (if possible):
   ```bash
   -t 10  # Limit to 10 seconds, then loop
   ```

## Implementation in Code

Once optimized, update the VideoHeroSection usage:

```tsx
<VideoHeroSection
  videoSrc="/background-video-optimized.mp4"
  fallbackImage="/background-video-poster.jpg"
  // ... other props
/>
```

The VideoBackground component will automatically:
- Use the optimized video on desktop
- Show the poster image on mobile (or if video fails)
- Support multiple formats via `<source>` elements

## Testing

After optimization, verify:

1. **File size**: `< 5 MB`
2. **Load time**: Open DevTools Network tab, should load in `< 3s`
3. **Visual quality**: Should look acceptable (no obvious artifacts)
4. **Browser compatibility**: Test in Chrome, Firefox, Safari, Edge

## Automated Optimization Script

Create `scripts/optimize-video.ps1`:

```powershell
# Video Optimization Script
param(
    [string]$InputVideo = "public\background video.mp4",
    [int]$CRF = 28
)

Write-Host "Optimizing video: $InputVideo" -ForegroundColor Green

# Check if FFmpeg is installed
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "Error: FFmpeg is not installed" -ForegroundColor Red
    Write-Host "Install with: choco install ffmpeg" -ForegroundColor Yellow
    exit 1
}

# Create optimized MP4
Write-Host "Creating optimized MP4..." -ForegroundColor Cyan
ffmpeg -i $InputVideo `
    -c:v libx264 `
    -preset slow `
    -crf $CRF `
    -vf scale=1920:1080 `
    -r 30 `
    -an `
    -movflags +faststart `
    "public\background-video-optimized.mp4" `
    -y

# Create WebM version
Write-Host "Creating WebM version..." -ForegroundColor Cyan
ffmpeg -i $InputVideo `
    -c:v libvpx-vp9 `
    -crf 35 `
    -b:v 0 `
    -vf scale=1920:1080 `
    -r 30 `
    -an `
    "public\background-video.webm" `
    -y

# Create poster image
Write-Host "Creating poster image..." -ForegroundColor Cyan
ffmpeg -i $InputVideo `
    -ss 00:00:02 `
    -vframes 1 `
    -q:v 2 `
    "public\background-video-poster.jpg" `
    -y

# Show file sizes
Write-Host "`nOptimization complete! File sizes:" -ForegroundColor Green
Get-ChildItem public\background-video* | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB, 2)}}
```

Run with:
```powershell
.\scripts\optimize-video.ps1
```

## Notes

- The original video should be kept as backup
- Optimized videos should be committed to git (if < 5MB)
- Consider using a CDN for video hosting in production
- Test on actual mobile devices, not just browser DevTools
