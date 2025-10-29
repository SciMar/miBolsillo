import { IsNumber, IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  // Aceptamos name o nombre (validaremos en el servicio que llegue al menos uno)
  @IsOptional()
  @IsString({ message: 'name/nombre debe ser texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'name/nombre debe ser texto' })
  nombre?: string;

  // Aceptamos amount o monto
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount/monto debe ser un número con máximo 2 decimales' })
  amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount/monto debe ser un número con máximo 2 decimales' })
  monto?: number;

  // userId ahora está en el DTO para que no lo elimine el whitelist
  /* COMENTADO PARA NO PEDIRLO EN LA CREACIÓN DE BUDGET
  @Type(() => Number)
  @IsInt({ message: 'userId debe ser un entero' })
  @Min(1, { message: 'userId debe ser mayor o igual a 1' })
  userId: number; */

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'categoryId debe ser un entero' })
  categoryId?: number | null;

  @IsOptional()
  @IsDateString({}, { message: 'startDate/inicio debe tener formato de fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ)' })
  startDate?: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'endDate/fin debe tener formato de fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ)' })
  endDate?: string | null;
}
