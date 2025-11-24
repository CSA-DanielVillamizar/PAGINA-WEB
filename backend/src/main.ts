import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe, Logger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

const logger = new Logger('Bootstrap')

async function bootstrap(retry = 0) {
  try {
    logger.log('=== INICIO BOOTSTRAP ===')
    logger.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`)
    logger.log(`PORT: ${process.env.PORT || 'unset'}`)
    logger.log(`DISABLE_DB: ${process.env.DISABLE_DB || '0'}`)
    logger.log(`Node version: ${process.version}`)
    logger.log(`CWD: ${process.cwd()}`)
    logger.log(`Memory: ${JSON.stringify(process.memoryUsage())}`)
    
    logger.log('Paso 1: Creando aplicación NestJS...')
    const app = await NestFactory.create(AppModule, { 
      bufferLogs: true,
      logger: ['error', 'warn', 'log', 'debug', 'verbose']
    })
    app.useLogger(logger)
    logger.log('✓ Aplicación NestJS creada exitosamente')
    logger.log('✓ Aplicación NestJS creada exitosamente')
  
  logger.log('Paso 2: Configurando validation pipe...')
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }))
  logger.log('✓ Validation pipe configurado')
  
  logger.log('Paso 3: Configurando API prefix...')
  // API prefix
  app.setGlobalPrefix('api')
  logger.log('✓ API prefix configurado')
  
  logger.log('Paso 4: Configurando CORS...')
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
  logger.log('✓ CORS configurado')
  
  logger.log('Paso 5: Configurando Swagger...')
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('L.A.M.A. Medellín API')
    .setDescription('API para gestión de la Fundación L.A.M.A. Medellín')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)
  logger.log('✓ Swagger configurado')

  logger.log('Paso 6: Configurando health endpoint raíz...')
  // Endpoint raíz /health (sin prefijo) para probes externos (pipeline y Azure)
  // Mantiene el existente /api/health del controlador.
  const expressInstance = app.getHttpAdapter().getInstance()
  if (expressInstance?.get) {
    expressInstance.get('/health', (_req: any, res: any) => {
      res.json({ status: 'ok', service: 'lama-backend', uptime: process.uptime() })
    })
    logger.log('✓ Health endpoint configurado')
  } else {
    logger.warn('⚠ No se pudo configurar health endpoint (express instance no disponible)')
  }
  
  logger.log('Paso 7: Iniciando servidor HTTP...')
  // Azure App Service suele requerir puerto 8080 si PORT no está definido
  const port = process.env.PORT || '8080'
    await app.listen(port, '0.0.0.0')
    logger.log(`✓ Servidor HTTP escuchando en puerto ${port}`)
    logger.log('=== APLICACIÓN INICIADA EXITOSAMENTE ===')
    logger.log(`URL: http://0.0.0.0:${port}`)
    logger.log(`Swagger: http://0.0.0.0:${port}/api/docs`)
    logger.log(`Health: http://0.0.0.0:${port}/health`)
  } catch (err) {
    logger.error('=== ERROR FATAL DURANTE BOOTSTRAP ===')
    logger.error(`Intento: ${retry + 1}/5`)
    logger.error(`Tipo de error: ${(err as Error)?.constructor?.name || 'Unknown'}`)
    logger.error(`Mensaje: ${(err as Error)?.message || 'No message'}`)
    if ((err as Error)?.stack) {
      logger.error('Stack trace completo:')
      logger.error((err as Error).stack)
    }
    // Mostrar todas las propiedades del error
    try {
      logger.error('Propiedades del error:', JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2))
    } catch {
      logger.error('No se pudo serializar el error')
    }
    logger.error('=== FIN ERROR ===')
    
    if (retry < 4) {
      const delayMs = 3000 * (retry + 1)
      logger.warn(`Reintentando bootstrap en ${delayMs}ms...`)
      await new Promise(res => setTimeout(res, delayMs))
      return bootstrap(retry + 1)
    }
    logger.error('Falló el inicio después de 5 intentos. Proceso abortado.')
    process.exit(1)
  }
}

bootstrap().catch(err => {
  console.error('=== BOOTSTRAP CRASHED COMPLETAMENTE ===')
  console.error('Error:', err)
  if (err?.stack) {
    console.error('Stack:', err.stack)
  }
  process.exit(1)
})
