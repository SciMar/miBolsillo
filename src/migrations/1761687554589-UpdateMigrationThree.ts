import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMigrationThree1761687554589 implements MigrationInterface {
    name = 'UpdateMigrationThree1761687554589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`FK_3ece6e1292b7a86ba82145775a7\` ON \`budgets\``);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD \`budgetId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_e6d5be2f8c1fbd283150e043a08\` FOREIGN KEY (\`budgetId\`) REFERENCES \`budgets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_e6d5be2f8c1fbd283150e043a08\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP COLUMN \`budgetId\``);
        await queryRunner.query(`CREATE INDEX \`FK_3ece6e1292b7a86ba82145775a7\` ON \`budgets\` (\`categoryId\`)`);
    }

}
