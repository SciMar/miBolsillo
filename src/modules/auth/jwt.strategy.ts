import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy } from "@nestjs/passport";
import {Strategy, ExtractJwt} from 'passport-jwt';
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    /**
     * Constructor:
     * Configura la estrategia JWT usando la clave secreta del entorno.
     * @param configService - Servicio para acceder a variables de entorno.
     */
    constructor(private configService:ConfigService){
         super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false, 
            secretOrKey: configService.get<string>('JWT_SECRET_KEY')
        })
    }
    /**
     * Método validate:
     * Valida el token y retorna los datos principales del usuario.
     * @param payLoad - Contiene la información decodificada del JWT.
     * @returns Objeto con los datos del usuario autenticado.
     */
    async validate(payLoad:any){
        return {
            id:payLoad.sub, 
            name:payLoad.name, 
            email:payLoad.email, 
            role:payLoad.role}
    }
}