import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Roles } from "../entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
/*
 * DTO UpdateUserDTO
 * Define y valida los datos necesarios para actualizar un usuario.
 * Aplica restricciones de tipo, longitud y obligatoriedad.
 */
export class UpdateUserDTO{
  /*
   * Nombre del usuario 
   * Debe ser texto, no es obligatorio.
   */
    @ApiProperty({example:"Juan Perez", description:"Nombre completo del usuario", required:false})
    @IsString()
    @IsOptional()
    name?:string; 
  /*
   * Email del usuario 
   * Debe ser tipo mail, no es obligatorio.
   */
    @ApiProperty({example:"juanp@gmail.com", description:"Correo electrónico del usuario", required:false})
    @IsEmail()
    @IsOptional()
    email?:string; 
  /*
   * Contraseña del usuario 
   * Debe tener una longitud entre 6 a 15 caracteres, no es obligatorio.
   */
    @ApiProperty({example:"password123", description:"Contraseña del usuario (6-20 caracteres)", required:false})
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @IsOptional()
    password?:string
  /*
   * Rol del usuario 
   * Debe ser de tipo rol, obligatorio
   */
    @ApiProperty({example:"user", description:"Rol del usuario (user | premium | admin)", required:false})
    @IsOptional()
    role?:Roles
/*
   * estatus del usuario 
   * No obligatorio, true o false
   */
    @ApiProperty({example:true, description:"Estatus del usuario (activo/inactivo)", required:false})
    @IsBoolean()
    @IsOptional()
    isActive?:boolean
}