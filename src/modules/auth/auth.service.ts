import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDTO } from '../users/dto/login-user.dto';
import { User } from '../users/entities/user.entity';
import { CreateUserDTO } from '../users/dto/create-user.dto';

// Servicio de Autenticación
@Injectable() // Decorador que marca la clase como un proveedor inyectable

export class AuthService {
    
    constructor( //constructor para inyectar dependencias
        @InjectRepository (User) // Inyecta el repositorio de la entidad User
        private userRepo: Repository<User>, // Repositorio para interactuar con la entidad User
        private jwtService: JwtService,     // Servicio para manejar JWT
    ) {} 

  // Función asíncrona para registrar un nuevo usuario
    async register(data: CreateUserDTO) {
    // 1️⃣ Verifica si ya existe un usuario con el mismo email
    const existingUser = await this.userRepo.findOne({ 
        where: { email: data.email } 
    });
    
    if (existingUser) {
        throw new BadRequestException('Ya existe un usuario con ese email');
    }

    // 2️⃣ Hashea la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // 3️⃣ Crea la entidad User con los datos del DTO y la contraseña hasheada
    const userCreated = this.userRepo.create({ 
        ...data, 
        password: hashedPassword,
        role: 'user',
        isActive: true,
    }); 
    
    // 4️⃣ Guarda el usuario en la base de datos
    await this.userRepo.save(userCreated);
    
    // 5️⃣ Retorna un mensaje simple y los datos principales del usuario
    return {
        message: 'Usuario registrado correctamente', 
        user: {
            id: userCreated.id, 
            name: userCreated.name,
            email: userCreated.email,
            role: userCreated.role
        }
    };
}


    //LOGIN
        async login (data: LoginUserDTO) {
            console.log('Datos recibidos:', data);
        // 1️⃣ Busca el usuario por email
        const user = await this.userRepo.findOne({where: {email: data.email}})
        console.log('Usuario encontrado:', user);
        //verifica si el usuario existe
        if (!user) {
            throw new UnauthorizedException('Credenciales invalidas-EMAIL');
        }
        // 2️⃣ Compara la contraseña enviada con la almacenada
        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        // si la contraseña no es válida, lanza una excepción
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales invalidas-PASSWORD');
        }

        // Si las credenciales son válidas, genera un token JWT
        //const payload = { sub: user.id, email: user.email }; // Información que se incluirá en el token
        //const accessToken = this.jwtService.sign(payload); // Genera el token JWT
        // Retorna el usuario y el token de acceso
         // 3️⃣ Prepara el payload del JWT
        const payloadToken = { 
                sub: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
            }; // Información que se incluirá en el token
            console.log('Payload para JWT:', payloadToken);

        const token = await this.jwtService.signAsync(payloadToken); // Genera el token JWT
        console.log('Token generado:', token);
        return {accessToken: token // Retorna el token de acceso
        };

    }
}

