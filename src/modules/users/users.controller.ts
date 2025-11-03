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
// Requieren un token JWT válido en el encabezado de autorización
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* ADMIN → ver todos los usuarios
  *Ruta para obtener todos los usuarios del sistema 
  *El usuario requiere tener el rol de adminitrador para realizar esta acción
  * http://localhost:3000/api/users (GET)
  */
  @Get()
  @Roles(RolesEnum.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  /*ADMIN y PREMIUM → ver un usuario por ID
  * Ruta para obtener un usuario por medio de su id
  * El usuario requiere tener el rol de administrador o usuario premium para realizar esta acción
  * http://localhost:3000/api/users/1 (GET)
  */
  @Get(':id')
  @Roles(RolesEnum.ADMIN, RolesEnum.PREMIUM)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /* ADMIN → crear nuevos usuarios
  * Ruta para crear un nuevo usuario
  * El usuario requiere tener el rol de adminitrador para realizar esta acción
  * http://localhost:3000/api/users (POST)
  */
  @Post()
  @Roles(RolesEnum.ADMIN)
  create(@Body() body: CreateUserDTO) {
    return this.usersService.create(body);
  }

  /* ADMIN y USER → actualizar su propio perfil o datos
  * Ruta para actualizar los datos de un usuario
  * El usuario requiere tener el rol de adminitrador, usuario o usuario premium para realizar esta acción
  * http://localhost:3000/api/users/2 (PUT)
  */
  @Put(':id')
  @Roles(RolesEnum.ADMIN, RolesEnum.USER, RolesEnum.PREMIUM)
  update(@Param('id', ParseIntPipe) id: number, 
  @Body() body: UpdateUserDTO, 
  @Request() req) {
    /* Si el rol no es admin, solo puede editar su propio usuario*/
    if (req.user.role !== RolesEnum.ADMIN && req.user.id !== id) {
      return { message: 'No tienes permiso para editar otro usuario.' };
    }
    return this.usersService.update(id, body);
  }

  /* ADMIN → actualizar el estado del usuario
  * Ruta para inactivar un usuario
  * El usuario requiere tener el rol de adminitrador para realizar esta acción
  * http://localhost:3000/api/users/2 (DELETE)
  */
  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  inactiveUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.inactiveUser(id);
  }

  /* USER, PREMIUM y ADMIN → obtener su propio perfil
  * Ruta para actualizar obtener el perfil de un usuario
  * El usuario requiere tener el rol de adminitrador, usuario o usuario premium para realizar esta acción
  * http://localhost:3000/api/users/profile/me (GET)
  */
  @Get('profile/me')
  @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  /* ADMIN → cambiar rol de usuario (user <-> premium)
  * Ruta para actualizar el rol del usuario
  * El usuario requiere tener el rol de adminitrador para realizar esta acción
  * http://localhost:3000/api/users/1/role (PATCH)
  */
  @Patch(':id/role')
  @Roles(RolesEnum.ADMIN)
  updateRole(
    @Param('id', ParseIntPipe) id: number, 
    @Body() body: UpdateUserRoleDTO
  ) {
    return this.usersService.updateRole(id, body.role);
  }
}