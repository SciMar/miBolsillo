import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Budget } from '../budgets/entities/budget.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,

    private readonly dataSource: DataSource, // Para transacciones DB
  ) {}

  // ✅ Crear transacción con manejo de presupuesto mejorado
  async create(dto: CreateTransactionDto, user: User) {
    const { amount, type, categoryId } = dto;

    if (!['income', 'expense'].includes(type)) {
      throw new BadRequestException('Tipo de transacción inválido');
    }

    // Usar transacción de base de datos para atomicidad
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear la transacción
      const transaction = this.transactionRepository.create({
        ...dto,
        user,
        category: categoryId ? { id: categoryId } : null,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Solo actualizar presupuesto si es EGRESO con categoría
      if (type === 'expense' && categoryId) {
        const budget = await queryRunner.manager.findOne(Budget, {
          where: { userId: user.id, categoryId },
        });

        if (budget) {
          // Validar que haya presupuesto suficiente
          const currentRemaining = +budget.remainingAmount || +budget.amount;
          
          if (currentRemaining < +amount) {
            throw new BadRequestException(
              `Presupuesto insuficiente. Disponible: ${currentRemaining}, Requerido: ${amount}`
            );
          }

          budget.remainingAmount = currentRemaining - +amount;
          await queryRunner.manager.save(budget);
        }
      }

      await queryRunner.commitTransaction();
      return savedTransaction;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 📋 Obtener todas las transacciones del usuario
  async findAllByUser(userId: number, filter?: { type?: 'income' | 'expense' }) {
    const query = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.userId = :userId', { userId });

    if (filter?.type) {
      query.andWhere('t.type = :type', { type: filter.type });
    }

    return query.orderBy('t.date', 'DESC').getMany();
  }

  // 🔍 Obtener una transacción
  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });

    if (!transaction) throw new NotFoundException('Transacción no encontrada');
    return transaction;
  }

  // ✏️ Actualizar transacción CON ajuste de presupuesto
  async update(id: number, dto: UpdateTransactionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id },
        relations: ['user', 'category'],
      });

      if (!transaction) throw new NotFoundException('Transacción no encontrada');

      // Si cambia el monto o tipo, revertir efecto anterior en presupuesto
      if ((dto.amount || dto.type) && transaction.type === 'expense' && transaction.category) {
        await this.revertBudgetEffect(transaction, queryRunner);
      }

      // Actualizar la transacción
      Object.assign(transaction, dto);
      const updated = await queryRunner.manager.save(transaction);

      // Aplicar nuevo efecto si es egreso
      if (updated.type === 'expense' && updated.category) {
        await this.applyBudgetEffect(updated, queryRunner);
      }

      await queryRunner.commitTransaction();
      return updated;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 🗑️ Eliminar transacción CON ajuste de presupuesto
  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id },
        relations: ['user', 'category'],
      });

      if (!transaction) throw new NotFoundException('Transacción no encontrada');

      // Revertir efecto en presupuesto si era egreso
      if (transaction.type === 'expense' && transaction.category) {
        await this.revertBudgetEffect(transaction, queryRunner);
      }

      await queryRunner.manager.remove(transaction);
      await queryRunner.commitTransaction();

      return { message: 'Transacción eliminada correctamente' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 💰 Obtener balance general del usuario
  async getBalance(userId: number) {
    const incomes = await this.transactionRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: 'income' })
      .getRawOne();

    const expenses = await this.transactionRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: 'expense' })
      .getRawOne();

    const totalIncome = +incomes.total || 0;
    const totalExpense = +expenses.total || 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  // 🔄 Distribuir remanente a presupuestos (NUEVA FUNCIONALIDAD)
  async distributeRemainingToBudgets(userId: number) {
    const balance = await this.getBalance(userId);
    const remaining = balance.balance;

    if (remaining <= 0) {
      throw new BadRequestException('No hay remanente positivo para distribuir');
    }

    const budgets = await this.budgetRepository.find({
      where: { userId },
    });

    if (budgets.length === 0) {
      throw new BadRequestException('El usuario no tiene presupuestos creados');
    }

    // Distribuir equitativamente (puedes cambiar la lógica)
    const amountPerBudget = remaining / budgets.length;

    for (const budget of budgets) {
      budget.remainingAmount = (+budget.remainingAmount || 0) + amountPerBudget;
      await this.budgetRepository.save(budget);
    }

    return {
      message: 'Remanente distribuido exitosamente',
      totalDistributed: remaining,
      budgetsUpdated: budgets.length,
      amountPerBudget,
    };
  }

  // 🔧 Métodos auxiliares privados
  private async revertBudgetEffect(transaction: Transaction, queryRunner: any) {
    const budget = await queryRunner.manager.findOne(Budget, {
      where: {
        userId: transaction.user.id,
        categoryId: transaction.category.id,
      },
    });

    if (budget) {
      // Devolver el monto al presupuesto
      budget.remainingAmount = (+budget.remainingAmount || 0) + +transaction.amount;
      await queryRunner.manager.save(budget);
    }
  }

  private async applyBudgetEffect(transaction: Transaction, queryRunner: any) {
    const budget = await queryRunner.manager.findOne(Budget, {
      where: {
        userId: transaction.user.id,
        categoryId: transaction.category.id,
      },
    });

    if (budget) {
      const currentRemaining = +budget.remainingAmount || +budget.amount;

      if (currentRemaining < +transaction.amount) {
        throw new BadRequestException('Presupuesto insuficiente');
      }

      budget.remainingAmount = currentRemaining - +transaction.amount;
      await queryRunner.manager.save(budget);
    }
  }
}