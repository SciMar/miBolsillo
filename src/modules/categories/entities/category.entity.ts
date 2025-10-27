import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { Budget } from '../../budgets/entities/budget.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: ['income', 'expense'] })
  type: 'income' | 'expense';

  @Column({default: true})
  status: boolean
// !!!relacion con user
  @ManyToOne(()=> User, (user)=>user.categories)
  user: User[]

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[]

  @OneToMany(() => Budget, (budget) => budget.category)
  budgets: Budget[]
  
}
