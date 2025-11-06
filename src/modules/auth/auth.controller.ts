import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from '../users/dto/login-user.dto';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecoverPasswordDTO } from '../users/dto/recover-password.dto';

// Controlador de Autenticación
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /*Register
    *Ruta para registrar un usuario al sistema 
    * http://localhost:3000/api/auth/register
    */
    @Post('register')
    @ApiOperation({summary:"Crear un usuario nuevo en la base de datos"})
    @ApiResponse({status:201, description:"Usuario creado correctamente en la base de datos"})
    @ApiResponse({status:400, description:"Ya existe un usuario con ese email"})
    async register(@Body() data: CreateUserDTO) {
        return this.authService.register(data);
    }

    /*Login
    *Ruta para validar la información del usuario y generar su JWT Token
    * http://localhost:3000/api/auth/login
    */
    @Post('login')
    @ApiOperation({summary:"Autenticar un usuario y generar un token JWT"})
    @ApiResponse({status:200, description:"Usuario autenticado correctamente"})
    @ApiResponse({status:401, description:"Credenciales inválidas"})
    async login(@Body() data: LoginUserDTO) {
        return this.authService.login(data);
    }

    /*Actualizar la contraseña
    *Ruta para recuperar y actualizar la contraseña del usuario
    * http://localhost:3000/api/auth/updatePassword
    */ 
    @Post('updatePassword')
    @ApiOperation({summary:"Actualizar la contraseña de un usuario"})
    @ApiResponse({status:200, description:"Contraseña actualizada correctamente"})
    @ApiResponse({status:401, description:"Credenciales inválidas"})
    @ApiResponse({status:401, description:"La contraseña ingresada no corresponde a la almacenada"})
    async updatePassword(@Body() data:RecoverPasswordDTO){
        return this.authService.updatePassword(data);
    }

    /*Obtener el perfil 
    * Ruta protegida para obtener el perfil del usuario autenticado
    * Requiere un token JWT válido en el encabezado de autorización
    * http://localhost:3000/api/auth/profile
    */
    @UseGuards(JwtAuthGuard) /* Aplica la guardia JWT para proteger esta ruta*/
    @Get('profile')
    @ApiOperation({summary:"Obtener el perfil del usuario autenticado"})
    @ApiResponse({status:200, description:"Perfil del usuario obtenido correctamente"})
    @ApiResponse({status:401, description:"Usuario no autorizado"})
    @ApiBearerAuth()
    getProfile(@Request() req) {
        return req.user;
    }
}
