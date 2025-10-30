import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles (RolesEnum.PREMIUM, RolesEnum.ADMIN)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @Post()
  create(@Body() dto: CreateBudgetDto, @Req() req) {
    const user = req.user; 
    return this.service.createForUser(dto, user);
  }

  // /budgets/user/1?categoryId=3
  @Get('user/:userId')
  findAllByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.service.findAllByUser(userId, {
      categoryId: categoryId ? Number(categoryId) : undefined,
    });
  }
  @Get()
findAll() {
  return this.service.findAll();
}

  // 🔍 Buscar presupuestos por nombre
@Get('buscar')
buscar(@Query('q') q: string) {
  return this.service.buscarPorNombre(q);
}


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }


  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBudgetDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
