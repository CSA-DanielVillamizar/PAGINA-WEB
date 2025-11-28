# Empaqueta el backend para despliegue en Azure Web App
$ErrorActionPreference = "Stop"

Write-Host "=== Empaquetando Backend para Azure ===" -ForegroundColor Cyan

$backendPath = "backend"
$deployPath = "$backendPath/deploy"
$zipPath = "$backendPath/deploy-backend.zip"

# Limpiar deploy anterior
if (Test-Path $deployPath) {
    Write-Host "Limpiando carpeta deploy anterior..." -ForegroundColor Yellow
    Remove-Item -Path $deployPath -Recurse -Force
}
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

# Crear carpeta deploy
New-Item -Path $deployPath -ItemType Directory | Out-Null

# Copiar archivos necesarios
Write-Host "Copiando archivos..." -ForegroundColor Yellow
Copy-Item -Path "$backendPath/dist" -Destination "$deployPath/dist" -Recurse
Copy-Item -Path "$backendPath/node_modules" -Destination "$deployPath/node_modules" -Recurse -ErrorAction SilentlyContinue
Copy-Item -Path "$backendPath/package.json" -Destination "$deployPath/"
Copy-Item -Path "$backendPath/package-lock.json" -Destination "$deployPath/" -ErrorAction SilentlyContinue

# Crear archivo web.config para Azure
$webConfig = @'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/main.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^dist/main.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="dist/main.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
'@
$webConfig | Out-File -FilePath "$deployPath/web.config" -Encoding UTF8

Write-Host "Creando ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "$deployPath/*" -DestinationPath $zipPath -Force

# Limpiar carpeta temporal
Remove-Item -Path $deployPath -Recurse -Force

$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "`n=== Package creado ===" -ForegroundColor Green
Write-Host "Ubicación: $zipPath" -ForegroundColor Cyan
Write-Host "Tamaño: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
Write-Host "`nPara desplegar:" -ForegroundColor Yellow
Write-Host "az webapp deployment source config-zip -g rg-lama-dev -n lama-dev-backend --src $zipPath"
