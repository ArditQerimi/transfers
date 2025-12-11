import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PrismaService } from '../common/prisma.service';
import { WalletRepository } from './wallet.repository';

@Module({
  controllers: [WalletController],
  providers: [WalletService, PrismaService, WalletRepository],
})
export class WalletModule {}