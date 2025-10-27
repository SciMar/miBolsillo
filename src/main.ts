import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

// 🔥 Filtro global de excepciones
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje = 'Ocurrió un error inesperado';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response: any = exception.getResponse();

      if (typeof response === 'string') {
        mensaje = response;
      } else if (response?.message) {
        mensaje = Array.isArray(response.message)
          ? response.message[0]
          : response.message;
      }
    } else if (exception?.code === 'ER_NO_REFERENCED_ROW_2') {
      status = HttpStatus.BAD_REQUEST;
      mensaje = 'El usuario o la categoría especificada no existe';
    } else if (exception?.code === 'ER_NO_DEFAULT_FOR_FIELD') {
      status = HttpStatus.BAD_REQUEST;
      mensaje = 'Faltan campos obligatorios en la solicitud';
    } else if (exception?.code === 'ER_DUP_ENTRY') {
      status = HttpStatus.BAD_REQUEST;
      mensaje = 'Ya existe un registro con esos datos';
    }

    if (typeof mensaje === 'string' && mensaje.startsWith('Cannot')) {
      status = HttpStatus.NOT_FOUND;
      mensaje = 'La ruta solicitada no existe';
    }

    res.status(status).json({ mensaje });
  }
}

// 🚀 Función principal que arranca la app
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permitir CORS (para frontend)
  app.enableCors();

  // Prefijo global para tus rutas (opcional pero recomendado)
  app.setGlobalPrefix('api');

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades que no están en el DTO
      transform: true, // convierte tipos automáticamente
      transformOptions: { enableImplicitConversion: true }, // permite conversiones automáticas (string → number)
    }),
  );

  // Verificar la conexión a la base de datos
  const dataSource = app.get(DataSource);
  if (!dataSource.isInitialized) {
  try {
    await dataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Conexión a la base de datos ya estaba establecida');
}
  
  // Filtro global de errores
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
}
bootstrap();

