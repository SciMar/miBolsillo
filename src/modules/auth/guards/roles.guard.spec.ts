import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { ForbiddenException } from "@nestjs/common";

describe('RolesGuard',()=>{
    let guard:RolesGuard; 
    let reflector:Reflector;

    beforeEach(()=>{
        reflector={getAllAndOverride:jest.fn()} as any;
        guard=new RolesGuard(reflector);
    })

    it('Deberia permitir el acceso si no se solicitan roles', ()=>{
        (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined); 
        const context={
            getHandler:jest.fn(), 
            getClass:jest.fn(), 
            switchToHttp:jest.fn().mockReturnValue({
                getRequest:jest.fn().mockReturnValue({user:{id:1, role:'admin'}})
            })
        } as any; 
        const result= guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('Deberia lanzar la excepcion ForBiddenException si el usuario no esta autenticado',()=>{
        (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']); 
        const context={
            getHandler:jest.fn(), 
            getClass:jest.fn(), 
            switchToHttp:jest.fn().mockReturnValue({
                getRequest:jest.fn().mockReturnValue({user:null})
            })
        } as any;
        expect(()=> guard.canActivate(context)).toThrow(ForbiddenException);
    })

    it('Deberia permitir el acceso si el rol coincide con el requerido',()=>{
        (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']); 
        const context={
            getHandler:jest.fn(), 
            getClass:jest.fn(), 
            switchToHttp:jest.fn().mockReturnValue({
                getRequest:jest.fn().mockReturnValue({user:{id:1, role:'admin'}})
            })
        } as any;

        const result= guard.canActivate(context);
        expect(result).toBe(true);
    })
})