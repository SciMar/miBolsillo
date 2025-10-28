import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class RecoverPasswordDTO{
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    @Transform(({ value }) => value.trim().toLowerCase())
    email:string;

    @IsString()
    @Length(6,20, {message:"La contraseña debe tener entre 6 y 20 caracteres"})
    password:string;

    @IsString()
    @Length(6,20, {message:"La nueva contraseña debe tener entre 6 y 20 caracteres"})
    newPassword:string;
}