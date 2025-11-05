import { IsString, IsNumber, IsEnum, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/*
  * Define las validaciones para crear una transacción.
  *Se usa para asegurar que los datos enviados al backend
  * cumplan con el formato y tipo esperado.
 */
export class CreateTransactionDto {
    /* Descripción breve de la transacción (obligatoria y tipo texto) */
  @IsNotEmpty({ message: 'El nombre de la transacción es obligatorio' })
  @IsString()
  description: string;

  
  /* Monto de la transacción (obligatorio, numérico y >= 0) */
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @IsNumber()
  @Min(0)
  @Type(()=> Number) // Transforma el valor a número automáticamente
  amount: number;

  /* Tipo de transacción: 'income' (ingreso) o 'expense' (gasto) */
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

/* ID de categoría asociada (opcional) */
  @IsNotEmpty({ message: 'Debe seleccionar una categoría para la transacción' })
  @IsNumber()
  categoryId?: number; // opcional si quieres asignar categoría
}
