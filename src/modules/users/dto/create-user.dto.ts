import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Transform(({ value }) => value.trim().toUpperCase())
  name: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @IsString()
  @Length(6, 20, { message: 'La contraseña debe tener entre 6 y 20 caracteres' })
  password: string;
}
