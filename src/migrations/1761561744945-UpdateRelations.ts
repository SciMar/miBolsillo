import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRelations1761561744945 implements MigrationInterface {
    name = 'UpdateRelations1761561744945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_13e8b2a21988bec6fdcbb1fa741\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`budgets\` ADD \`remainingAmount\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budgets\` DROP COLUMN \`remainingAmount\``);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_13e8b2a21988bec6fdcbb1fa741\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
