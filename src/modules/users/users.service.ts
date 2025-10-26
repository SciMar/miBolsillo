import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService:JwtService
    ){}

    async registerUser(dataNewUser:CreateUserDTO){
        const hashedPassword= await bcrypt.hash(dataNewUser.password, 10); 
        const newUser=this.userRepository.create({...dataNewUser, password:hashedPassword});
        const resultQuery=await this.userRepository.save(newUser)
        if(!resultQuery){
            return{ message:"Error al registrar la información"}
        }else{
            return{
                message:"La información ha sido registrada correctamente",
                user:{name:newUser.name, email:newUser.email}
            }
        }
    }

    async updateUser(id:number, data:UpdateUserDTO){
        const dataToUpdate={...data}; 
        let dataWithPassword; 
        if(data.password){
            const hashedNewPassword=await bcrypt.hash(data.password,10); 
            dataWithPassword={...dataToUpdate,password:hashedNewPassword}
        }
        const successfulUpdate=await this.userRepository.update(id, data.password? dataWithPassword:dataToUpdate); 
        if(!successfulUpdate){
            return{ message:"Error al actualizar la información"}
        }else{
            return{ message:"Información actualizada con éxito"}
        }
    }

    async inactiveUser(id:number){
        const inactiveUser=await this.userRepository.update(id, {isActive:false});
        if(inactiveUser.affected===0){
            throw new NotFoundException(`El usuario con id ${id} no existe`); 
        }else{
            const user=await this.userRepository.findOne({where:{id}});
            return{message:`El usuario ${user.name} ha sido inactivado exitosamente`}
        }
    }

    async loginUser(data:LoginUserDTO){
        const passwordValid=await bcrypt.compare(data.password, (await this.userRepository.findOne({where:{email:data.email}})).password);
        if(!passwordValid){ throw new UnauthorizedException("Credenciales incorrectas")}

        const userExists=await this.userRepository.findOne({where:{email:data.email, password:data.password}});
        if(!userExists){ throw new UnauthorizedException("Credenciales incorrectas")}

        const payLoadToken={id:userExists.id, name:userExists.name, email:userExists.email, role:userExists.role}
        const token=await this.jwtService.signAsync(payLoadToken);
        return{
            message:`Bienvenido/a ${userExists.name} a Mi Bolsillo`,
            token:token
        }

    }
}
