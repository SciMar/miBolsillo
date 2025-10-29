import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/entities/user.entity';
import { User } from '../auth/decorators/user.decorator'; 

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  // ✅ 1. POST - crear transacción
  @Post()
  async create(
    @Body() dto: CreateTransactionDto,
    @User() user: any
  ) {
    return this.service.create(dto, user);
  }

  // ✅ 2. Rutas específicas PRIMERO (con texto literal)
  @Get('user/:userId/grouped')
  @Roles(RolesEnum.ADMIN)
  async findAllByUserGrouped(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findAllByUserGrouped(userId);
  }

  // ✅ 3. my-balance (específica)
  @Get('my-balance')
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
  async getMyBalance(@Req() req) {
    console.log('Usuario autenticado:', req.user);
    const userId = req.user.id;
    return this.service.getBalance(userId);
  }

  // ✅ 4. balance/:userId (específica con parámetro)
  @Get('balance/:userId')
  @Roles(RolesEnum.ADMIN)
  async getBalance(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getBalance(userId);
  }

  // ✅ 5. Ruta genérica :id AL FINAL (captura todo lo demás)
  @Get(':id')
  @Roles(RolesEnum.ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  
/*
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
  }*/
}