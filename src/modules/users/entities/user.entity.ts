import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Budget } from "../../budgets/entities/budget.entity";
import { Category } from "../../categories/entities/category.entity";
import { Notification } from "../../notifications/entities/notification.entity";
import { Report } from "../../reports/entities/report.entity";
import { Setting } from "../../settings/entities/setting.entity";

/* Tipos y enum para roles*/
export type Roles="admin"| "user"|"premium"
export enum RolesEnum{
  ADMIN="admin", 
  USER="user", 
  PREMIUM="premium"
}

/* Definición de la entidad User
*decorador que marca la clase como una entidad de base de datos
*/
@Entity() 
export class User {
  /*decorador que marca la propiedad como clave primaria
  * id: llave primaria de la entidad
  */     
  @PrimaryGeneratedColumn() 
  id: number;

  /*decorador que marca la propiedad como columna de la tabla
  *nombre del usuario
  */
  @Column({ nullable: false }) 
  name: string;

  /*decorador que marca la propiedad como columna de la tabla
  *correo del usuario
  */
  @Column({ unique: true, nullable: false })
  email: string;

  /*decorador que marca la propiedad como columna de la tabla
  *contraseña del usuario
  */
  @Column({ nullable: false })
  password: string;

  /*decorador que marca la propiedad como columna de la tabla
  *rol del usuario
  */
  @Column({ nullable: false, default: 'user' })
  role:Roles;

  /*decorador que marca la propiedad como columna de la tabla
  *booleano que indica si el usuario estpa activo o no
  */
  @Column({nullable:false, default:true})
  isActive:boolean;

   /* Relación con transacciones*/
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

   /*  Relación con presupuestos*/
  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];

   /* Relación con reportes*/
  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

   /* Relación con ajustes*/
  @OneToMany(() => Setting, (setting) => setting.user)
  settings: Setting[];

   /* Relación con notificaciones*/
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

}


