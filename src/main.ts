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

/* Filtro global de excepciones*/
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    /*DEBUG: Imprime TODA la información del error*/
    console.log('=== ERROR CAPTURADO ===');
    console.log('Tipo:', exception?.constructor?.name);
    console.log('Mensaje:', exception?.message);
    console.log('Response:', exception?.response);
    console.log('======================');

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje = 'Ocurrió un error inesperado';

    /* Manejo de HttpException (incluye UnauthorizedException, BadRequestException, etc.)*/
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response: any = exception.getResponse();

      if (typeof response === 'string') {
        mensaje = response;
      } else if (response?.message) {
        mensaje = Array.isArray(response.message)
          ? response.message.join(', ')
          : response.message;
      }
    } 
    /* Errores de base de datos MySQL*/
    else if (exception?.code === 'ER_NO_REFERENCED_ROW_2') {
      status = HttpStatus.BAD_REQUEST;
      mensaje = 'El usuario o la categoría especificada no existe';
    } else if (exception?.code === 'ER_NO_DEFAULT_FOR_FIELD') {
      status = HttpStatus.BAD_REQUEST;
      mensaje = 'Faltan campos obligatorios en la solicitud';
    } else if (exception?.code === 'ER_DUP_ENTRY') {
      status = HttpStatus.CONFLICT;
      mensaje = 'Ya existe un registro con esos datos';
    }
    /* Errores de rutas no encontradas*/
    else if (exception?.message?.includes('Cannot GET') || exception?.message?.includes('Cannot POST')) {
      status = HttpStatus.NOT_FOUND;
      mensaje = 'La ruta solicitada no existe';
    }
    /* Log del error real para debugging*/
    else {
      console.error('❌ Error no manejado:', exception);
    }

    /* Respuesta consistente*/
    res.status(status).json({
      statusCode: status,
      mensaje,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}

/* Función principal que arranca la app*/
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* Permitir CORS (para frontend)*/
  app.enableCors();

  /* Prefijo global para tus rutas (opcional pero recomendado)*/
  app.setGlobalPrefix('api');

  /* Validaciones globales*/
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  /*Verificar la conexión a la base de datos*/
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
  
  /* Filtro global de errores*/
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
}

bootstrap();