import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Budget } from '../budgets/entities/budget.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    // Repositorio para manejar transacciones (ingresos/gastos)
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    // Repositorio para manejar presupuestos
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,

    // Fuente de datos para crear transacciones SQL seguras (QueryRunner)
    private readonly dataSource: DataSource,
  ) {}

// ===========================================================
// 🟢 CREAR TRANSACCIÓN
// Endpoint: POST /transactions
// ===========================================================
 
 async create(dto: CreateTransactionDto, user: User) {
  const { amount, type, categoryId } = dto;

  // 🧩 Validar tipo de transacción
  if (!['income', 'expense'].includes(type)) {
    throw new BadRequestException('Tipo de transacción inválido');
  }

  // 🧩 Verificar que exista la categoría
  const category = await this.dataSource.getRepository(Category).findOne({
    where: { id: categoryId },
  });

  if (!category) {
    throw new NotFoundException('La categoría no existe');
  }

  // 🧾 Crear la transacción
  const transaction = this.transactionRepository.create({
    ...dto,
    user, // se guarda internamente, pero no se mostrará en la respuesta
    category,
  });

  await this.transactionRepository.save(transaction);

  // 💰 Buscar el presupuesto asociado a la categoría
  const budget = await this.budgetRepository.findOne({
    where: { categoryId, userId: user.id },
  });

  let saldoActual = null;

  // 💸 Ajustar saldo solo si existe un presupuesto
  if (budget) {
    const currentRemaining = Number(budget.remainingAmount ?? budget.amount);

    // Si es gasto, restamos; si es ingreso, sumamos
    const nuevoSaldo =
      type === 'expense'
        ? currentRemaining - Number(amount)
        : currentRemaining + Number(amount);

    budget.remainingAmount = nuevoSaldo;
    await this.budgetRepository.save(budget);

    saldoActual = nuevoSaldo;
  }

  // 🟢 Respuesta simplificada
  return {
    mensaje: 'Transacción exitosa',
    registro: type === 'income' ? 'Ingreso' : 'Gasto',
    categoria: category.name,
    montoRegistrado: Number(amount),
    saldoActual:
      saldoActual !== null
        ? `Su saldo actual para "${category.name}" es de ${saldoActual}`
        : `No hay presupuesto asociado a la categoría "${category.name}"`,
  }
}
  

  // ===========================================================
  // 📋 OBTENER TODAS LAS TRANSACCIONES DE UN USUARIO FILTRADAS POR TIPO DE GASTO
  // Endpoint: GET /transactions/user/:userId?type=income|expense
  // ===========================================================

  async findAllByUserGrouped(userId: number) {
  // Obtener todas las transacciones del usuario
  const transactions = await this.transactionRepository.find({
    where: { user: { id: userId } },
    relations: ['category', 'user'],
    order: { date: 'DESC' },
  });

  if (!transactions.length) {
    throw new NotFoundException('No se encontraron transacciones para este usuario');
  }

  const user = transactions[0].user;

  // Agrupar por tipo
  const grouped = transactions.reduce(
    (acc, tx) => {
      const simplifiedTx = {
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        category: tx.category.name,
      };
      if (tx.type === 'income') {
        acc.income.push(simplifiedTx);
      } else {
        acc.expense.push(simplifiedTx);
      }
      return acc;
    },
    { income: [], expense: [] },
  );

  return {
    userId: user.id,
    userName: user.name,
    transactions: grouped,
  };
  }

  // ===========================================================
  // 🔍 OBTENER UNA TRANSACCIÓN POR ID (procesada en el servidor)
  // Endpoint: GET /transactions/:id
  // ===========================================================
  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });

    if (!transaction) throw new NotFoundException('Transacción no encontrada');

    // ✅ Procesamiento en el servidor: organizar la respuesta
    return {
      transaction: {
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        category: transaction.category?.name || 'Sin categoría',
      },
      user: {
        id: transaction.user?.id,
        name: transaction.user?.name,
        role: transaction.user?.role,
      },
    };
  }

  // ===========================================================
  // 💰 OBTENER BALANCE GENERAL
  // Endpoint: GET /transactions/balance/:userId
  // ===========================================================
  
  async getBalance(userId: number) {
    // Calcular total de ingresos
    const incomes = await this.transactionRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: 'income' })
      .getRawOne();

    // Calcular total de gastos
    const expenses = await this.transactionRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: 'expense' })
      .getRawOne();

    const totalIncome = +incomes.total || 0;
    const totalExpense = +expenses.total || 0;
    const balance = totalIncome - totalExpense;

    // Obtener datos del usuario
  const user = await this.dataSource.getRepository(User).findOne({
    where: { id: userId },
  });

  if (!user) throw new NotFoundException('Usuario no encontrado');

    // Retornar balance general
    return {

    userId: user.id,
    userName: user.name,
    totalIngresos: totalIncome,
    totalGastos: totalExpense,
    balance: balance,
    };
  }
}
/*  
  // ===========================================================
  // ✏️ ACTUALIZAR UNA TRANSACCIÓN
  // Endpoint: PATCH /transactions/:id
  // ===========================================================
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

      // Si se modifica el monto o tipo, se revierte el efecto anterior en presupuesto
      if ((dto.amount || dto.type) && transaction.type === 'expense' && transaction.category) {
        await this.revertBudgetEffect(transaction, queryRunner);
      }

      // Actualizar los datos de la transacción
      Object.assign(transaction, dto);
      const updated = await queryRunner.manager.save(transaction);

      // Si sigue siendo un gasto, aplicar el nuevo efecto sobre presupuesto
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

  // ===========================================================
  // 🗑️ ELIMINAR UNA TRANSACCIÓN
  // Endpoint: DELETE /transactions/:id
  // ===========================================================
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

      // Si era un gasto, devolver el monto al presupuesto
      if (transaction.type === 'expense' && transaction.category) {
        await this.revertBudgetEffect(transaction, queryRunner);
      }

      // Eliminar la transacción
      await queryRunner.manager.remove(transaction);
      await queryRunner.commitTransaction();

      return { message: 'Transacción eliminada correctamente' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }*/

  
/*
  // ===========================================================
  // 🔄 DISTRIBUIR REMANENTE ENTRE PRESUPUESTOS
  // Endpoint: POST /transactions/distribute/:userId
  // ===========================================================
  async distributeRemainingToBudgets(userId: number) {
    const balance = await this.getBalance(userId);
    const remaining = balance.balance;

    // Validar que haya remanente positivo
    if (remaining <= 0) {
      throw new BadRequestException('No hay remanente positivo para distribuir');
    }

    const budgets = await this.budgetRepository.find({ where: { userId } });

    if (budgets.length === 0) {
      throw new BadRequestException('El usuario no tiene presupuestos creados');
    }

    // Distribuir el saldo restante equitativamente entre presupuestos
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

  // ===========================================================
  // ⚙️ MÉTODOS PRIVADOS AUXILIARES
  // ===========================================================

  // 🔁 Revertir efecto del gasto en presupuesto (al eliminar o editar)
  private async revertBudgetEffect(transaction: Transaction, queryRunner: any) {
    const budget = await queryRunner.manager.findOne(Budget, {
      where: {
        userId: transaction.user.id,
        categoryId: transaction.category.id,
      },
    });

    if (budget) {
      // Devolver el monto al presupuesto original
      budget.remainingAmount = (+budget.remainingAmount || 0) + +transaction.amount;
      await queryRunner.manager.save(budget);
    }
  }

  // 💸 Aplicar efecto de gasto sobre presupuesto
  private async applyBudgetEffect(transaction: Transaction, queryRunner: any) {
    const budget = await queryRunner.manager.findOne(Budget, {
      where: {
        userId: transaction.user.id,
        categoryId: transaction.category.id,
      },
    });

    if (budget) {
      const currentRemaining = +budget.remainingAmount || +budget.amount;

      // Validar fondos disponibles
      if (currentRemaining < +transaction.amount) {
        throw new BadRequestException('Presupuesto insuficiente');
      }

      // Restar el monto gastado
      budget.remainingAmount = currentRemaining - +transaction.amount;
      await queryRunner.manager.save(budget);
    }
  }*/
