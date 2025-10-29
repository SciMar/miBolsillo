import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import {ROLES_KEY} from "../roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor (private reflector:Reflector){}
    canActivate(context:ExecutionContext):boolean{
        const requiredRoles=this.reflector.getAllAndOverride<string[]>(ROLES_KEY,[
            context.getHandler(), 
            context.getClass(),
        ])

        console.log('=== ROLES GUARD DEBUG ===');
        console.log('ROLES_KEY:', ROLES_KEY);
        console.log('Roles requeridos:', requiredRoles);
        console.log('Tipo de requiredRoles:', typeof requiredRoles, Array.isArray(requiredRoles));
        
        if(!requiredRoles){return true}; 

        const {user}=context.switchToHttp().getRequest();
        
        console.log('Usuario completo:', user);
        console.log('Rol del usuario:', user?.role);
        console.log('Tipo de user.role:', typeof user?.role);
        console.log('¿Incluye?:', requiredRoles.includes(user?.role));
        console.log('Comparación individual:');
        requiredRoles.forEach(r => console.log(`  "${r}" === "${user?.role}":`, r === user?.role));
        console.log('========================');
        
        if(!user){throw new ForbiddenException("El usuario no está autenticado en el sistema")}

        if(!requiredRoles.includes(user.role)){
            throw new ForbiddenException("Su rol en el sistema no tiene acceso a este servicio")
        }
        return true;
    }
}