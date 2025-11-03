import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
/*
 * DTO createUserDTO
 * Define y valida los datos necesarios para crear un usuario.
 * Aplica restricciones de tipo, longitud y obligatoriedad.
 */
export class CreateUserDTO {
  /* 
   * Nombre del usuario 
   * Debe ser texto y obligatorio
   * Se pasa a mayuscula
   */
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Transform(({ value }) => value.trim().toUpperCase())
  name: string;
  /* 
   * Email del usuario 
   * Debe ser tipo correo y obligatorio
   * Se pasa a minuscula
   */
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;
  /* 
   * contraseña del usuario 
   * Debe ser entre 6 y 20 caracteres, es obligatorio
   */
  @IsString()
  @Length(6, 20, { message: 'La contraseña debe tener entre 6 y 20 caracteres' })
  password: string;
}
