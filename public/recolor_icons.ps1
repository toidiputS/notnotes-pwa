Add-Type -AssemblyName System.Drawing

$baseDir = "d:\NotNotes-pwa\public"
$files = @("icon-192.png", "icon-512.png")
$outFiles = @("icon-192x192.png", "icon-512x512.png")

# Target dark slate background #020617 (R:2, G:6, B:23)
$bgR = 2
$bgG = 6
$bgB = 23

for ($i = 0; $i -lt $files.Length; $i++) {
    $inFile = Join-Path $baseDir $files[$i]
    $outFile = Join-Path $baseDir $outFiles[$i]

    if (Test-Path $inFile) {
        $bmp = New-Object System.Drawing.Bitmap $inFile
        $width = $bmp.Width
        $height = $bmp.Height

        for ($x = 0; $x -lt $width; $x++) {
            for ($y = 0; $y -lt $height; $y++) {
                $pixel = $bmp.GetPixel($x, $y)
                # If pixel is near-white
                if ($pixel.R -gt 240 -and $pixel.G -gt 240 -and $pixel.B -gt 240) {
                    $newColor = [System.Drawing.Color]::FromArgb($pixel.A, $bgR, $bgG, $bgB)
                    $bmp.SetPixel($x, $y, $newColor)
                }
            }
        }
        $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        Write-Host "Processed and saved: $outFile"
    } else {
        Write-Host "File not found: $inFile"
    }
}
