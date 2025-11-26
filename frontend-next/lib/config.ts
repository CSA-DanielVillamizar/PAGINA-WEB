// Configuración centralizada de frontend
// Documentación: expone la URL base del backend para llamadas HTTP.
// Usa NEXT_PUBLIC_API_BASE si está definida, de lo contrario apunta al App Service dev.
// Nota: declaramos `process` para evitar errores de tipos en entornos de navegador.
declare const process: any;
export const API_BASE: string = (process?.env?.NEXT_PUBLIC_API_BASE as string) ||
  'https://lama-backend-dev.azurewebsites.net/api';
