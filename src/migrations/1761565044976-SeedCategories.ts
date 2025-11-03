import { MigrationInterface, QueryRunner } from "typeorm";

/*Inserciones tabla:
*Categories
*/
export class SeedCategories1730023456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO categories (name, type)
      VALUES
        ('Alimentación', 'expense'),
        ('Transporte', 'expense'),
        ('Servicios', 'expense'),
        ('Salud', 'expense'),
        ('Educación', 'expense'),
        ('Entretenimiento', 'expense'),
        ('Ropa', 'expense'),
        ('Otros Gastos', 'expense'),
        ('Salario', 'income'),
        ('Freelance', 'income'),
        ('Inversiones', 'income'),
        ('Regalos', 'income')
      ON DUPLICATE KEY UPDATE name = VALUES(name);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM categories
      WHERE name IN (
        'Alimentación', 'Transporte', 'Servicios', 'Salud',
        'Educación', 'Entretenimiento', 'Ropa', 'Otros Gastos',
        'Salario', 'Freelance', 'Inversiones', 'Regalos'
      );
    `);
  }
}
