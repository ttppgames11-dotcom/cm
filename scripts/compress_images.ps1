Add-Type -AssemblyName System.Drawing

function Optimize-Image {
    param(
        [string]$FilePath,
        [int]$Quality = 80,
        [int]$MaxWidth = 1600
    )

    try {
        $fileObj = Get-Item -LiteralPath $FilePath
        if ($fileObj.Length -lt 1500000) { return }

        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        $ms = [System.IO.MemoryStream]::new($bytes)
        $orig = [System.Drawing.Bitmap]::FromStream($ms)

        $w = $orig.Width
        $h = $orig.Height

        if ($w -gt $MaxWidth) {
            $newW = $MaxWidth
            $newH = [int]($h * ($MaxWidth / $w))
        } else {
            $newW = $w
            $newH = $h
        }

        $canvas = [System.Drawing.Bitmap]::new($newW, $newH)
        $g = [System.Drawing.Graphics]::FromImage($canvas)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $g.DrawImage($orig, 0, 0, $newW, $newH)

        $encoders = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
        $jpegCodec = $null
        foreach ($enc in $encoders) {
            if ($enc.MimeType -eq "image/jpeg") {
                $jpegCodec = $enc
                break
            }
        }

        if ($jpegCodec) {
            $encoderParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
            $encoderParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
                [System.Drawing.Imaging.Encoder]::Quality,
                [long]$Quality
            )

            $tempPath = $FilePath + ".optimized.tmp"
            $canvas.Save($tempPath, $jpegCodec, $encoderParams)

            $g.Dispose()
            $orig.Dispose()
            $canvas.Dispose()
            $ms.Dispose()

            $newSize = (Get-Item -LiteralPath $tempPath).Length
            if ($newSize -lt $fileObj.Length) {
                Move-Item -LiteralPath $tempPath -Destination $FilePath -Force
                $saved = [math]::Round(($fileObj.Length - $newSize) / 1048576, 2)
                $final = [math]::Round($newSize / 1048576, 2)
                $leaf = Split-Path -Leaf $FilePath
                Write-Host "Optimized $leaf -> $final MB (saved $saved MB)"
            } else {
                Remove-Item -LiteralPath $tempPath -Force
            }
        } else {
            $g.Dispose()
            $orig.Dispose()
            $canvas.Dispose()
            $ms.Dispose()
        }
    }
    catch {
        Write-Host "Skipped file"
    }
}

$targetDirs = @('frontend\public\assets\images', 'assets\images')
foreach ($dir in $targetDirs) {
    if (Test-Path $dir) {
        $imgFiles = Get-ChildItem -Path $dir -Recurse -File -Include *.jpg, *.jpeg | Where-Object { $_.Length -gt 1500000 }
        Write-Host "Processing $($imgFiles.Count) files in $dir..."
        foreach ($img in $imgFiles) {
            Optimize-Image -FilePath $img.FullName
        }
    }
}

Write-Host "Image optimization completed."
