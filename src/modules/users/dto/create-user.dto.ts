import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Transform(({ value }) => value.trim().toUpperCase())
  name: string;
  /* 
   * Email del usuario 
   * Debe ser tipo correo y obligatorio
   * Se pasa a minuscula
   */
  @ApiProperty({example:"juanp@gmail.com", description:"Correo electrónico válido del usuario"})
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;
  /* 
   * contraseña del usuario 
   * Debe ser entre 6 y 20 caracteres, es obligatorio
   */
  @ApiProperty({example:"juan12345", description:"Contraseña del usuario (6-20 caracteres)"})
  @IsString()
  @Length(6, 20, { message: 'La contraseña debe tener entre 6 y 20 caracteres' })
  password: string;
}
