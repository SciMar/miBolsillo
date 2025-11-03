import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Budget } from '../budgets/entities/budget.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';


@Module({
  /*
  *Importación del TypeOrmModule: de transaction y budget
  * controlador, servicio y exportacion de transaction
  */
    imports: [TypeOrmModule.forFeature([Transaction, Budget])],
    controllers: [TransactionsController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})

export class TransactionsModule {}
