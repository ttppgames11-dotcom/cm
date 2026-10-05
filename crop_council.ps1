Add-Type -AssemblyName System.Drawing

$pDr = "c:\Users\Shasa\Desktop\cm\frontend\public\assets\images\achievers\dr_jaysingrao_pawar.jpg"
$pAdv = "c:\Users\Shasa\Desktop\cm\frontend\public\assets\images\achievers\advocate_portrait.jpg"
$pProf = "c:\Users\Shasa\Desktop\cm\frontend\public\assets\images\achievers\prof_sujata_patel.jpg"
$pCol = "c:\Users\Shasa\Desktop\cm\frontend\public\assets\images\achievers\db_shekatkar.jpg"

$destDir = "c:\Users\Shasa\Desktop\cm\frontend\public\assets\images\council"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force }

function Crop-Image {
    param(
        [string]$srcPath,
        [string]$destPath,
        [int]$cropX,
        [int]$cropY,
        [int]$cropW,
        [int]$cropH,
        [int]$outW,
        [int]$outH
    )
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap $outW, $outH
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $destRect = New-Object System.Drawing.Rectangle 0, 0, $outW, $outH
    $srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH
    
    $gfx.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $gfx.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Host "Created $destPath"
}

# 1. Dr. Jaysingrao Pawar
$srcDr = [System.Drawing.Image]::FromFile($pDr)
$w = $srcDr.Width
$h = $srcDr.Height
$srcDr.Dispose()
Write-Host "Dr Pawar original size: $w x $h"
$cx = [int]($w * 0.72)
$cy = [int]($h * 0.14)
$cw = [int]($w * 0.27)
$ch = [int]($h * 0.45)
Crop-Image $pDr (Join-Path $destDir "council_historian.jpg") $cx $cy $cw $ch 480 360

# 2. Advocate Rudra Vikram / Patil (Head and shoulders)
$srcAdv = [System.Drawing.Image]::FromFile($pAdv)
$aw = $srcAdv.Width
$ah = $srcAdv.Height
$srcAdv.Dispose()
$acw = [int]($aw * 0.85)
$ach = [int]($ah * 0.75)
$acx = [int](($aw - $acw) / 2)
$acy = [int]($ah * 0.05)
Crop-Image $pAdv (Join-Path $destDir "council_legal.jpg") $acx $acy $acw $ach 480 360

# 3. Prof Sujata Patel / Anuradha More (Head and shoulders)
$srcProf = [System.Drawing.Image]::FromFile($pProf)
$pw = $srcProf.Width
$ph = $srcProf.Height
$srcProf.Dispose()
$pcw = [int]($pw * 0.8)
$pch = [int]($ph * 0.7)
$pcx = [int](($pw - $pcw) / 2)
$pcy = [int]($ph * 0.04)
Crop-Image $pProf (Join-Path $destDir "council_women_education.jpg") $pcx $pcy $pcw $pch 480 360

# 4. Col Vijayrao Salunkhe / MLI Officer (Head and chest with uniform & medals)
$srcCol = [System.Drawing.Image]::FromFile($pCol)
$cw_col = $srcCol.Width
$ch_col = $srcCol.Height
$srcCol.Dispose()
$col_w = [int]($cw_col * 0.85)
$col_h = [int]($ch_col * 0.7)
$col_x = [int](($cw_col - $col_w) / 2)
$col_y = [int]($ch_col * 0.02)
Crop-Image $pCol (Join-Path $destDir "council_defence.jpg") $col_x $col_y $col_w $col_h 480 360
