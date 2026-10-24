# Runs on YOUR COMPUTER (PowerShell). Sends the latest `main` Java API (backend-java) to the server and deploys it safely.
#
#   cd E:\community_mobile_main
#   .\deploy\deploy.ps1
#
# It never changes anything on GitHub. On the server it backs up first, rebuilds only the
# Connect Maratha Java API (not Node, not epay), checks it is healthy, and puts the old version back if not.

param(
  [string]$Server = "root@200.234.43.252",
  [string]$Repo = "E:\community_mobile_main"
)

$ErrorActionPreference = "Stop"

function Run($what, [scriptblock]$cmd) {
  & $cmd
  if ($LASTEXITCODE -ne 0) { throw "$what failed (exit code $LASTEXITCODE)" }
}

Write-Host "`n== Getting the latest main from GitHub" -ForegroundColor Cyan
Run "git fetch" { git -C $Repo fetch origin }
$branch = (git -C $Repo rev-parse --abbrev-ref HEAD).Trim()
if ($branch -ne "main") { throw "You are on '$branch'. Run:  git -C $Repo checkout main" }
Run "git pull" { git -C $Repo pull --ff-only origin main }
$dirty = git -C $Repo status --porcelain -- backend-java deploy
if ($dirty) { throw "backend-java/deploy have uncommitted changes:`n$dirty`nCommit or discard them first (deploys only ever use what is on main)." }

$commit = (git -C $Repo rev-parse --short HEAD).Trim()
$subject = (git -C $Repo log -1 --format=%s).Trim()
Write-Host "`nAbout to deploy:  $commit  $subject" -ForegroundColor Yellow
Write-Host "Server: $Server  (only the Java API container api-java; Node and epay are not touched)"
$answer = Read-Host "Type YES to continue"
if ($answer -ne "YES") { Write-Host "Cancelled. Nothing was changed."; exit 0 }

Write-Host "`n== Packing backend-java" -ForegroundColor Cyan
$tar = Join-Path $env:TEMP "cm-java.tar"
Run "git archive" { git -C $Repo archive --format=tar -o $tar HEAD backend-java }

Write-Host "`n== Uploading" -ForegroundColor Cyan
Run "scp tar" { scp $tar "${Server}:/tmp/cm-java.tar" }
# The script is sent separately, so the very first deploy works too, and carriage returns are removed on the way.
Run "scp script" { scp (Join-Path $Repo "deploy\remote-deploy-java.sh") "${Server}:/tmp/cm-remote-deploy-java.sh" }

Write-Host "`n== Deploying on the server (this takes a minute or two)" -ForegroundColor Cyan
ssh $Server "tr -d '\r' < /tmp/cm-remote-deploy-java.sh > /tmp/cm-remote-deploy-java.run.sh && sh /tmp/cm-remote-deploy-java.run.sh /tmp/cm-java.tar"
$code = $LASTEXITCODE
Remove-Item $tar -ErrorAction SilentlyContinue

if ($code -ne 0) {
  Write-Host "`nThe deploy did NOT finish cleanly. Read the messages above (they say whether it rolled back)." -ForegroundColor Red
  exit $code
}

Write-Host "`n== Checking the live site" -ForegroundColor Cyan
Start-Sleep -Seconds 5
curl.exe -s https://api.connectmaratha.com/api/health
Write-Host "`n`nDeployed $commit." -ForegroundColor Green
