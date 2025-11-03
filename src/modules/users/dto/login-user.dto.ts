import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
/*
 * DTO LoginUserDTO
 * Define y valida el email y la contraseñade un usuario para su ingreso.
 * Aplica restricciones de tipo, longitud y obligatoriedad.
 */
export class LoginUserDTO{
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(15)
    password:string;
}