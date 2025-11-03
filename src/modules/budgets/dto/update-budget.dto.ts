import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetDto } from './create-budget.dto';
/*
* Updatebudget extiende de manera parcial de createBudget
* PartialType-> permite que los campos a editar sean opcionales
*/
export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}
