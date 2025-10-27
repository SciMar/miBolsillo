import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string; // Ej: "mensual", "anual", "categoria"

  @Column({ type: 'json', nullable: true })
  filters: any;

  @ManyToOne(() => User, (user) => user.reports)
  user: User;
}