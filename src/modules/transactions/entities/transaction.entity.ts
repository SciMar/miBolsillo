// src/modules/transactions/entities/transaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'modules/users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';


@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'enum', enum: ['income', 'expense'], nullable: false })
  type: 'income' | 'expense';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @ManyToOne(() => Category, (category) => category.transactions)
  category: Category[];
  
  }

