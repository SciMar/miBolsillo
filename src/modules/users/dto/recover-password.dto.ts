import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
/*
 * DTO RecoverPasswordDTO
 * Define y valida el correo para cambiar la contraseña deñ usuario.
 * Aplica restricciones de tipo, longitud y obligatoriedad.
 */
export class RecoverPasswordDTO{
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    @Transform(({ value }) => value.trim().toLowerCase())
    email:string;
/*
 * Solicita la contraseña antigua del usuario
 */
    @IsString()
    @Length(6,20, {message:"La contraseña debe tener entre 6 y 20 caracteres"})
    password:string;
/*
 * Solicita la nueva contraseña del usuario
 */
    @IsString()
    @Length(6,20, {message:"La nueva contraseña debe tener entre 6 y 20 caracteres"})
    newPassword:string;
}