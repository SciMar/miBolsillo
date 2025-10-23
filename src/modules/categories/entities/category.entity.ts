// src/modules/categories/entities/category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: ['ingreso', 'gasto'] })
  type: 'ingreso' | 'gasto';

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];
}
