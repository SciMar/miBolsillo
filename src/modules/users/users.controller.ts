import { Controller, Get, Post, Param, Body, Put, Delete, UseGuards, ParseIntPipe, Request, Patch} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UpdateUserRoleDTO } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ ADMIN → ver todos los usuarios
  @Get()
  @Roles(RolesEnum.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // ✅ ADMIN y PREMIUM → ver un usuario por ID
  @Get(':id')
  @Roles(RolesEnum.ADMIN, RolesEnum.PREMIUM)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // ✅ ADMIN → crear nuevos usuarios
  @Post()
  @Roles(RolesEnum.ADMIN)
  create(@Body() body: CreateUserDTO) {
    return this.usersService.create(body);
  }

  // ✅ ADMIN y USER → actualizar su propio perfil o datos
  @Put(':id')
  @Roles(RolesEnum.ADMIN, RolesEnum.USER, RolesEnum.PREMIUM)
  update(@Param('id', ParseIntPipe) id: number, 
  @Body() body: UpdateUserDTO, 
  @Request() req) {
    // 🔒 Si el rol no es admin, solo puede editar su propio usuario
    if (req.user.role !== RolesEnum.ADMIN && req.user.id !== id) {
      return { message: 'No tienes permiso para editar otro usuario.' };
    }
    return this.usersService.update(id, body);
  }

  // ✅ ADMIN → eliminar usuarios
  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  // ✅ USER, PREMIUM y ADMIN → obtener su propio perfil
  @Get('profile/me')
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  // ✅ NUEVO: ADMIN → cambiar rol de usuario (user <-> premium)
  @Patch(':id/role')
  @Roles(RolesEnum.ADMIN)
  updateRole(
    @Param('id', ParseIntPipe) id: number, 
    @Body() body: UpdateUserRoleDTO
  ) {
    return this.usersService.updateRole(id, body.role);
  }
}