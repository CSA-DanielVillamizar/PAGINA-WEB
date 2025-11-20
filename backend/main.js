// Wrapper para Azure App Service cuando el script de inicio asume 'node main.js'.
// Redirige la ejecución al archivo compilado en dist/main.js.
// Documentación: Este archivo evita que Oryx genere un startup incorrecto si no detecta scripts personalizados.

require('./dist/main.js');
