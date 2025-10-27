import { IsOptional, IsString, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class updateCategoryDTO {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  name?: string;

  @IsOptional()
  @IsEnum(['income', 'expense'], { 
    message: 'El tipo debe ser "income" o "expense"' 
  })
  type?: 'income' | 'expense';

  @IsOptional()
  @IsBoolean({ message: 'El status debe ser true o false' })
  status?: boolean;
}
