import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
/**
 * Entidad Budget:
 * Representa los presupuestos creados por los usuarios.
 * Contiene información del monto, fechas, usuario asociado
 * y su relación con categorías.
 */
@Entity({ name: 'budgets' })
export class Budget {

  /** Identificador único del presupuesto. */
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre del presupuesto. */
  @Column({ length: 255 })
  name: string;

  /** Monto total asignado (almacenado como decimal). */
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  /** Fecha de inicio del presupuesto (opcional). */
  @Column({ type: 'datetime', nullable: true })
  startDate: Date | null;

  /** Fecha de finalización del presupuesto (opcional). */
  @Column({ type: 'datetime', nullable: true })
  endDate: Date | null;

  /** Usuario propietario del presupuesto. */
  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /** ID del usuario propietario. */
  @Column('int')
  userId: number;

  /** ID de la categoría asociada (opcional). */
  @Column('int', { nullable: true })
  categoryId?: number | null;

  /** Fecha de creación del registro. */
  @CreateDateColumn()
  createdAt: Date;

  /** Fecha de la última actualización del registro. */
  @UpdateDateColumn()
  updatedAt: Date;

  /** Monto restante del presupuesto disponible. */
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  remainingAmount: number;

  /** Relación con las categorías vinculadas al presupuesto. */
  @OneToMany(() => Category, category => category.budget)
  categories: Category[];
}