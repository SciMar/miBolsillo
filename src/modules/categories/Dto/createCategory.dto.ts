import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
/*
 * DTO createCategoryDTO
 * Define y valida los datos necesarios para crear una categoría.
 * Aplica restricciones de tipo, longitud y obligatoriedad.
 */
export class createCategoryDTO {
  /** 
   * Nombre de la categoría. 
   * Debe ser texto, obligatorio y con una longitud entre 3 y 50 caracteres.
   */
  @ApiProperty({example: 'Alimentos', description: 'Nombre de la categoría'})
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  name: string;
  /** 
   * Tipo de categoría.
   * Solo acepta los valores 'income' o 'expense'.
   */
  @ApiProperty({example: 'income', description: 'Tipo de categoría: income o expense'})
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  @IsEnum(['income', 'expense'], { 
    message: 'El tipo debe ser "income" o "expense"' 
  })
  type: 'income' | 'expense';

  /** 
   * Estado de la categoría.
   * Es opcional y solo acepta valores booleanos (true o false).
   */
  @ApiProperty({example: true, description: 'Estado de la categoría', required:false})
  @IsOptional()
  @IsBoolean({ message: 'El status debe ser true o false' })
  status?: boolean;
}
