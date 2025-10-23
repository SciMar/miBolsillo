// en este archivo se configura la conexión a la base de datos utilizando TypeORM y las variables de entorno definidas en el archivo .env
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './src/modules/users/entities/user.entity';
import { Transaction } from './src/modules/transactions/entities/transaction.entity';
import { Category } from './src/modules/categories/entities/category.entity';
import { Budget } from './src/modules/budgets/entities/budget.entity';
import { Report } from './src/modules/reports/entities/report.entity';
import { Setting } from './src/modules/settings/entities/setting.entity';
import { Notification } from "./src/modules/notifications/entities/notification.entity";
 
dotenv.config()

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Budget, Category, Notification, Report, Setting, Transaction, User],
    migrations: ['./src/migrations/*.ts']
});