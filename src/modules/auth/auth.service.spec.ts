import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service"; 
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { access } from "fs";

jest.mock('bcrypt');
describe('AuthService', () => {
    let service:AuthService;
    let fakeRepository:any;
    let jwtService:JwtService; 

    const userMock={
        id:1, 
        name:"Sofia", 
        email:"sofia@gmail.com", 
        password:"sofia123", 
        role:"user"
    }
    beforeEach(()=>{
        jest.clearAllMocks();
        fakeRepository={
            findOne:jest.fn(),
            create:jest.fn(),
            save:jest.fn(),
            update:jest.fn()
        };
        jwtService={
            signAsync:jest.fn()
        } as any;
        service=new AuthService(fakeRepository, jwtService);
    })

    //Prueba unitaria del servicio register
    it ('Deberia registrar un usuario', async()=>{
        const user={name:"Samuel", email:"samuel@gmail.com", password:"samuel123", isActive:true, role:"user"};
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

        fakeRepository.create.mockReturnValue({...user, password:'hashedPassword'});
        fakeRepository.save.mockResolvedValue({id:1, ...user, password:'hashedPassword'});

        const result=await service.register(user as any);

        expect(bcrypt.hash).toHaveBeenCalledWith('samuel123', 10);
        expect(fakeRepository.create).toHaveBeenCalled()
        expect(fakeRepository.save).toHaveBeenCalled()
        expect(result).toEqual(
            {
                message: 'Bienvenid@ a Mi Bolsillo',
                user:{ name:"Samuel", role:"user"}
            }
        )
    });

    //Prueba unitaria de la excepcion cuando el correo registrado ya existe del servicio register
    it('Deberia lanzar BadRequestException si el email ya existe', async()=>{
        const newUserMock={name:"Carlos", email:"sofia@gmail.com", password:"carlos123"}; 
    
        fakeRepository.findOne.mockResolvedValue({id:3, email:"sofia@gmail.com" }); 
        await expect(service.register(newUserMock as any)).rejects.toThrow(BadRequestException);
    })

    //Prueba unitaria del servicio login
    it('Deberia autenticar un usuario y retornar un token', async()=>{
        const loginData={email:"samuel@gmail.com", password:"samuel123"};

        fakeRepository.findOne.mockResolvedValue(userMock);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwtService.signAsync as jest.Mock).mockResolvedValue("false_token_1230");

        const result=await service.login(loginData as any);
        expect(fakeRepository.findOne).toHaveBeenCalledWith({where: {email: loginData.email}}); 
        expect(bcrypt.compare).toHaveBeenCalledWith("samuel123", userMock.password);
        expect(jwtService.signAsync).toHaveBeenCalled();
        expect(result).toEqual({accessToken:"false_token_1230",})

    });

    //Prueba unitaria de la excepcion cuando el correo no es correcto del servicio login
    it('Deberia lanzar UnauthorizedException cuando el correo es incorrecto', async()=>{
        const loginData={email:"juan@gmail.com", password:"juan123"}; 

        fakeRepository.findOne.mockResolvedValue(null);
        await expect(service.login(loginData)).rejects.toThrow(UnauthorizedException);
    });

    //Prueba unitaria de la excepcion cuando la contraseña no es correcta del servicio login
    it('Deberia lanzar UnauthorizedException cuando la contraseña es incorrecta', async()=>{
        const loginData={email:"sara@gmail.com", password:"sara123"};

        fakeRepository.findOne.mockResolvedValue(userMock);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(service.login(loginData)).rejects.toThrow(UnauthorizedException);
    })

    //Prueba unitaria del servicio updatePassword
    it('Deberia actualizar la contraseña de un usuario',async()=>{
        const dataUpdatePassword={email:"karol@gmail.com", password:"karol123", newPassword:"nuevaPassword"};

        fakeRepository.findOne.mockResolvedValue(userMock); 
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
        fakeRepository.update.mockResolvedValue({affected:1});

        const result=await service.updatePassword(dataUpdatePassword);

        expect(fakeRepository.findOne).toHaveBeenLastCalledWith({where:{email:dataUpdatePassword.email}}); 
        expect(bcrypt.compare).toHaveBeenCalledWith("karol123", userMock.password);
        expect(bcrypt.hash).toHaveBeenCalledWith("nuevaPassword",10);
        expect(fakeRepository.update).toHaveBeenLastCalledWith(userMock.id, {password:'hashedNewPassword'});
        expect(result).toEqual({message:"La contraseña ha sido actualizada correctamente"});    
    });

    //Prueba unitaria de la excepcion cuando el usuario no existe al actualizar la contraseña del servicio updatePassword
    it('Deberia lanzar UnauthorizedException cuando el usuario no existe al actualizar la contraseña', async()=>{
        const dataUpdatePassword={email:"karol@gmail.com", password:"karol123", newPassword:"nuevaPassword"};

        fakeRepository.findOne.mockResolvedValue(null);
        await expect(service.updatePassword(dataUpdatePassword)).rejects.toThrow(UnauthorizedException);
    });

    //Prueba unitaria de la excepcion cuando la contraseña actual es incorrecta al actualizar la contraseña del servicio updatePassword
    it('Deberia lanzar UnauthorizedException cuando la contraseña actual es incorrecta al actualizar la contraseña', async()=>{
        const dataUpdatePassword={email:"karol@gmail.com", password:"karol123", newPassword:"nuevaPassword"};

        fakeRepository.findOne.mockResolvedValue(userMock);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(service.updatePassword(dataUpdatePassword)).rejects.toThrow(UnauthorizedException);
    });
})