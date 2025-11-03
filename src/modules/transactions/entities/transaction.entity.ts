import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Budget } from 'src/modules/budgets/entities/budget.entity';
/* 

  *Representa los movimientos financieros del usuario.
  *Puede ser un ingreso ('income') o un gasto ('expense').
 */
@Entity()
export class Transaction {
    /* Identificador único autogenerado para cada transacción */
  @PrimaryGeneratedColumn()
  id: number;

  /* Descripción breve del movimiento (obligatoria) */
  @Column({ nullable: false })
  description: string;


  /* Monto de la transacción (hasta 10 dígitos y 2 decimales) */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  /* Tipo de transacción: ingreso o gasto */
  @Column({ type: 'enum', enum: ['income', 'expense'], nullable: false })
  type: 'income' | 'expense';

  /* Fecha y hora de creación de la transacción */
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  /* Relación con el usuario que registró la transacción */
  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  /* Relación con la categoría asociada (opcional) */
  @ManyToOne(() => Category, (category) => category.transactions)
  category: Category;
  }

