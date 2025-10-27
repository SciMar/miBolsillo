import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from '../users/dto/login-user.dto';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ApiTags } from '@nestjs/swagger';

// Controlador de Autenticación
@ApiTags('auth')
// http://localhost:3000/auth/login
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    //register
    @Post('register')
    async register(@Body() data: CreateUserDTO) {
        return this.authService.register(data);
    }

    //login
    @Post('login')
    async login(@Body() data: LoginUserDTO) {
        return this.authService.login(data);
    }

    //profile
    // Ruta protegida para obtener el perfil del usuario autenticado
    // http://localhost:3000/auth/profile
    // Requiere un token JWT válido en el encabezado de autorización
    @UseGuards(JwtAuthGuard) // Aplica la guardia JWT para proteger esta ruta
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
