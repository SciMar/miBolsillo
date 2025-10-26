import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
export class CreateUserDTO{
    @IsString()
    @IsNotEmpty()
    name:string; 

    @IsEmail()
    @IsNotEmpty()
    email:string; 

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(15)
    password:string
}