import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
@Injectable()
export class UsersService { //Servicio para manejar los usuarios
    /**
     * Inyecta el repositorio de usuarios para interactuar con la base de datos
     * @param usersRepo Repositorio de la entidad User
     * findAll(): Devuelve todos los usuarios
     * findOne(id: number): Devuelve un usuario por su ID
     * create(newUser: CreateUserDTO): Crea un nuevo usuario
     * update(id: number, UpdateUser: UpdateUserDTO): Actualiza un usuario existente
     * remove(id: number): Elimina un usuario por su ID
     */
    constructor (
        @InjectRepository(User)
        private usersRepo: Repository<User>
    ) {}

    findAll() {
        return this.usersRepo.find();
    }

    //1️⃣REGISTRO DE USUARIO
    async create(newUser: CreateUserDTO) {
    // Verifica si ya existe un usuario con el mismo email
    const existingUser = await this.usersRepo.findOne({ where: { email: newUser.email } });
    if (existingUser) 
        throw new BadRequestException('Ya existe un usuario con ese email');

    // Crea una nueva entidad User con los datos del DTO
    //    - role: si no se envía, se asigna 'user' por defecto
    //    - isActive: por defecto activo
    const userEntity = this.usersRepo.create({
        ...newUser,
        isActive: true,
    });

    //  Guarda la entidad en la base de datos
    //    - Aquí se ejecuta el @BeforeInsert() de la entidad
    //    - La contraseña se encripta automáticamente antes de insertarse
    return this.usersRepo.save(userEntity);
    }

    // 2️⃣  NUEVO: Actualizar rol de usuario
    async updateRole(id: number, newRole: 'user' | 'premium') {
        // 1️⃣ Busca el usuario
        const user = await this.findOne(id);
        
        // 2️⃣ Evita que se cambie el rol de un admin
        if (user.role === 'admin') {
            throw new ForbiddenException('No se puede cambiar el rol de un administrador');
        }

        // 3️⃣ Actualiza el rol
        await this.usersRepo.update(id, { role: newRole });

        // 4️⃣ Retorna el usuario actualizado
        return this.findOne(id);
    }

    //3️⃣actualiza un usuario por id
    async update(id: number, UpdateUser: UpdateUserDTO) {
        await this.usersRepo.update(id, UpdateUser)
            return this.findOne(id);
        }
    
    //Inactivar un usuario por id
    async inactiveUser(id:number){
        //Actualiza el estado del usuario en el sistema
        const inactiveUser=await this.usersRepo.update(id, {isActive:false});

        //Evalua si alguna de los registros se vio afectado, sino devuelve una excepcion
        if(inactiveUser.affected===0){
            throw new NotFoundException(`El usuario con id ${id} no existe`); 
        }else{
            //Si se realizo la actualizacion, se consulta la informacion del usuario 
            const user=await this.usersRepo.findOne({where:{id}});
            return{message:`El usuario ${user.name} ha sido inactivado exitosamente`}
        }
    } 

    // Busca un usuario por su ID
    async findOne(id: number) {
        const userFind = await this.usersRepo.findOne ({where:{id}})
        if (!userFind) throw new NotFoundException('Usuario no encontrado')
        return userFind
    }
}
  