import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService, TransactionsRepository],
})
export class TransactionsModule {}