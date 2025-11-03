import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { createCategoryDTO } from './createCategory.dto';
/*
* UpdateCategory extiende de manera parcial de createCategory
* PartialType-> permite que los campos a editar sean opcionales
*/
export class updateCategoryDTO extends PartialType (createCategoryDTO) {
}
