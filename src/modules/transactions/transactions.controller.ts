import { 
  Controller, Get, Post, Patch, Delete, Param, Body, 
  Query, ParseIntPipe, UseGuards, Req 
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/entities/user.entity';
import { User } from '../auth/decorators/user.decorator'; 

// 🔒 Aplicamos guards globales al controller: JWT y Roles
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions') // Prefijo de rutas: /transactions
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {} // Inyectamos el servicio

  // Crear una nueva transacción
  @Post()
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN) // Solo roles autorizados
  async create(
    @Body() dto: CreateTransactionDto, // Datos de la transacción
    @User() user: any // Usuario autenticado (traído desde JWT)
  ) {
    return this.service.create(dto, user); // Llamada al servicio para crear la transacción y actualizar presupuesto
  }

  // Obtener todas las transacciones de un usuario, opcionalmente filtradas por tipo
  @Get('user/:userId')
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
  async findAllByUser(
    @Param('userId', ParseIntPipe) userId: number, // ID del usuario
    @Query('type') type?: 'income' | 'expense' // Filtro opcional por tipo de transacción
  ) {
    return this.service.findAllByUser(userId, { type }); // Devuelve todas las transacciones filtradas
  }

  // Obtener balance general de un usuario
  @Get('balance/:userId')
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
  async getBalance(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getBalance(userId); // Calcula ingresos - gastos
  }

  // Obtener una transacción específica por ID
  @Get(':id')
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id); // Devuelve la transacción solicitada
  }

  // Actualizar una transacción existente
  @Patch(':id')
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number, // ID de la transacción
    @Body() dto: UpdateTransactionDto // Datos a actualizar
  ) {
    return this.service.update(id, dto); // Actualiza transacción y presupuesto automáticamente
  }

  // Eliminar una transacción
  @Delete(':id')
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id); // Elimina transacción y ajusta el presupuesto
  }
}