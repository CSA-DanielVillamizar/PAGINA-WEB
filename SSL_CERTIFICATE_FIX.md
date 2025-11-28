# Solución de Problemas: Errores SSL en Azure CLI

## Problema

Error al ejecutar comandos `az`:
```
[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate
```

O en PowerShell:
```
Missing ] at end of attribute or type literal.
Unexpected token ':' in expression or statement.
```

## Causa

Tu red corporativa usa un proxy con certificado autofirmado que intercepta el tráfico HTTPS. Azure CLI intenta verificar los certificados SSL pero falla porque no confía en el certificado del proxy.

## Solución Rápida

Ejecuta este comando antes de usar Azure CLI en cada sesión de PowerShell:

```powershell
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = '1'
$env:PYTHONWARNINGS = 'ignore:Unverified HTTPS request'
```

O simplemente ejecuta el script incluido:
```powershell
.\Setup-AzureCLI-Environment.ps1
```

## Solución Permanente

Agrega estas líneas a tu perfil de PowerShell para que se apliquen automáticamente:

1. Abrir el perfil:
   ```powershell
   notepad $PROFILE
   ```

2. Agregar al final del archivo:
   ```powershell
   # Configuración para Azure CLI con proxy corporativo
   $env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = '1'
   $env:PYTHONWARNINGS = 'ignore:Unverified HTTPS request'
   ```

3. Guardar y cerrar. La próxima vez que abras PowerShell, estará configurado automáticamente.

## Verificación

Prueba que funciona:
```powershell
az webapp list -o table
```

Deberías ver la lista de web apps sin errores (solo warnings que puedes ignorar).

## Alternativa: Instalar Certificado del Proxy

Si prefieres no deshabilitar la verificación SSL:

1. Obtener el certificado del proxy de tu empresa (archivo .crt o .cer)
2. Instalarlo en el almacén de certificados de confianza de Windows
3. Configurar Azure CLI para usar ese certificado:
   ```powershell
   az config set core.ca_bundle=C:\path\to\corporate-proxy-cert.crt
   ```

Consulta con tu departamento de IT para obtener el certificado corporativo.

## Seguridad

⚠️ **Importante**: Deshabilitar la verificación SSL reduce la seguridad. Solo hazlo en redes corporativas de confianza. Nunca en redes públicas o no confiables.

## Recursos

- [Azure CLI detrás de un proxy](https://learn.microsoft.com/cli/azure/use-cli-effectively#work-behind-a-proxy)
- [Configuración de certificados SSL](https://github.com/Azure/azure-cli/blob/dev/doc/use_cli_with_proxy.md)
