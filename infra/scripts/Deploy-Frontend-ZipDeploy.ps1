param(
    [Parameter(Mandatory=$false)]
    [string]$ZipPath = "C:\\Users\\DanielVillamizar\\WebPageLAMAMedellinFoundation\\deploy-frontend-final.zip",

    [Parameter(Mandatory=$false)]
    [string]$PublishSettingsPath = "C:\\Users\\DanielVillamizar\\Downloads\\lama-frontend-dev.PublishSettings"
)

Write-Host "=== Deploy Frontend (ZipDeploy + Publish Profile) ===" -ForegroundColor Cyan

# 1) Validaciones
if(-not (Test-Path $ZipPath)) { throw "ZIP no encontrado: $ZipPath" }
if(-not (Test-Path $PublishSettingsPath)) { throw "PublishSettings no encontrado: $PublishSettingsPath" }
$zipSizeMB = [Math]::Round(((Get-Item $ZipPath).Length/1MB),2)
Write-Host "ZIP: $ZipPath ($zipSizeMB MB)" -ForegroundColor Gray

# 2) Cargar Publish Profile (ZipDeploy preferred)
[xml]$xml = Get-Content $PublishSettingsPath
$zipProf = $xml.publishData.publishProfile | Where-Object { $_.publishMethod -eq 'ZipDeploy' } | Select-Object -First 1
if(-not $zipProf){
    $zipProf = $xml.publishData.publishProfile | Where-Object { $_.publishMethod -eq 'MSDeploy' } | Select-Object -First 1
}
if(-not $zipProf){ throw "No se encontró perfil ZipDeploy/MSDeploy en PublishSettings" }
$user = $zipProf.userName
$pass = $zipProf.userPWD
$kuduHost = ($zipProf.publishUrl -replace ':443','')
if([string]::IsNullOrWhiteSpace($user) -or [string]::IsNullOrWhiteSpace($pass)) { throw "Credenciales vacías en PublishSettings" }
$pair = "$user`:$pass"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$authHeader = @{ Authorization = "Basic $basic" }

$zipDeployUri = "https://$kuduHost/api/zipdeploy"
$deployLatestUri = "https://$kuduHost/api/deployments/latest"
$vfsRoot = "https://$kuduHost/api/vfs/site/wwwroot/"

Write-Host "Kudu: https://$kuduHost" -ForegroundColor Gray

# 3) Limpiar wwwroot
Write-Host "Limpiando /site/wwwroot..." -ForegroundColor Yellow
try {
    $files = Invoke-RestMethod -Uri $vfsRoot -Headers $authHeader -TimeoutSec 30
    foreach($f in $files){
        $name = $f.name
        if([string]::IsNullOrWhiteSpace($name)) { continue }
        if($f.mime -eq 'inode/directory'){
            $delUri = "$vfsRoot$name/" + "?recursive=true"
            Invoke-RestMethod -Method DELETE -Uri $delUri -Headers (@{ Authorization = $authHeader.Authorization; 'If-Match'='*' }) -TimeoutSec 60 | Out-Null
        } else {
            $delUri = "$vfsRoot$name"
            Invoke-RestMethod -Method DELETE -Uri $delUri -Headers (@{ Authorization = $authHeader.Authorization; 'If-Match'='*' }) -TimeoutSec 60 | Out-Null
        }
    }
    Write-Host "✓ wwwroot limpio" -ForegroundColor Green
} catch {
    Write-Host "⚠ No se pudo limpiar totalmente wwwroot: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 4) ZipDeploy
Write-Host "Subiendo ZIP a ZipDeploy..." -ForegroundColor Cyan
try {
    $resp = Invoke-WebRequest -Uri $zipDeployUri -Method POST -InFile $ZipPath -Headers $authHeader -ContentType "application/zip" -TimeoutSec 900
    Write-Host "✓ Solicitud aceptada ($($resp.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Error subiendo ZIP: $($_.Exception.Message)" -ForegroundColor Red
    if($_.Exception.Response){ Write-Host "  Status: $([int]$_.Exception.Response.StatusCode)" -ForegroundColor Yellow }
    throw
}

# 5) Monitorear despliegue
Write-Host "Monitoreando estado (hasta 3 min)..." -ForegroundColor Cyan
$maxPoll = 60
for($i=0; $i -lt $maxPoll; $i++){
    try {
        $st = Invoke-RestMethod -Uri $deployLatestUri -Headers $authHeader -TimeoutSec 30
        $state = $st.status
        $msg = ($st.message -replace "\r|\n"," ")
        if($state){ Write-Host ("  [{0:D2}] {1} - {2}" -f $i, $state, $msg) }
        if($state -eq 'Success'){ Write-Host "✓ Deployment completado" -ForegroundColor Green; break }
        if($state -eq 'Failed'){
            Write-Host "✗ Deployment falló" -ForegroundColor Red
            if($st.log_url){ Write-Host "Logs: $($st.log_url)" -ForegroundColor Yellow }
            break
        }
    } catch {
        Write-Host ("  [{0:D2}] Aún sin confirmación (Kudu)" -f $i) -ForegroundColor DarkYellow
    }
    Start-Sleep -Seconds 3
}

# 6) Verificar archivos críticos en wwwroot
Write-Host "Verificando contenido de /site/wwwroot..." -ForegroundColor Cyan
try {
    $files = Invoke-RestMethod -Uri $vfsRoot -Headers $authHeader -TimeoutSec 30
    $files | ForEach-Object { $k = if($_.mime -eq 'inode/directory'){ '[DIR]' } else { '[FILE]' }; Write-Host "  $k $($_.name)" }
    $hasServer = ($files | Where-Object { $_.name -eq 'server.js' })
    $hasNext = ($files | Where-Object { $_.name -eq '.next' })
    $hasModules = ($files | Where-Object { $_.name -eq 'node_modules' })
    if($hasServer -and $hasNext -and $hasModules){
        Write-Host "✓ Archivos críticos presentes (.next, node_modules, server.js)" -ForegroundColor Green
    } else {
        Write-Host "⚠ Archivos críticos faltantes. Revisa el ZIP" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ No se pudo listar wwwroot: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# Cierre de cualquier bloque pendiente (defensa contra errores de parsing)
}

Write-Host "=== Fin del despliegue (ZipDeploy) ===" -ForegroundColor Cyan
