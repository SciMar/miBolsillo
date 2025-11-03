import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
/*
* UpdateTransaction extiende de manera parcial de createTransaction
* PartialType-> permite que los campos a editar sean opcionales
*/
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
