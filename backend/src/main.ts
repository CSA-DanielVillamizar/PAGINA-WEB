import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
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
  await app.listen(port)
  console.log(`Backend listening on http://localhost:${port}`)
  console.log(`Swagger docs: http://localhost:${port}/api/docs`)
}

bootstrap()
