import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @Post()
  create(@Body() dto: CreateBudgetDto) {
    return this.service.create(dto);
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
