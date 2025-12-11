import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { PrismaService } from './common/prisma.service';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [AuthModule, WalletModule, TransactionsModule],
  providers: [PrismaService],
})
export class AppModule {}