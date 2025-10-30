import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from '../users/dto/login-user.dto';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { RecoverPasswordDTO } from '../users/dto/recover-password.dto';

// Controlador de Autenticación
@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    //Register
    //Ruta para registrar un usuario al sistema 
    // http://localhost:3000/api/auth/register
    @Post('register')
    async register(@Body() data: CreateUserDTO) {
        return this.authService.register(data);
    }

    //Login
    //Ruta para validar la información del usuario y generar su JWT Token
    // http://localhost:3000/api/auth/login
    @Post('login')
    async login(@Body() data: LoginUserDTO) {
        return this.authService.login(data);
    }

    //Actualizar la contraseña
    //Ruta para recuperar y actualizar la contraseña del usuario
    // http://localhost:3000/api/auth/updatePassword
    @Post('updatePassword')
    async updatePassword(@Body() data:RecoverPasswordDTO){
        return this.authService.updatePassword(data);
    }

    //Obtener el perfil 
    // Ruta protegida para obtener el perfil del usuario autenticado
    // Requiere un token JWT válido en el encabezado de autorización
    // http://localhost:3000/api/auth/profile
    @UseGuards(JwtAuthGuard) // Aplica la guardia JWT para proteger esta ruta
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
