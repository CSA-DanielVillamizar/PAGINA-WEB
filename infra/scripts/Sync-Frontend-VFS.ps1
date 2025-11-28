param(
    [Parameter(Mandatory=$false)]
    [string]$SourceFolder = "C:\\Users\\DanielVillamizar\\WebPageLAMAMedellinFoundation\\dist-frontend-zip",

    [Parameter(Mandatory=$false)]
    [string]$PublishSettingsPath = "C:\\Users\\DanielVillamizar\\Downloads\\lama-frontend-dev.PublishSettings"
)

$ErrorActionPreference = 'Stop'

Write-Host "=== Sincronizando contenido via Kudu VFS ===" -ForegroundColor Cyan

if(-not (Test-Path $SourceFolder)) { throw "No existe SourceFolder: $SourceFolder" }
if(-not (Test-Path $PublishSettingsPath)) { throw "No existe PublishSettings: $PublishSettingsPath" }

[xml]$xml = Get-Content $PublishSettingsPath
$zipProf = $xml.publishData.publishProfile | Where-Object { $_.publishMethod -eq 'ZipDeploy' } | Select-Object -First 1
if(-not $zipProf){ $zipProf = $xml.publishData.publishProfile | Where-Object { $_.publishMethod -eq 'MSDeploy' } | Select-Object -First 1 }
if(-not $zipProf){ throw "No se encontró perfil ZipDeploy/MSDeploy" }

$user = $zipProf.userName
$pass = $zipProf.userPWD
$kuduHost = ($zipProf.publishUrl -replace ':443','')
$pair = "$user`:$pass"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$authHeader = @{ Authorization = "Basic $basic" }
$vfsBase = "https://$kuduHost/api/vfs/site/wwwroot"

# Limpia wwwroot
Write-Host "Limpiando /site/wwwroot..." -ForegroundColor Yellow
try {
    $list = Invoke-RestMethod -Uri ("$vfsBase/") -Headers $authHeader -TimeoutSec 30
    foreach($f in $list){
        $name = $f.name
        if([string]::IsNullOrWhiteSpace($name)){ continue }
        if($f.mime -eq 'inode/directory'){
            $del = "$vfsBase/$name/?recursive=true"
            Invoke-RestMethod -Method DELETE -Uri $del -Headers (@{ Authorization = $authHeader.Authorization; 'If-Match'='*' }) -TimeoutSec 60 | Out-Null
        } else {
            $del = "$vfsBase/$name"
            Invoke-RestMethod -Method DELETE -Uri $del -Headers (@{ Authorization = $authHeader.Authorization; 'If-Match'='*' }) -TimeoutSec 60 | Out-Null
        }
    }
    Write-Host "[OK] wwwroot limpio" -ForegroundColor Green
} catch { Write-Host "[WARN] No se pudo limpiar: $($_.Exception.Message)" -ForegroundColor DarkYellow }

# Crear directorios primero
Write-Host "Creando directorios..." -ForegroundColor Gray
$dirs = Get-ChildItem -Path $SourceFolder -Recurse -Directory | Sort-Object FullName
foreach($d in $dirs){
    $rel = $d.FullName.Substring($SourceFolder.Length)
    $rel = $rel -replace '^[\\/]+',''
    if([string]::IsNullOrWhiteSpace($rel)){ continue }
    $rel = $rel -replace '\\','/'
    $uri = "$vfsBase/$rel/"
    try {
        Invoke-RestMethod -Method PUT -Uri $uri -Headers (@{ Authorization = $authHeader.Authorization; 'If-Match'='*' }) -ContentType 'application/octet-stream' -Body ([byte[]]@()) -TimeoutSec 60 | Out-Null
    } catch {
        Write-Host "[DIR WARN] $rel - $($_.Exception.Response.StatusCode.value__)" -ForegroundColor DarkYellow
    }
}

# Subir archivos
Write-Host "Subiendo archivos..." -ForegroundColor Gray
$files = Get-ChildItem -Path $SourceFolder -Recurse -File
$idx = 0
$total = $files.Count
foreach($f in $files){
    $idx++
    $rel = $f.FullName.Substring($SourceFolder.Length)
    $rel = $rel -replace '^[\\/]+',''
    $rel = $rel -replace '\\','/'
    $uri = "$vfsBase/$rel"
    $bytes = [IO.File]::ReadAllBytes($f.FullName)
    try {
        Invoke-RestMethod -Method PUT -Uri $uri -Headers (@{ Authorization = $authHeader.Authorization; 'If-Match'='*' }) -ContentType 'application/octet-stream' -Body $bytes -TimeoutSec 300 | Out-Null
        if($idx % 50 -eq 0){ Write-Host ("[ {0}/{1} ] {2}" -f $idx, $total, $rel) }
    } catch {
        $code = if($_.Exception.Response){ [int]$_.Exception.Response.StatusCode } else { -1 }
        Write-Host "[FILE ERR] $rel ($code)" -ForegroundColor Red
        throw
    }
}

Write-Host "[OK] Sincronizacion completada" -ForegroundColor Green
