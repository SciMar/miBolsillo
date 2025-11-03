import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { Budget } from '../../budgets/entities/budget.entity';
/**
 * Entidad Category
 * Representa las categorías creadas por los usuarios.
 * Cada categoría puede estar asociada a transacciones y presupuestos.
 */
@Entity('categories')
export class Category {

  /** Identificador único de la categoría. */
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre único de la categoría. */
  @Column({ unique: true })
  name: string;

  /** Tipo de categoría: puede ser 'income' o 'expense'. */
  @Column({ type: 'enum', enum: ['income', 'expense'] })
  type: 'income' | 'expense';

  /** Estado de la categoría: activa (true) o inactiva (false). */
  @Column({default: true})
  status: boolean

  /** Relación uno a muchos con las transacciones que usan esta categoría. */
  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[]

  /** Relación muchos a uno con el presupuesto al que pertenece la categoría. */
  @ManyToOne(() => Budget, budget => budget.categories)
  budget: Budget;
  
}
