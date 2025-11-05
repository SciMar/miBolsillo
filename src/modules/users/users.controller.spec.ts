import { BadRequestException, NotFoundException } from "@nestjs/common"
import { RolesEnum, User } from "./entities/user.entity"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
const usersFake=[
  {id:1, name:"Sofia", email:"sofia@gmail.com",password:"sofia123", role:RolesEnum.USER, isActive:true, transactions:[], budgets:[], reports:[],settings:[],  notifications:[] },
  {id:2, name:"Sara", email:"sara@gmail.com", password:"sara123", role:RolesEnum.PREMIUM, isActive:true, transactions:[], budgets:[], reports:[],settings:[],  notifications:[] },
  {id:3, name:"Sergio", email:"sergio@gmail.com", password:"sergio123", role:RolesEnum.ADMIN, isActive:true, transactions:[], budgets:[], reports:[],settings:[],  notifications:[]}
]
describe('UsersController', () => {
    let controller:UsersController
    let service:jest.Mocked<UsersService>

    beforeEach(()=>{
        service={
            findAll:jest.fn(), 
            findOne:jest.fn(), 
            create:jest.fn(), 
            update:jest.fn(), 
            updateRole:jest.fn(), 
            inactiveUser:jest.fn()
        } as any

        controller =new UsersController(service)
    })

    //Prueba unitaria del servicio findAll
    it('Deberia devolver todos los usuarios', async () => {
        service.findAll.mockResolvedValue(usersFake); 

        const users= await controller.findAll();
        expect(users.length).toBeGreaterThan(0); 

        expect(users).toEqual(usersFake);
    });

    //Prueba unitaria del servicio findOne
    it('Deberia devolver un usuario por id', async()=>{
        service.findOne.mockResolvedValue(usersFake[0]);
        const userFind= await controller.findOne(1); 
        expect(userFind.email).toEqual("sofia@gmail.com");
    });

    //Prueba unitaria de la excepcion cuando el usuario no existe del servicio findOne
    it('Deberia lanzar una excepcion si el usuario no existe', async()=>{
        (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException('Usuario no encontrado'));
        await expect(controller.findOne(77)).rejects.toThrow(NotFoundException);
    });

    //Prueba unitaria del servicio create
    it('Deberia crear un usuario', async()=>{
        const newUserMock={
            name:"Juan", 
            email:"juan@gmail.com", 
            password:"juan123",
            role:RolesEnum.USER, 
            isActive:true, 
            transactions:[], 
            budgets:[], 
            reports:[],
            settings:[],  
            notifications:[]
        }; 

        service.findOne.mockResolvedValue(null); 

        service.create.mockResolvedValue({id:3, ...newUserMock});
        const result= await controller.create(newUserMock as any); 
        expect(service.create).toHaveBeenCalledWith(newUserMock);
        expect(result.id).toBe(3);
    });

    //Prueba unitaria de la excepcion cuando el correo registrado ya existe del servicio create
    it('Deberia lanzar una excepcion si el email ya existe', async()=>{
        const newUserMock={
            name:"Carlos", 
            email:"sofia@gmail.com", 
            password:"carlos123", 
            role:RolesEnum.USER, 
            isActive:true, 
            transactions:[], 
            budgets:[], 
            reports:[],
            settings:[],  
            notifications:[]
        }; 

        (service.create as jest.Mock).mockRejectedValue(new BadRequestException('Ya existe un usuario con ese email'));

        await expect(controller.create(newUserMock as any)).rejects.toThrow(BadRequestException);
    })

    //Prueba unitaria del servicio update
    it('Deberia actualizar un usuario', async()=>{
        const updatedUser={
            name:"Juan David", 
            email:"sofia@gmail.com",
            password:"sofia123", 
            role:RolesEnum.USER, 
            isActive:true, 
            transactions:[],
            budgets:[], 
            reports:[],
            settings:[],  
            notifications:[]
        };
        service.update.mockResolvedValue({id:1, ...updatedUser});

        const mockReq={
            user:{id:1, role:RolesEnum.USER}
        }
        const result =await controller.update(1,updatedUser,mockReq);
        expect(service.update).toHaveBeenCalledWith(1, updatedUser);
        if('name' in result){
            expect(result.name).toBe("Juan David");
        }else{
            fail('La respuesta no contiene el nombre actualizado');
        }
    });

     //Prueba unitaria del servicio inactiveUser
    it('Deberia inactivar un usuario', async()=>{
        const updatedStatusUser={
            name:"Sara", 
            isActive:false, 
            email:"sara@gmail.com", 
            password:"sara123", 
            role:RolesEnum.PREMIUM, 
            transactions:[], 
            budgets:[], 
            reports:[],
            settings:[],  
            notifications:[] 
        };
        
        service.inactiveUser.mockResolvedValue({
            message: `El usuario ${updatedStatusUser.name} ha sido inactivado exitosamente`
        });
        service.findOne.mockResolvedValue({id:2, ...updatedStatusUser});
        
        
        const result=await controller.inactiveUser(2); 
        expect(service.inactiveUser).toHaveBeenCalledWith(2);
        expect(result.message).toEqual(`El usuario ${updatedStatusUser.name} ha sido inactivado exitosamente`)
    });

    //Prueba unitaria de la excepcion cuando el usuario no existe en el servicio inactiveUser
    it('Deberia lanzar una excepcion si el usuario no existe', async()=>{
        (service.inactiveUser as jest.Mock).mockRejectedValue(new NotFoundException('El usuario con id 78 no existe'));
        await expect(controller.inactiveUser(78)).rejects.toThrow(NotFoundException);
    });

    //Prueba unitaria del servicio updateRole
    it('Deberia actualizar el rol del usuario', async()=>{
        service.findOne.mockResolvedValue(usersFake[1]);
        service.updateRole.mockResolvedValue({
            message:`✅ Rol actualizado con éxito`,
            user: {
                name: "Sara",
                newRole: "premium",
            }
        });

        const result =await controller.updateRole(2,{role:RolesEnum.PREMIUM});

        expect(service.updateRole).toHaveBeenCalledWith(2, RolesEnum.PREMIUM);
        expect(result).toEqual({
        message:`✅ Rol actualizado con éxito`, 
        user: {
            name: "Sara",
            newRole: "premium",
        }
        }); 
    })
})