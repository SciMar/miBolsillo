import { BadRequestException } from "@nestjs/common";
import { AuthService } from "./auth.service"; 
import * as bcrypt from 'bcrypt';
const usersFake=[
  {id:1, name:"Sofia", email:"sofia@gmail.com", password:"sofia123", role:"user"},
  {id:2, name:"Sara", email:"sara@gmail.com", password:"sara123", role:"user"},
  {id:3, name:"Sergio", email:"sergio@gmail.com", password:"sergio123", role:"admin"}
]
describe('AuthService', () => {
    let service:AuthService;
    let fakeRepository;
    let fakeJwt;

    beforeEach(async()=>{
        jest.clearAllMocks();
        fakeRepository={
            findOne:jest.fn().mockResolvedValue(usersFake), 
            create:jest.fn().mockResolvedValue(usersFake), 
            save:jest.fn().mockResolvedValue(usersFake),
            update:jest.fn().mockResolvedValue(usersFake),
        };
        service=new AuthService(fakeRepository as any, fakeJwt)
    });
    it ('Deberia registrar un usuario', async()=>{

    });

    //Prueba unitaria de la excepcion cuando el correo registrado ya existe del servicio register
    it('Deberia lanzar una excepcion si el email ya existe', async()=>{
        const newUserMock={name:"Carlos", email:"sofia@gmail.com", password:"carlos123"}; 
    
        fakeRepository.findOne.mockResolvedValue({id:3, email:"sofia@gmail.com" }); 
        await expect(service.register(newUserMock as any)).rejects.toThrow(BadRequestException);
    })

    it('Deberia autenticar un usuario', async()=>{

    });

    it('Deberia lanzar una excepcion cuando el correo o contraseña son incorrectos', async()=>{

    });

    it('Deberia actualizar la contraseña de un usuario',async()=>{
           
    })
})