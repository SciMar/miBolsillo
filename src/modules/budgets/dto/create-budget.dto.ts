import { IsNumber, IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  /**
   * Nombre del presupuesto (acepta 'name' o 'nombre').
   * Debe ser texto si se incluye.
   */
  @IsOptional()
  @IsString({ message: 'name/nombre debe ser texto' })
  name?: string;
    /**
   * Nombre alternativo del presupuesto ('nombre').
   * Valida igual que 'name'.
   */

  @IsOptional()
  @IsString({ message: 'name/nombre debe ser texto' })
  nombre?: string;

  /**
   * Monto asignado al presupuesto ('amount' o 'monto').
   * Debe ser numérico con máximo dos decimales.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount/monto debe ser un número con máximo 2 decimales' })
  amount?: number;
  /**
   * Monto alternativo ('monto'), equivalente a 'amount'.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount/monto debe ser un número con máximo 2 decimales' })
  monto?: number;
  /**
   * Identificador de la categoría asociada.
   * Debe ser un número entero si se incluye.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'categoryId debe ser un entero' })
  categoryId?: number | null;
  /**
   * Fecha de inicio del presupuesto.
   * Debe tener formato de fecha ISO válido.
   */
  @IsOptional()
  @IsDateString({}, { message: 'startDate/inicio debe tener formato de fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ)' })
  startDate?: string | null;
  /**
   * Fecha de fin del presupuesto.
   * Debe tener formato de fecha ISO válido.
   */
  @IsOptional()
  @IsDateString({}, { message: 'endDate/fin debe tener formato de fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ)' })
  endDate?: string | null;
}
