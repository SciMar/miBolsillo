import { IsEnum } from 'class-validator';
import { RolesEnum } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
/*
 * DTO UpdateUserRoleDTO
 * Define y valida el rol de un usuario
 * Solo se permite usuario estandar o premium
 */
export class UpdateUserRoleDTO {
  @ApiProperty({example:"premium", description:"Nuevo rol del usuario: user o premium"})
  @IsEnum(RolesEnum, { message: 'El rol debe ser user o premium' })
  role: RolesEnum.USER | RolesEnum.PREMIUM; /* Solo permite user o premium*/
}