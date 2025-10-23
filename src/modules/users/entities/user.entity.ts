// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Budget } from "modules/budgets/entities/budget.entity";
import { Report } from "modules/reports/entities/report.entity";
import { Setting } from "modules/settings/entities/setting.entity";
import { Notification } from "modules/notifications/entities/notification.entity";
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

  @OneToMany(() => Budget, (budget) => budget.user)
    budgets: Budget[];

  @OneToMany(() => Report, (report) => report.user)
    reports: Report[];

  @OneToMany(() => Setting, (setting) => setting.user)
    settings: Setting[];

  @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

}
