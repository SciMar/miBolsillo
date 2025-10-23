// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Transaction } from '../../transactions/entities/transaction.entity';
;
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, default: 'user' })
  role: string; // valores: 'admin', 'user', 'premium'

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];


}
