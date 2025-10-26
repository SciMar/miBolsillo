import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje = 'Ocurrió un error inesperado';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response: any = exception.getResponse(); // 👈 cambio aquí

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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
