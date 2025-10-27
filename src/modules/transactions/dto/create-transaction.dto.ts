import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @Type(()=> Number)
  amount: number;

  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @IsOptional()
  @IsNumber()
  categoryId?: number; // opcional si quieres asignar categoría
}
