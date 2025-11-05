import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
const usersFake=[
  {id:1, name:"Sofia", email:"sofia@gmail.com", role:"user"},
  {id:2, name:"Sara", email:"sara@gmail.com", role:"user"},
  {id:3, name:"Sergio", email:"sergio@gmail.com", role:"admin"}
]
describe('UsersService', () => {
  let service: UsersService;
  let fakeRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    fakeRepository={
      find: jest.fn().mockResolvedValue(usersFake), 
      findOne: jest.fn().mockResolvedValue(usersFake), 
      create:jest.fn().mockResolvedValue(usersFake),
      save:jest.fn().mockResolvedValue(usersFake), 
      update: jest.fn().mockResolvedValue(usersFake), 
      hash:jest.fn().mockResolvedValue(usersFake)
    };
    service=new UsersService(fakeRepository as any)
  });

  //Prueba unitaria del servicio findAll
  it('Deberia devolver todos los usuarios', async () => {
    const users= await service.findAll();
    expect(users.length).toBeGreaterThan(0); 
    expect(fakeRepository.find).toHaveBeenCalled();
  });
  
  //Prueba unitaria del servicio findOne
  it('Deberia devolver un usuario por id', async()=>{
    fakeRepository.findOne.mockResolvedValue(usersFake[0]);
    const userFind= await service.findOne(1); 
    expect(userFind.email).toEqual("sofia@gmail.com");
  });

  //Prueba unitaria de la excepcion cuando el usuario no existe
  it('Deberia lanzar NotFoundException si el usuario no existe', async()=>{
    fakeRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne(77)).rejects.toThrow(NotFoundException);
  });

  //Prueba unitaria del servicio create
  it('Deberia crear un usuario', async()=>{
    const newUserMock={name:"Juan", email:"juan@gmail.com", password:"juan123"}; 

    fakeRepository.findOne.mockResolvedValue(null); 

    fakeRepository.save.mockResolvedValue({id:3, ...newUserMock});
    const result= await service.create(newUserMock as any); 
    expect(result.id).toBe(3);
  });

  //Prueba unitaria de la excepcion cuando el correo registrado ya existe del servicio create
  it('Deberia lanzar BadRequestException si el email ya existe', async()=>{
    const newUserMock={name:"Carlos", email:"sofia@gmail.com", password:"carlos123"}; 

    fakeRepository.findOne.mockResolvedValue({id:3, email:"sofia@gmail.com" }); 
    await expect(service.create(newUserMock as any)).rejects.toThrow(BadRequestException);
  })

  //Prueba unitaria del servicio update
  it('Deberia actualizar un usuario', async()=>{
    const updatedUser={name:"Juan David"};
    fakeRepository.update.mockResolvedValue({affected:1});
    fakeRepository.findOne.mockResolvedValue(updatedUser);

    const result =await service.update(1, {name:"Juan David"});
    expect(fakeRepository.update).toHaveBeenCalledWith(1, {name:"Juan David"});
    expect(result.name).toEqual("Juan David");
  });

  //Prueba unitaria del servicio inactiveUser
  it('Deberia inactivar un usuario', async()=>{
    const updatedStatusUser={name:"Sara", isActive:false};
    fakeRepository.update.mockResolvedValue({affected:1});
    fakeRepository.findOne.mockResolvedValue(updatedStatusUser);

    const result=await service.inactiveUser(2); 
    expect(fakeRepository.update).toHaveBeenCalledWith(2, {isActive:false});
    expect(result.message).toEqual(`El usuario ${updatedStatusUser.name} ha sido inactivado exitosamente`)
  });
  
  //Prueba unitaria de la excepcion cuando el usuario no existe en el servicio inactiveUser
  it('Deberia lanzar NotFoundException si el usuario no existe', async()=>{
    fakeRepository.update.mockResolvedValue({affected:0});
    await expect(service.inactiveUser(78)).rejects.toThrow(NotFoundException);
  });

  //Prueba unitaria del servicio updateRole
  it('Deberia actualizar el rol del usuario', async()=>{
    fakeRepository.findOne.mockResolvedValue(usersFake[1]);
    const userFind= await service.findOne(2); 
    expect(userFind.email).toEqual("sara@gmail.com");
    expect(userFind.role).toEqual("user");

    fakeRepository.update.mockResolvedValue({affected:1});
    fakeRepository.findOne.mockResolvedValue({...usersFake[1], role:"premium"});

    const result =await service.updateRole(2,"premium");
    expect(fakeRepository.update).toHaveBeenCalledWith(2,{role:"premium"});
    expect(result).toEqual({
      message:`✅ Rol actualizado con éxito`, 
      user: {
        name: "Sara",
        newRole: "premium",
      }
    }); 
  })
});
