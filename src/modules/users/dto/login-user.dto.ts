import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
/*
 * DTO LoginUserDTO
 * Define y valida el email y la contraseñade un usuario para su ingreso.
 * Aplica restricciones de tipo, longitud y obligatoriedad.
 */
export class LoginUserDTO{
    @ApiProperty({example:"juan@gmail.com", description:"Correo electrónico del usuario"})
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @ApiProperty({example:"password123", description:"Contraseña del usuario (6-20 caracteres)"})
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password:string;
}