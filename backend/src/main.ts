import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe, Logger } from '@nestjs/common'
// Swagger se cargará sólo si ENABLE_SWAGGER=1 para acelerar cold start.
import { ensureDatabaseInitialized, getDatabaseStatus, getDatabaseError } from './database/database.provider'

const logger = new Logger('Bootstrap')

/**
 * Arranca la aplicación NestJS con reintentos y añade diagnóstico explícito
 * de la conexión a PostgreSQL usando el DataSource una vez levantado el servidor.
 * Esto permite capturar errores de conexión (autenticación, SSL, DB inexistente)
 * incluso cuando TypeORM hace fallar silenciosamente el bootstrap.
 */
async function bootstrap(retry = 0) {
  try {
    logger.log('[BOOT] start env=' + (process.env.NODE_ENV || 'undefined') + ' port=' + (process.env.PORT || 'unset'))
    logger.log('[BOOT] flags disable_db=' + (process.env.DISABLE_DB || '0') + ' swagger=' + (process.env.ENABLE_SWAGGER || '0'))
    
    logger.log('[BOOT] creating app')
    const app = await NestFactory.create(AppModule, { 
      bufferLogs: true,
      logger: ['error', 'warn', 'log', 'debug', 'verbose']
    })
    app.useLogger(logger)
    logger.log('[BOOT] app created')
  
    logger.log('[BOOT] validation pipe')
    app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    }))
    logger.log('[BOOT] validation ready')
    
    logger.log('[BOOT] api prefix /api')
    app.setGlobalPrefix('api')
    logger.log('[BOOT] prefix ready')
    
    logger.log('[BOOT] cors setup')
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    })
    logger.log('[BOOT] cors ready')
    
    if (process.env.ENABLE_SWAGGER === '1') {
      logger.log('[BOOT] swagger enabled')
      const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger')
      const config = new DocumentBuilder().setTitle('LAMA API').setVersion('1.0').addBearerAuth().build()
      const document = SwaggerModule.createDocument(app, config)
      SwaggerModule.setup('api/docs', app, document)
      logger.log('[BOOT] swagger ready')
    } else {
      logger.log('[BOOT] swagger skipped')
    }

    logger.log('[BOOT] health endpoint')
    const expressInstance = app.getHttpAdapter().getInstance()
    if (expressInstance?.get) {
      expressInstance.get('/health', (_req: any, res: any) => {
        res.json({ status: 'ok', service: 'lama-backend', uptime: process.uptime() })
      })
      logger.log('[BOOT] health ready')
    } else {
      logger.warn('[BOOT] health not configured')
    }
    
    logger.log('[BOOT] listen')
    const port = process.env.PORT || '8080'
    await app.listen(port, '0.0.0.0')
    logger.log('[BOOT] listening port=' + port)

    // Paso 8: Inicialización LAZY de PostgreSQL en background (no bloquea startup)
    if (process.env.DISABLE_DB !== '1') {
      logger.log('[DB LazyInit] trigger')
      void (async () => {
        logger.log('[DB LazyInit] start')
        const start = Date.now()
        await ensureDatabaseInitialized()
        const elapsed = Date.now() - start
        const status = getDatabaseStatus()
        if (status === 'connected') {
          logger.log(`[DB LazyInit] connected in ${elapsed}ms`)
        } else if (status === 'error') {
          const err = getDatabaseError()
          logger.error(`[DB LazyInit] error: ${err?.message}`)
        } else {
          logger.warn('[DB LazyInit] pending')
        }
      })()
    } else {
      logger.log('[DB LazyInit] skipped (disabled)')
    }

    logger.log('[BOOT] ready url=http://0.0.0.0:' + port)
  } catch (err) {
    logger.error('=== ERROR FATAL DURANTE BOOTSTRAP ===')
    logger.error(`Intento: ${retry + 1}/5`)
    logger.error(`Tipo de error: ${(err as Error)?.constructor?.name || 'Unknown'}`)
    logger.error(`Mensaje: ${(err as Error)?.message || 'No message'}`)
    if ((err as Error)?.stack) {
      logger.error('Stack trace completo:')
      logger.error((err as Error).stack)
    }
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
