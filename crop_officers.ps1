Add-Type -AssemblyName System.Drawing

function Crop-Face {
    param(
        [string]$src,
        [string]$dst,
        [double]$rx,
        [double]$ry,
        [double]$rw,
        [double]$rh,
        [int]$outSize
    )
    $img = [System.Drawing.Image]::FromFile($src)
    $w = $img.Width
    $h = $img.Height
    $cx = [int]($w * $rx)
    $cy = [int]($h * $ry)
    $cw = [int]($w * $rw)
    $ch = [int]($h * $rh)
    
    $bmp = New-Object System.Drawing.Bitmap $outSize, $outSize
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $dRect = New-Object System.Drawing.Rectangle 0, 0, $outSize, $outSize
    $sRect = New-Object System.Drawing.Rectangle $cx, $cy, $cw, $ch
    $g.DrawImage($img, $dRect, $sRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()
    Write-Host "Cropped: $dst"
}

# 1. Sandeep Karnik (Face crop from officer_sandeep_karnik.jpg)
Crop-Face -src "c:\Users\Shasa\Desktop\cm\public\assets\images\officers\officer_sandeep_karnik.jpg" -dst "c:\Users\Shasa\Desktop\cm\public\assets\images\officers\officer_sandeep_face.jpg" -rx 0.25 -ry 0.25 -rw 0.5 -rh 0.45 -outSize 400
Copy-Item "c:\Users\Shasa\Desktop\cm\public\assets\images\officers\officer_sandeep_face.jpg" "c:\Users\Shasa\Desktop\cm\frontend\public\assets\images\officers\officer_sandeep_face.jpg" -Force

# 2. Roopa D Moudgil IPS (Face crop from officer_roopa_ips.jpg)
Crop-Face -src "c:\Users\Shasa\Desktop\cm\public\assets\images\officers\officer_roopa_ips.jpg" -dst "c:\Users\Shasa\Desktop\cm\public\assets\images\officers\officer_roopa_face.jpg" -rx 0.28 -ry 0.15 -rw 0.4 -rh 0.45 -outSize 400
Copy-Item "c:\Users\Shasa\Desktop\cm\public\assets\images\officers\officer_roopa_face.jpg" "c:\Users\Shasa\Desktop\cm\frontend\public\assets\images\officers\officer_roopa_face.jpg" -Force

# 3. Mahesh Zagade IAS (Clean Face crop from officer_mahesh_photo.jpg)
Crop-Face -src "c:\Users\Shasa\Desktop\cm\public\assets\images\officers\officer_mahesh_photo.jpg" -dst "c:\Users\Shasa\Desktop\cm\public\assets\images\officers\officer_mahesh_face.jpg" -rx 0.045 -ry 0.188 -rw 0.165 -rh 0.125 -outSize 400
Copy-Item "c:\Users\Shasa\Desktop\cm\public\assets\images\officers\officer_mahesh_face.jpg" "c:\Users\Shasa\Desktop\cm\frontend\public\assets\images\officers\officer_mahesh_face.jpg" -Force
