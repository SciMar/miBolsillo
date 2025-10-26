// src/modules/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Budget } from "../../budgets/entities/budget.entity";
import { Report } from "../../reports/entities/report.entity";
import { Setting } from "../../settings/entities/setting.entity";
import { Notification } from "../../notifications/entities/notification.entity";
import { Category } from "../../categories/entities/category.entity";

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

//!!!! realcion con categorias
  @OneToMany(() => Category, (category) => category.user)
  category: Category[];

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


