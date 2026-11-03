# LOCAL TESTING ONLY. Runs Connect Maratha on this PC with its own throw-away database in Docker, so you can try new
# features (the CRM pages, for example) without touching the live site or the live server.
#
#   .\local\local-dev.ps1 up         start the local database, create the tables, add the test accounts
#   .\local\local-dev.ps1 backend    start the Java backend (new window)   -> http://localhost:5000/api/health
#   .\local\local-dev.ps1 frontend   start the website (new window)        -> http://localhost:3000
#   .\local\local-dev.ps1 reset      throw the local database away and make a fresh one
#   .\local\local-dev.ps1 down       stop the local database (the data stays until "reset")
#   .\local\local-dev.ps1 status     what is running
#
# It uses only localhost. It never connects to the VPS, never uses the live DATABASE_URL, never pushes anything.

param([Parameter(Position = 0)][ValidateSet('up', 'backend', 'frontend', 'reset', 'down', 'status')][string]$Action = 'status')

$ErrorActionPreference = 'Stop'
$Repo = Split-Path -Parent $PSScriptRoot                  # E:\community_mobile (backend, migrations, this script)
$Web = 'E:\community_mobile_main'                         # the website checkout
$Container = 'cm-local-pg'
$DbPort = 55432
$DbUrl = "postgres://postgres:local@localhost:$DbPort/cm_local"

# The same tables the tests build, then the newer ones (the backend also creates what it needs on first use).
$Migrations = @(
  '001_initial.sql', '001_create_location_hierarchy.sql', '002_security_moderation.sql', '003_account_lifecycle.sql',
  '004_referrals.sql', '004_password_resets.sql', '005_media.sql', '006_meetings_columns.sql', '007_directory_records.sql',
  '008_enquiries.sql', '009_referrals_business.sql', '010_meetings_mode.sql', '011_chapters.sql', '012_blood_help.sql',
  '013_job_applications.sql', '014_job_alerts.sql', '015_speakers.sql', '016_officers.sql', '017_crm_units.sql', '018_crm_activities.sql',
  '019_crm_unit_area.sql'
)
$ExtraColumns = @"
ALTER TABLE members ADD COLUMN IF NOT EXISTS reference_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS referral_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS photo TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS country_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS state_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS district_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS taluka_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS village_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS taluka TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS village TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'password';
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_login_at TEXT;
"@

function Need-Docker {
  docker info *> $null
  if ($LASTEXITCODE -ne 0) {
    throw 'Docker Desktop is not running. Start Docker Desktop, wait until it says the engine is running, then run this again.'
  }
}

function Exists-Container { (docker ps -a --filter "name=^$Container$" --format '{{.Names}}') -eq $Container }

# Runs one SQL file inside the container (copied in first, so Marathi text and the byte-order mark are handled correctly).
function Run-Sql([string]$path) {
  $clean = Join-Path $env:TEMP ('cm-local-' + [IO.Path]::GetFileName($path))
  $text = [IO.File]::ReadAllText($path).TrimStart([char]0xFEFF)
  [IO.File]::WriteAllText($clean, $text, (New-Object Text.UTF8Encoding $false))
  docker cp $clean "${Container}:/tmp/run.sql" | Out-Null
  docker exec $Container psql -U postgres -d cm_local -v ON_ERROR_STOP=1 -q -f /tmp/run.sql | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Running $path failed." }
  Remove-Item $clean -ErrorAction SilentlyContinue
}

function Up {
  Need-Docker
  if (Exists-Container) {
    docker start $Container | Out-Null
  } else {
    Write-Host 'Creating the local database container (first time only: it downloads PostgreSQL, so it can take a minute)...'
    docker run -d --name $Container -e POSTGRES_PASSWORD=local -e POSTGRES_DB=cm_local -p "${DbPort}:5432" postgres:16 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not start the database container (is port 55432 already used?).' }
  }
  Write-Host 'Waiting for the database...'
  for ($i = 0; $i -lt 60; $i++) {
    docker exec $Container pg_isready -U postgres -d cm_local *> $null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
  }
  $has = (docker exec $Container psql -U postgres -d cm_local -tAc "SELECT to_regclass('public.members') IS NOT NULL").Trim()
  if ($has -ne 't') {
    Write-Host 'Creating the tables...'
    foreach ($file in $Migrations) { Run-Sql (Join-Path $Repo "database\migrations\$file") }
    $tmp = Join-Path $env:TEMP 'cm-local-extra.sql'
    [IO.File]::WriteAllText($tmp, $ExtraColumns, (New-Object Text.UTF8Encoding $false))
    Run-Sql $tmp
  }
  # an older local database made before the place columns existed gets them here (safe to repeat)
  Run-Sql (Join-Path $Repo 'database\migrations\019_crm_unit_area.sql')
  Write-Host 'Adding the test accounts and the CRM test data...'
  Run-Sql (Join-Path $PSScriptRoot 'seed-crm.sql')
  Run-Sql (Join-Path $PSScriptRoot 'seed-crm-area.sql')
  Write-Host ''
  Write-Host 'Local database is ready.' -ForegroundColor Green
  Write-Host 'Log in on the website with password123 and one of these e-mails:'
  Write-Host '  admin@local.test      admin       (sees everything)'
  Write-Host '  ceo@local.test        CEO         (sees everything, read only)'
  Write-Host '  state@local.test      owner of the State unit'
  Write-Host '  branch@local.test     owner of the Branch unit'
  Write-Host '  division@local.test   owner of the Division unit'
  Write-Host '  district@local.test   owner of the District unit (has staff and activities)'
  Write-Host '  taluka@local.test     owner of the Taluka unit'
  Write-Host '  staff@local.test      staff of the District unit'
  Write-Host '  free1@local.test, free2@local.test   members with no unit (to add as owner or staff)'
  Write-Host ''
  Write-Host 'Next: .\local\local-dev.ps1 backend   then   .\local\local-dev.ps1 frontend'
}

function Backend {
  Need-Docker
  if (-not (Exists-Container)) { throw 'The local database is not created yet. Run:  .\local\local-dev.ps1 up' }
  $cmd = "`$env:DATABASE_URL='$DbUrl'; `$env:PORT='5000'; `$env:JWT_SECRET='local-dev-secret-not-for-production'; " +
         "`$env:ALLOW_DEV_LOGIN_FALLBACK='true'; `$env:APP_PRODUCTION='false'; Set-Location '$Repo\backend-java'; mvn spring-boot:run"
  Start-Process powershell -ArgumentList '-NoExit', '-Command', $cmd
  Write-Host 'Backend is starting in a new window (about 30 seconds). Check:  http://localhost:5000/api/health'
}

function Frontend {
  if (-not (Test-Path "$Web\frontend\node_modules")) {
    Write-Host 'Installing the website packages (first time only)...'
    Push-Location "$Web\frontend"; npm install; Pop-Location
  }
  $branch = (git -C $Web rev-parse --abbrev-ref HEAD).Trim()
  Write-Host "Website folder is on branch: $branch  (use feat/crm-dashboards-website to see all the CRM pages)"
  Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$Web\frontend'; npm run dev"
  Write-Host 'Website is starting in a new window. Open:  http://localhost:3000/crm/dashboard'
}

switch ($Action) {
  'up'       { Up }
  'backend'  { Backend }
  'frontend' { Frontend }
  'reset'    { Need-Docker; if (Exists-Container) { docker rm -f $Container | Out-Null }; Up }
  'down'     { Need-Docker; if (Exists-Container) { docker stop $Container | Out-Null; Write-Host 'Local database stopped.' } }
  'status'   {
    docker info *> $null
    if ($LASTEXITCODE -ne 0) { Write-Host 'Docker Desktop is not running.' } else {
      if (Exists-Container) { docker ps -a --filter "name=^$Container$" --format 'database: {{.Names}} {{.Status}} port 55432' } else { Write-Host 'database: not created yet (run: up)' }
    }
    try { (Invoke-WebRequest -UseBasicParsing http://localhost:5000/api/health -TimeoutSec 3).Content } catch { Write-Host 'backend: not running on port 5000' }
    try { $null = Invoke-WebRequest -UseBasicParsing http://localhost:3000 -TimeoutSec 3; Write-Host 'website: running on port 3000' } catch { Write-Host 'website: not running on port 3000' }
  }
}
