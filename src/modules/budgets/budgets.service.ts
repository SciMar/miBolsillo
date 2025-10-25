// src/modules/budgets/budgets.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(@InjectRepository(Budget) private readonly repo: Repository<Budget>) {}

  async create(dto: CreateBudgetDto) {
    if (dto.startDate && dto.endDate && new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('endDate must be greater than startDate');
    }
    const budget = this.repo.create({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
    return this.repo.save(budget);
  }

  findAllByUser(userId: number, filters?: { categoryId?: number; from?: string; to?: string }) {
    const where: FindOptionsWhere<Budget> = { userId };

    if (typeof filters?.categoryId === 'number') where.categoryId = filters.categoryId;

    // Filtro por rango de fechas si llega (simple: solapa por startDate/endDate)
    return this.repo.find({
      where,
      order: { startDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const b = await this.repo.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Budget not found');
    return b;
  }

  async update(id: number, dto: UpdateBudgetDto) {
    const b = await this.findOne(id);
    if (dto.startDate && dto.endDate && new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('endDate must be greater than startDate');
    }
    Object.assign(b, {
      ...dto,
      ...(dto.startDate !== undefined ? { startDate: dto.startDate ? new Date(dto.startDate) : null } : {}),
      ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
    });
    return this.repo.save(b);
  }

  async remove(id: number) {
    const b = await this.findOne(id);
    await this.repo.remove(b);
    return { deleted: true };
  }
}
