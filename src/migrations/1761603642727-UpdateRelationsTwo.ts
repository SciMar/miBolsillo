import { MigrationInterface, QueryRunner } from "typeorm";
/* 
*Eliminación clave foranea, tabla presuspuestos
*/
export class UpdateRelationsTwo1761603642727 implements MigrationInterface {
    name = 'UpdateRelationsTwo1761603642727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budgets\` DROP FOREIGN KEY \`FK_3ece6e1292b7a86ba82145775a7\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budgets\` ADD CONSTRAINT \`FK_3ece6e1292b7a86ba82145775a7\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
