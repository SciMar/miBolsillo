import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
/*
   * JwtAuthGuard: protege todas las rutas (solo usuarios autenticados).
   * RolesGuard: restringe según el rol asignado.
   * Por defecto: PREMIUM y ADMIN pueden acceder.
  */
@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles (RolesEnum.PREMIUM, RolesEnum.ADMIN, RolesEnum.USER)
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
  @ApiOperation({summary:"Crear un nuevo presupuesto"})
  @ApiResponse({status:201, description:"Presupuesto creado correctamente en la base de datos"})
  @ApiResponse({status:400, description:"El campo name (o nombre) es obligatorio"})
  @ApiResponse({status:400, description:"El campo amount (o monto) es obligatorio'"})
  @ApiResponse({status:400, description:"La fecha de fin debe ser mayor o igual a la fecha de inicio"})
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
  @ApiOperation({summary:"Obtener todos los presupuestos de un usuario"})
  @ApiResponse({status:200, description:"Lista de presupuestos obtenida correctamente de la base de datos"})
  @ApiResponse({status:404, description:"Usuario no encontrado en la base de datos"})
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
@ApiOperation({summary:"Obtener todos los presupuestos"})
@ApiResponse({status:200, description:"Lista de presupuestos obtenida correctamente de la base de datos"})
@Roles (RolesEnum.ADMIN)
findAll() {
  return this.service.findAll();
}

  /* Buscar presupuestos por nombre*/
@Get('buscar')
@ApiOperation({summary:"Buscar presupuestos por nombre"})
@ApiResponse({status:200, description:"Presupuestos encontrados correctamente en la base de datos"})
@ApiResponse({status:404, description:"No se encontraron presupuestos con ese nombre"})
@Roles (RolesEnum.ADMIN)
buscar(@Query('q') q: string) {
  return this.service.buscarPorNombre(q);
}

  /* Buscar presupuestos por id*/
  @Get(':id')
  @ApiOperation({summary:"Obtener un presupuesto por su id"})
  @ApiResponse({status:200, description:"Presupuesto obtenido correctamente de la base de datos"})
  @ApiResponse({status:404, description:"Presupuesto no encontrado en la base de datos"})
  @Roles (RolesEnum.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /* Editar un presupuestos por id*/
  @Patch(':id')
  @ApiOperation({summary:"Actualizar un presupuesto por su id"})
  @ApiResponse({status:200, description:"Presupuesto actualizado correctamente en la base de datos"})
  @ApiResponse({status:404, description:"Presupuesto no encontrado en la base de datos"})
  @ApiResponse({status:400, description:"La fecha de fin debe ser mayor o igual a la fecha de inicio"})
  @Roles (RolesEnum.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBudgetDto) {
    return this.service.update(id, dto);
  }

  /* Desactivar un presupuestos por id*/
  @Delete(':id')
  @ApiOperation({summary:"Eliminar un presupuesto por su id"})
  @ApiResponse({status:200, description:"Presupuesto eliminado correctamente de la base de datos"})
  @ApiResponse({status:404, description:"Presupuesto no encontrado en la base de datos"})
  @Roles (RolesEnum.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}