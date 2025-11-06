import { IsNumber, IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  /**
   * Nombre del presupuesto (acepta 'name' o 'nombre').
   * Debe ser texto si se incluye.
   */
  @ApiProperty({ example: 'Monthly budget', description: 'Budget name', required:false })
  @IsOptional()
  @IsString({ message: 'name/nombre debe ser texto' })
  name?: string;
    /**
   * Nombre alternativo del presupuesto ('nombre').
   * Valida igual que 'name'.
   */

  @ApiProperty({ example: 'Presupuesto Mensual', description: 'Nombre del presupuesto', required:false})
  @IsOptional()
  @IsString({ message: 'name/nombre debe ser texto' })
  nombre?: string;

  /**
   * Monto asignado al presupuesto ('amount' o 'monto').
   * Debe ser numérico con máximo dos decimales.
   */
  @ApiProperty({ example: 1500.00, description: 'Amount allocated to the budget', required:false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount/monto debe ser un número con máximo 2 decimales' })
  amount?: number;
  /**
   * Monto alternativo ('monto'), equivalente a 'amount'.
   */
  @ApiProperty({ example: 1500.00, description: 'Monto asignado al presupuesto', required:false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount/monto debe ser un número con máximo 2 decimales' })
  monto?: number;
  /**
   * Identificador de la categoría asociada.
   * Debe ser un número entero si se incluye.
   */
  @ApiProperty({ example: 3, description: 'Identificador de la categoría asociada' , required:false})
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'categoryId debe ser un entero' })
  categoryId?: number | null;
  /**
   * Fecha de inicio del presupuesto.
   * Debe tener formato de fecha ISO válido.
   */
  @ApiProperty({ example: '2023-01-01', description: 'Fecha de inicio del presupuesto', required:false })
  @IsOptional()
  @IsDateString({}, { message: 'startDate/inicio debe tener formato de fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ)' })
  startDate?: string | null;
  /**
   * Fecha de fin del presupuesto.
   * Debe tener formato de fecha ISO válido.
   */
  @ApiProperty({ example: '2023-01-31', description: 'Fecha de fin del presupuesto', required:false })
  @IsOptional()
  @IsDateString({}, { message: 'endDate/fin debe tener formato de fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ)' })
  endDate?: string | null;
}
