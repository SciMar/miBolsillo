// en este archivo se configura la conexión a la base de datos utilizando TypeORM y las variables de entorno definidas en el archivo .env
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './src/modules/users/entities/user.entity';
import { Transaction } from './src/modules/transactions/entities/transaction.entity';



dotenv.config()

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Transaction ],
    migrations: ['./src/migrations/*.ts']
});