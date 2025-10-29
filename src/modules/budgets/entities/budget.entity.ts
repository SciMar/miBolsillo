import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity({ name: 'budgets' })
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  // MySQL devuelve decimal como string; convertimos a number al responder
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'datetime', nullable: true })
  startDate: Date | null;

  @Column({ type: 'datetime', nullable: true })
  endDate: Date | null;

  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('int')
  userId: number;

  @Column('int', { nullable: true })
  categoryId?: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // budget.entity.ts
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  remainingAmount: number;

  //Relación con categorías
  @OneToMany(() => Category, category => category.budget)
  categories: Category[];
}