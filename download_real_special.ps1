$headers = @{
    'User-Agent' = 'ConnectMaratha/1.0 (contact@connectmaratha.com)'
}

$targets = @(
    @{ name='real-jijabai-pune.jpg'; url='https://commons.wikimedia.org/wiki/Special:FilePath/Jijamata_statue_Pune.jpg' },
    @{ name='real-tarabai-statue.jpg'; url='https://commons.wikimedia.org/wiki/Special:FilePath/Statue_of_Maharani_Tarabai.jpg' },
    @{ name='real-ahilyabai-statue.jpg'; url='https://commons.wikimedia.org/wiki/Special:FilePath/Statue_of_Ahilya_Bai_Holkar_at_Maheshwar.jpg' },
    @{ name='real-anandibai-photo.jpg'; url='https://commons.wikimedia.org/wiki/Special:FilePath/Anandibai_Joshee_(1886).jpg' }
)

foreach ($t in $targets) {
    try {
        $pub = "public/assets/images/$($t.name)"
        $front = "frontend/public/assets/images/$($t.name)"
        Invoke-WebRequest -Uri $t.url -Headers $headers -OutFile $pub -MaximumRedirection 10 -TimeoutSec 20
        Copy-Item $pub $front -Force
        $len = (Get-Item $pub).Length
        Write-Output "SUCCESS: $($t.name) ($len bytes)"
    } catch {
        Write-Output "FAIL $($t.name): $_"
    }
}
