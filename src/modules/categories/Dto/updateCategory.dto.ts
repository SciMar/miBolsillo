import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { createCategoryDTO } from './createCategory.dto';

export class updateCategoryDTO extends PartialType (createCategoryDTO) {
}
