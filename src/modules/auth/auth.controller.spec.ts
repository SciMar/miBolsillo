import * as bcrypt from 'bcrypt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');
describe('AuthController', () => {
    let controller:AuthController;
    let service:jest.Mocked<AuthService>;

    beforeEach(()=>{
        service={
            register:jest.fn(), 
            login:jest.fn(), 
            updatePassword:jest.fn()
        } as any

        controller=new AuthController(service);
    })

    //Prueba unitaria del controlador register
    it ('Deberia registrar un usuario', async()=>{
        const user={name:"Samuel", email:"samuel@gmail.com", password:"samuel123", isActive:true, role:"user"};

        const expectedResponse={
            message: 'Bienvenid@ a Mi Bolsillo',
            user:{ name:"Samuel", role:"user"} 
        };
    
        (service.register as jest.Mock).mockResolvedValue(expectedResponse);
    
        const result=await controller.register(user as any);

        expect(service.register).toHaveBeenCalled()
        expect(result).toEqual(
            {
                message: 'Bienvenid@ a Mi Bolsillo',
                user:{ name:"Samuel", role:"user"}
            }
        )
    });

     //Prueba unitaria de la excepcion cuando el correo registrado ya existe del controlador register
    it('Deberia lanzar BadRequestException si el email ya existe', async()=>{
        const newUserMock={name:"Carlos", email:"sofia@gmail.com", password:"carlos123"}; 
        
        (service.register as jest.Mock).mockRejectedValue(new BadRequestException("El correo ya está registrado"));

        await expect(controller.register(newUserMock as any)).rejects.toThrow(BadRequestException);
        expect (service.register).toHaveBeenCalledWith(newUserMock);
    })
    
    //Prueba unitaria del controlador login
    it('Deberia autenticar un usuario y retornar un token', async()=>{
        const loginData={email:"samuel@gmail.com", password:"samuel123"};

        const loginResponse={
            access_token: 'jwt_token'
        };
        
        (service.login as jest.Mock).mockResolvedValue(loginResponse);
        
        const result=await controller.login(loginData as any);
        expect(service.login).toHaveBeenCalledWith(loginData);
        expect(result).toEqual(loginResponse);
    });
    
    //Prueba unitaria de la excepcion cuando el correo no es correcto del controlador login
    it('Deberia lanzar UnauthorizedException cuando el correo es incorrecto', async()=>{
        const loginData={email:"juan@gmail.com", password:"juan123"}; 
    
        (service.login as jest.Mock).mockRejectedValue(new UnauthorizedException("Credenciales inválidas"));

        await expect(controller.login(loginData)).rejects.toThrow(UnauthorizedException);
    });
    
    //Prueba unitaria de la excepcion cuando la contraseña no es correcta del controlador login
    it('Deberia lanzar UnauthorizedException cuando la contraseña es incorrecta', async()=>{
        const loginData={email:"sara@gmail.com", password:"sara123"};
    
        (service.login as jest.Mock).mockRejectedValue(new UnauthorizedException("Credenciales inválidas"));
    
        await expect(controller.login(loginData)).rejects.toThrow(UnauthorizedException);
    })
    
    //Prueba unitaria del servicio updatePassword
    it('Deberia actualizar la contraseña de un usuario',async()=>{
        const dataUpdatePassword={email:"karol@gmail.com", password:"karol123", newPassword:"nuevaPassword"};
    
        (service.updatePassword as jest.Mock).mockResolvedValue({message:"La contraseña ha sido actualizada correctamente"});

        const result=await controller.updatePassword(dataUpdatePassword);

        expect(service.updatePassword).toHaveBeenCalledWith(dataUpdatePassword);
        expect(result).toEqual({message:"La contraseña ha sido actualizada correctamente"}); 
    });
    
    //Prueba unitaria de la excepcion cuando el usuario no existe al actualizar la contraseña del servicio updatePassword
    it('Deberia lanzar UnauthorizedException cuando el usuario no existe al actualizar la contraseña', async()=>{
        const dataUpdatePassword={email:"karol@gmail.com", password:"karol123", newPassword:"nuevaPassword"};
    
        (service.updatePassword as jest.Mock).mockRejectedValue(new UnauthorizedException("Credenciales inválidas"));
        await expect(controller.updatePassword(dataUpdatePassword)).rejects.toThrow(UnauthorizedException);
    });
    
    
    //Prueba unitaria de la excepcion cuando la contraseña actual es incorrecta al actualizar la contraseña del servicio updatePassword
    it('Deberia lanzar UnauthorizedException cuando la contraseña actual es incorrecta al actualizar la contraseña', async()=>{
        const dataUpdatePassword={email:"karol@gmail.com", password:"karol123", newPassword:"nuevaPassword"};
    
        (service.updatePassword as jest.Mock).mockRejectedValue(new UnauthorizedException("Credenciales inválidas"));
    
        await expect(controller.updatePassword(dataUpdatePassword)).rejects.toThrow(UnauthorizedException);
    });
})