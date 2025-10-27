import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateAdminUser1730000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1️⃣ Verifica si ya existe un admin
    const existingAdmin = await queryRunner.query(`
      SELECT * FROM user WHERE email = 'admin@example.com' LIMIT 1
    `);

    if (existingAdmin.length > 0) {
      console.log('⚠️ El usuario administrador ya existe, saltando migración...');
      return;
    }

    // 2️⃣ Hashea la contraseña
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // 3️⃣ Inserta el usuario administrador
    await queryRunner.query(`
      INSERT INTO user (name, email, password, role, isActive)
      VALUES (?, ?, ?, ?, ?)
    `, ['ADMINISTRADOR', 'admin@example.com', hashedPassword, 'admin', true]);

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Contraseña: Admin123!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revierte la migración eliminando el admin
    await queryRunner.query(`
      DELETE FROM user WHERE email = 'admin@example.com'
    `);

    console.log('❌ Usuario administrador eliminado');
  }
}