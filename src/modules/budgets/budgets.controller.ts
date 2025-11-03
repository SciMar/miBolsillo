import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/entities/user.entity';
/*
   * JwtAuthGuard: protege todas las rutas (solo usuarios autenticados).
   * RolesGuard: restringe según el rol asignado.
   * Por defecto: PREMIUM y ADMIN pueden acceder.
  */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles (RolesEnum.PREMIUM, RolesEnum.ADMIN)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}
  /* 
     *CREAR PRESUPUESTO
     *Endpoint: POST /budgets
     *Roles: PREMIUM, ADMIN
     *Crea un presupuesto asociado al usuario autenticado.
   */
  @Post()
  create(@Body() dto: CreateBudgetDto, @Req() req) {
    const user = req.user; 
    return this.service.createForUser(dto, user);
  }

  /*
    * VER PRESUPUESTOS DE UN USUARIO
    *Endpoint: GET /budgets/user/:userId?categoryId=3
    *Roles: PREMIUM, ADMIN
    *Muestra todos los presupuestos de un usuario específico.
    *Permite filtrar por categoría opcionalmente.
*/
  @Get('user/:userId')
  findAllByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.service.findAllByUser(userId, {
      categoryId: categoryId ? Number(categoryId) : undefined,
    });
  }
  /*
   * VER TODOS LOS PRESUPUESTOS (ADMIN)
    *Endpoint: GET /budgets
    *Roles: ADMIN
    *Retorna todos los presupuestos del sistema.
    */
  @Get()
  @Roles (RolesEnum.ADMIN)
findAll() {
  return this.service.findAll();
}

  /* Buscar presupuestos por nombre*/
@Get('buscar')
 @Roles (RolesEnum.ADMIN)
buscar(@Query('q') q: string) {
  return this.service.buscarPorNombre(q);
}

  /* Buscar presupuestos por id*/
  @Get(':id')
  @Roles (RolesEnum.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /* Editar un presupuestos por id*/
  @Patch(':id')
  @Roles (RolesEnum.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBudgetDto) {
    return this.service.update(id, dto);
  }

  /* Desactivar un presupuestos por id*/
  @Delete(':id')
  @Roles (RolesEnum.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}