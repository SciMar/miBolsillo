import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({summary:"Bienvenida al usuario a la API Mi Bolsillo"})
  @ApiResponse({status:200, description:"Mensaje de bienvenida"})
  getHello(): string {
    return this.appService.getHello();
  }
}
