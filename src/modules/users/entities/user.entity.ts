// src/modules/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Budget } from "../../budgets/entities/budget.entity";
import { Category } from "../../categories/entities/category.entity";
import { Notification } from "../../notifications/entities/notification.entity";
import { Report } from "../../reports/entities/report.entity";
import { Setting } from "../../settings/entities/setting.entity";

// Tipos y enum para roles
export type Roles="admin"| "user"|"premium"
export enum RolesEnum{
  ADMIN="admin", 
  USER="user", 
  PREMIUM="premium"
}

// Definición de la entidad User
@Entity() //decorador que marca la clase como una entidad de base de datos
export class User {
  @PrimaryGeneratedColumn() //decorador que marca la propiedad como clave primaria      
  id: number;

  @Column({ nullable: false }) //decorador que marca la propiedad como columna de la tabla
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, default: 'user' })
  role:Roles;

  @Column({nullable:false, default:true})
  isActive:boolean;

  //Relaciones
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

  @OneToMany(()=> Category, (category)=>category.user)
  categories: Category [];

}


