import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { ApiTags } from '@nestjs/swagger';
// Módulo de Autenticación
@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}), // Carga las variables de entorno desde el archivo .env
    TypeOrmModule.forFeature([User]), // Importa el repositorio de la entidad User
    PassportModule.register({ defaultStrategy: 'jwt' }), // Configura Passport con la estrategia JWT
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa el módulo de configuración
      inject: [ConfigService], // Inyecta el servicio de configuración
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'), // Obtiene la clave secreta desde las variables de entorno
        signOptions: { expiresIn: config.get<number>('JWT_EXPIRES') || '1h'} // Configura la expiración del token
      }) // Configura el módulo JWT de forma asíncrona
    })
  ],
  providers: [AuthService, JwtStrategy], // Servicios disponibles en este módulo
  controllers: [AuthController] // Controladores disponibles en este módulo
})
export class AuthModule {} // Exporta el módulo de autenticación
