import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Roles } from "../entities/user.entity";
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
    @IsString()
    @IsOptional()
    name?:string; 
  /*
   * Email del usuario 
   * Debe ser tipo mail, no es obligatorio.
   */
    @IsEmail()
    @IsOptional()
    email?:string; 
  /*
   * Contraseña del usuario 
   * Debe tener una longitud entre 6 a 15 caracteres, no es obligatorio.
   */
    @IsString()
    @MinLength(6)
    @MaxLength(15)
    @IsOptional()
    password?:string
  /*
   * Rol del usuario 
   * Debe ser de tipo rol, obligatorio
   */
    @IsOptional()
    role:Roles
/*
   * estatus del usuario 
   * No obligatorio, true o false
   */
    @IsBoolean()
    @IsOptional()
    isActive?:boolean
}