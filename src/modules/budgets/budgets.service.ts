import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(@InjectRepository(Budget) private readonly repo: Repository<Budget>) {}

  // ---- helpers de formato (sin crear archivos nuevos) ----
  private fmtDate(d?: Date | null): string | null {
    return d ? new Date(d).toISOString().slice(0, 10) : null; // YYYY-MM-DD
  }

  private toSpanishResponse(b: Budget) {
    return {
      id: b.id,
      nombre: b.name,
      monto: Number(b.amount),
      inicio: this.fmtDate(b.startDate),
      fin: this.fmtDate(b.endDate),
      categoriaId: b.categoryId ?? null,
    };
  }

  /** Obtiene name/amount aceptando también nombre/monto */
  private pickNameAndAmount(dto: Partial<CreateBudgetDto | UpdateBudgetDto>) {
    const name = (dto as any).name ?? (dto as any).nombre;
    const amount = (dto as any).amount ?? (dto as any).monto;
    return { name, amount };
  }
  // --------------------------------------------------------
  
  async createForUser(dto: CreateBudgetDto, user: any) {
  const { name, amount } = this.pickNameAndAmount(dto);

  if (!name) throw new BadRequestException('El campo name (o nombre) es obligatorio');
  if (amount === undefined || amount === null) {
    throw new BadRequestException('El campo amount (o monto) es obligatorio');
  }

  if (dto.startDate && dto.endDate && new Date(dto.endDate) < new Date(dto.startDate)) {
    throw new BadRequestException('La fecha de fin debe ser mayor o igual a la fecha de inicio');
  }

  const budget = this.repo.create({
    name,
    amount,
    userId: user.id, // ← se toma del token, NO del body
    categoryId: dto.categoryId ?? null,
    startDate: dto.startDate ? new Date(dto.startDate) : null,
    endDate: dto.endDate ? new Date(dto.endDate) : null,
  });

  const saved = await this.repo.save(budget);
  return this.toSpanishResponse(saved);
}

  findAllByUser(userId: number, filters?: { categoryId?: number; from?: string; to?: string }) {
    const where: FindOptionsWhere<Budget> = { userId };
    if (typeof filters?.categoryId === 'number') where.categoryId = filters.categoryId;

    return this.repo.find({
      where,
      order: { startDate: 'DESC', createdAt: 'DESC' },
    }).then(items => items.map(b => this.toSpanishResponse(b)));
  }

  findAll() {
  return this.repo.find({
    order: { startDate: 'DESC', createdAt: 'DESC' },
  }).then(items => items.map(b => this.toSpanishResponse(b)));
}


  async findOne(id: number) {
    const b = await this.repo.findOne({ where: { id } });
    if (!b) throw new NotFoundException('No se encontró el presupuesto');
    return this.toSpanishResponse(b);
  }

  async update(id: number, dto: UpdateBudgetDto) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('No se encontró el presupuesto');

    const { name, amount } = this.pickNameAndAmount(dto);

    if (dto.startDate && dto.endDate && new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('La fecha de fin debe ser mayor o igual a la fecha de inicio');
    }

    Object.assign(entity, {
      ...(name !== undefined ? { name } : {}),
      ...(amount !== undefined ? { amount } : {}),
      //...(dto.userId !== undefined ? { userId: dto.userId } : {}),//
      ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
      ...(dto.startDate !== undefined ? { startDate: dto.startDate ? new Date(dto.startDate) : null } : {}),
      ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
    });

    const saved = await this.repo.save(entity);
    return this.toSpanishResponse(saved);
  }

  async remove(id: number) {
    const b = await this.repo.findOne({ where: { id } });
    if (!b) throw new NotFoundException('No se encontró el presupuesto');

    await this.repo.remove(b);
    return { mensaje: 'Presupuesto eliminado' };
  }
  // 🔍 Buscar presupuestos por nombre
async buscarPorNombre(texto: string) {
  if (!texto || !texto.trim()) {
    return { mensaje: 'Debe ingresar un texto para buscar' };
  }

  const qb = this.repo
    .createQueryBuilder('b')
    .where('LOWER(b.name) LIKE :texto', { texto: `%${texto.toLowerCase()}%` })
    .orderBy('b.createdAt', 'DESC');

  const resultados = await qb.getMany();

  return resultados.length
    ? resultados.map((b) => this.toSpanishResponse(b))
    : { mensaje: 'No se encontraron presupuestos con ese nombre' };
}


}


