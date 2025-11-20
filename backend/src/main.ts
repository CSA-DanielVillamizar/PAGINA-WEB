import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe, Logger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

const logger = new Logger('Bootstrap')

async function bootstrap(retry = 0) {
  try {
    const app = await NestFactory.create(AppModule, { bufferLogs: true })
    app.useLogger(logger)
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }))
  
  // API prefix
  app.setGlobalPrefix('api')
  
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('L.A.M.A. Medellín API')
    .setDescription('API para gestión de la Fundación L.A.M.A. Medellín')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)
  
    const port = process.env.PORT || 3000
    await app.listen(port, '0.0.0.0')
    logger.log(`Backend escuchando en puerto ${port}`)
    logger.log(`Swagger docs disponibles en /api/docs`)
  } catch (err) {
    logger.error(`Error al iniciar la aplicación (intento ${retry + 1}): ${(err as Error).message}`)
    if (retry < 4) {
      const delayMs = 3000 * (retry + 1)
      logger.warn(`Reintentando bootstrap en ${delayMs}ms...`)
      await new Promise(res => setTimeout(res, delayMs))
      return bootstrap(retry + 1)
    }
    logger.error('Falló el inicio después de múltiples intentos. Proceso abortado.')
    process.exit(1)
  }
}

bootstrap()
