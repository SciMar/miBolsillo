import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';

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
  @OneToMany(()=> User, (user)=>user.category)
  user: User[]
  

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[]
}