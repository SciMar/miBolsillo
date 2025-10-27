import{Injectable, UnauthorizedException} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {Strategy, ExtractJwt} from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(private configService:ConfigService){
         super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false, 
            secretOrKey: configService.get<string>('JWT_SECRET')
        })
    }
    async validateToken(payLoad:any){
        return {id:payLoad.id, name:payLoad.name, email:payLoad.email, role:payLoad.role}
    }
}