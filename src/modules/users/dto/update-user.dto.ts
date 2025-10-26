import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Roles } from "../entities/user.entity";

export class UpdateUserDTO{
    @IsString()
    @IsOptional()
    name?:string; 
    
    @IsEmail()
    @IsOptional()
    email?:string; 
    
    @IsString()
    @MinLength(6)
    @MaxLength(15)
    @IsOptional()
    password?:string

    @IsOptional()
    role:Roles

    @IsBoolean()
    @IsOptional()
    isActive?:boolean
}