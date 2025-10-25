// src/modules/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Transaction } from "../../transactions/entities/transaction.entity";
import { Budget } from "../../budgets/entities/budget.entity";
import { Report } from "../../reports/entities/report.entity";           // ⬅️ antes: "modules/reports/..."
import { Setting } from "../../settings/entities/setting.entity";        // ⬅️ antes: "modules/settings/..."
import { Notification } from "../../notifications/entities/notification.entity"; // ⬅️ antes: "modules/notifications/..."

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
  role: string;

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
