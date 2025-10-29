import { Injectable, NotFoundException, BadRequestException, ForbiddenException
 } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Budget } from '../budgets/entities/budget.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from '../users/entities/user.entity';
import { RolesEnum } from '../users/entities/user.entity';

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

  // Validar tipo de transacción
  if (!['income', 'expense'].includes(type)) {
    throw new BadRequestException('Tipo de transacción inválido');
  }

  // Verificar que exista la categoría
  const category = await this.dataSource.getRepository(Category).findOne({
    where: { id: categoryId },
  });
  if (!category) throw new NotFoundException('La categoría no existe');

  // Crear la transacción
  const transaction = this.transactionRepository.create({
    ...dto,
    user,
    category,
  });
  await this.transactionRepository.save(transaction);

  // ⚡ Ajustar presupuesto solo si es gasto y existe presupuesto
  let saldoActual: number | null = null;
  if (type === 'expense') {
    const budget = await this.budgetRepository.findOne({
      where: { categoryId, userId: user.id },
    });

    if (budget) {
      // Calcular total de gastos en esta categoría
      const { totalGastos } = await this.transactionRepository
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.amount), 0)', 'totalGastos')
        .where('t.userId = :userId', { userId: user.id })
        .andWhere('t.categoryId = :categoryId', { categoryId })
        .andWhere('t.type = :type', { type: 'expense' })
        .getRawOne();

      const saldoRestante = Number(budget.amount) - Number(totalGastos);
      budget.remainingAmount = saldoRestante;
      await this.budgetRepository.save(budget);

      saldoActual = saldoRestante;
    }
  }

  // Respuesta final
  return {
    mensaje: 'Transacción exitosa',
    registro: type === 'income' ? 'Ingreso' : 'Gasto',
    categoria: category.name,
    montoRegistrado: Number(amount),
    saldoActual:
      saldoActual !== null
        ? `Su saldo actual para "${category.name}" es de ${saldoActual}`
        : type === 'expense'
        ? `No hay presupuesto asociado a la categoría "${category.name}"`
        : 'Ingreso registrado correctamente',
  };
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

  // ===========================================================
  // ✏️ ACTUALIZAR UNA TRANSACCIÓN
  // Endpoint: PATCH /transactions/:id
  // ===========================================================
async update(id: number, dto: UpdateTransactionDto, user: User) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1️⃣ Buscar la transacción
    const transaction = await queryRunner.manager.findOne(Transaction, {
      where: { id },
      relations: ['user', 'category'],
    });
    if (!transaction) throw new NotFoundException('Transacción no encontrada');

    // 2️⃣ Validación de propietario (solo dueño o Admin)
    if (user.role !== 'admin' && transaction.user.id !== user.id) {
      throw new ForbiddenException('No tienes permiso para actualizar esta transacción');
    }

    // 3️⃣ Revertir efecto anterior sobre presupuesto si cambia monto o tipo
    if ((dto.amount !== undefined || dto.type) && transaction.category) {
      await this.revertBudgetEffect(transaction, queryRunner);
    }

    // 4️⃣ Actualizar datos de la transacción
    Object.assign(transaction, dto);
    const updated = await queryRunner.manager.save(transaction);

    // 5️⃣ Aplicar nuevo efecto sobre presupuesto
    let saldoActual: number | null = null;
    if (updated.category) {
      saldoActual = await this.applyBudgetEffect(updated, queryRunner);
    }

    await queryRunner.commitTransaction();

    // 6️⃣ Respuesta resumida y segura
    return {
      mensaje: 'Transacción actualizada con éxito',
      transaccion: {
        id: updated.id,
        description: updated.description,
        monto: Number(updated.amount),
        tipo: updated.type === 'income' ? 'Ingreso' : 'Gasto',
        fecha: updated.date,
        categoria: updated.category?.name || 'Sin categoría',
      },
      saldoActual:
        saldoActual !== null
          ? `Su saldo actual para "${updated.category?.name}" es de ${saldoActual}`
          : updated.type === 'expense'
          ? `No hay presupuesto asociado a la categoría "${updated.category?.name}"`
          : 'Ingreso registrado correctamente',
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// ===========================================================
// Helper: revertir efecto anterior sobre presupuesto
// Devuelve el presupuesto actualizado pero no lo imprime
// ===========================================================
private async revertBudgetEffect(transaction: Transaction, queryRunner: any) {
  const budget = await queryRunner.manager.findOne(Budget, {
    where: { userId: transaction.user.id, categoryId: transaction.category.id },
  });
  if (!budget) return;

  const currentRemaining = Number(budget.remainingAmount);
  const amount = Number(transaction.amount);

  if (transaction.type === 'expense') {
    budget.remainingAmount = Math.floor(currentRemaining + amount);
  } else {
    budget.remainingAmount = Math.floor(currentRemaining - amount);
  }

  await queryRunner.manager.save(budget);
}

// ===========================================================
// Helper: aplicar efecto sobre presupuesto
// Retorna el saldo actual de la categoría
// ===========================================================
private async applyBudgetEffect(transaction: Transaction, queryRunner: any): Promise<number | null> {
  const budget = await queryRunner.manager.findOne(Budget, {
    where: { userId: transaction.user.id, categoryId: transaction.category.id },
  });
  if (!budget) return null;

  const currentRemaining = Number(budget.remainingAmount);
  const amount = Number(transaction.amount);

  if (transaction.type === 'expense') {
    budget.remainingAmount = Math.floor(currentRemaining - amount);
  } else {
    budget.remainingAmount = Math.floor(currentRemaining + amount);
  }

  await queryRunner.manager.save(budget);
  
  return Math.floor(Number(budget.remainingAmount));
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
  }
}