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
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  /*Configuración documentación Swagger*/
  const configDoc= new DocumentBuilder()
  .setTitle('API Mi Bolsillo')
  .setDescription('Dcoumentación de la API enfocada en la gestión de finanzas personales')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('Users', "Gestión de usuarios y perfiles")
  .addTag('Auth', "Autenticación y manejo de credenciales")
  .addTag('Budgets', "Control y seguimiento de presupuestos")
  .addTag('Categories', "Organización de categorías financieras (gastos e ingresos)")
  .addTag('Transactions', "Gestión de ingresos y gastos")
  .build();

  /*Crear documento con la api completa, su configuración y ruta de acceso*/
  const document=SwaggerModule.createDocument (app, configDoc); 
  /*Ruta de acceso a la documentación de la API Mi Bolsillo*/
  SwaggerModule.setup('/api/docs', app, document);

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

  console.log(`🚀 Servidor corriendo en http://localhost:${port}/api`);
  }

bootstrap();