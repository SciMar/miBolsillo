import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/entities/user.entity';
import { User } from '../auth/decorators/user.decorator'; 
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

/* POST - crear transacción*/
  @Post()
  @ApiOperation({ summary: 'Crear una nueva transacción' })
  @ApiResponse({ status: 201, description: 'Transacción creada exitosamente.' })
  @ApiResponse({status:400, description:"Tipo de transacción inválido"})
  @ApiResponse({status:404, description:"La categoría seleccionada no existe"})
  async create(
    @Body() dto: CreateTransactionDto,
    @User() user: any
  ) {
    return this.service.create(dto, user);
  }
/* GET Obtener transacciones de un usuario filtradas por tipo (income/expense)*/
  
  @Get('user/:userId/grouped')
  @ApiOperation({ summary: 'Obtener transacciones de un usuario agrupadas por categoría' })
  @ApiResponse({ status: 200, description: 'Transacciones obtenidas exitosamente.' })
  @ApiResponse({ status: 404, description: 'No se encontraron transacciones para este usuario' })
  @Roles(RolesEnum.ADMIN)
  async findAllByUserGrouped(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findAllByUserGrouped(userId);
  }

/* GET - Obtener el balance general del usuario autenticado (total ingresos, total gastos y saldo)*/
  @Get('my-balance')
  @ApiOperation({ summary: 'Obtener el balance general del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Balance obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'El usuario no se encuentra registrado en la base de datos' })
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
  async getMyBalance(@Req() req) {
    console.log('Usuario autenticado:', req.user);
    const userId = req.user.id;
    return this.service.getBalance(userId);
  }

/*GET - Obtener el balance general de un usuario específico por su ID
* (total ingresos, total gastos y saldo) - Solo ADMIN
*/
  @Get('balance/:userId')
  @ApiOperation({ summary: 'Obtener el balance general de un usuario específico por su ID' })
  @ApiResponse({ status: 200, description: 'Balance obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'La transacción no fue encontrada en la base de datos' })
  @Roles(RolesEnum.ADMIN)
  async getBalance(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getBalance(userId);
  }

  /* Ruta genérica :id AL FINAL (captura todo lo demás)*/
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una transacción por su ID' })
  @ApiResponse({ status: 200, description: 'Transacción obtenida exitosamente de la base de datos' })
  @ApiResponse({ status: 404, description: 'La transacción no fue encontrada en la base de datos' })
  @Roles(RolesEnum.ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /* Actualizar una transacción existente*/
@Patch(':id')
@ApiOperation({ summary: 'Actualizar una transacción existente' })
@ApiResponse({ status: 200, description: 'Transacción actualizada exitosamente.' })
@ApiResponse({ status: 404, description: 'La transacción no fue encontrada en la base de datos' })
@ApiResponse({ status: 403, description: 'No tienes permiso para actualizar esta transacción, su rol debe ser administrador' })
@Roles(RolesEnum.PREMIUM, RolesEnum.ADMIN)
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateTransactionDto,
  @User() user: any
) {
  return this.service.update(id, dto, user);
}

  /* Eliminar una transacción*/
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una transacción por su ID' })
  @ApiResponse({ status: 200, description: 'Transacción eliminada exitosamente de la base de datos' })
  @ApiResponse({ status: 404, description: 'La transacción no fue encontrada en la base de datos' })
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id); // Elimina transacción y ajusta el presupuesto
  }
}