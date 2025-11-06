import { IsString, IsNumber, IsEnum, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/*
  * Define las validaciones para crear una transacción.
  *Se usa para asegurar que los datos enviados al backend
  * cumplan con el formato y tipo esperado.
 */
export class CreateTransactionDto {
    /* Descripción breve de la transacción (obligatoria y tipo texto) */
  @ApiProperty({example: 'Compra de supermercado', description: 'Descripción de la transacción'})
  @IsNotEmpty({ message: 'El nombre de la transacción es obligatorio' })
  @IsString()
  description: string;

  
  /* Monto de la transacción (obligatorio, numérico y >= 0) */
  @ApiProperty({example: 150.75, description: 'Monto de la transacción'})
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @IsNumber()
  @Min(0)
  @Type(()=> Number) // Transforma el valor a número automáticamente
  amount: number;

  /* Tipo de transacción: 'income' (ingreso) o 'expense' (gasto) */
  @ApiProperty({example: 'expense', description: 'Tipo de transacción: income o expense'})
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

/* ID de categoría asociada (opcional) */
  @ApiProperty({example:1, description:"Seleccionar id de la categoria asociada a la transacción", required:false})
  @IsNotEmpty({ message: 'Debe seleccionar una categoría para la transacción' })
  @IsNumber()
  categoryId?: number; // opcional si quieres asignar categoría
}
