param(
    [Parameter(Mandatory=$false)]
    [string]$FrontendPath = "C:\\Users\\DanielVillamizar\\WebPageLAMAMedellinFoundation\\frontend-next",

    [Parameter(Mandatory=$false)]
    [string]$OutputZip = "C:\\Users\\DanielVillamizar\\WebPageLAMAMedellinFoundation\\deploy-frontend-fixed.zip"
)

$ErrorActionPreference = 'Stop'

Write-Host "=== Preparando ZIP standalone Next.js (separadores correctos) ===" -ForegroundColor Cyan

# Validaciones
if(-not (Test-Path $FrontendPath)) { throw "No existe FrontendPath: $FrontendPath" }
$standalone = Join-Path $FrontendPath ".next/standalone"
$staticPath = Join-Path $FrontendPath ".next/static"
$publicPath = Join-Path $FrontendPath "public"
if(-not (Test-Path $standalone)) { throw "No existe .next/standalone. Ejecuta npm run build en $FrontendPath" }
if(-not (Test-Path $staticPath)) { throw "No existe .next/static. Ejecuta npm run build en $FrontendPath" }

# Staging
$staging = Join-Path (Split-Path $OutputZip -Parent) "dist-frontend-zip"
if(Test-Path $staging){ Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Path $staging | Out-Null

# Copiar standalone a raíz del staging
Write-Host "Copiando .next/standalone -> staging" -ForegroundColor Gray
Copy-Item -Path (Join-Path $standalone "*") -Destination $staging -Recurse -Force

# Copiar .next/static
$newStatic = Join-Path $staging ".next/static"
New-Item -ItemType Directory -Path (Split-Path $newStatic -Parent) -Force | Out-Null
Write-Host "Copiando .next/static -> staging/.next/static" -ForegroundColor Gray
Copy-Item -Path $staticPath -Destination (Join-Path $staging ".next") -Recurse -Force

# Copiar public (si existe)
if(Test-Path $publicPath){
    Write-Host "Copiando public/ -> staging/public" -ForegroundColor Gray
    Copy-Item -Path $publicPath -Destination $staging -Recurse -Force
}

# Copiar .env.production si existe
$envProd = Join-Path $FrontendPath ".env.production"
if(Test-Path $envProd){
    Copy-Item -Path $envProd -Destination (Join-Path $staging ".env.production") -Force
}

# Borrar ZIP previo
if(Test-Path $OutputZip){ Remove-Item -Force $OutputZip }

# Empaquetar con tar (usa separadores POSIX en ZIP)
Write-Host "Empaquetando ZIP con tar.exe -> $OutputZip" -ForegroundColor Yellow
Push-Location $staging
try {
    & tar.exe -a -c -f $OutputZip *
    Write-Host "[OK] ZIP generado: $OutputZip" -ForegroundColor Green
} finally {
    Pop-Location
}

# Mostrar tamaño final
$size = [Math]::Round(((Get-Item $OutputZip).Length/1MB),2)
Write-Host "Tamano ZIP: $size MB" -ForegroundColor Gray

Write-Host "=== ZIP listo para ZipDeploy ===" -ForegroundColor Cyan
