import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepo: WalletRepository, private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const balance = await this.walletRepo.getUserBalance(userId);
    return { balance: balance.toNumber() };
  }

  async transfer(fromId: string, toId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    if (fromId === toId) {
      throw new BadRequestException('Cannot send money to yourself');
    }

    const amountDecimal = new Prisma.Decimal(amount);

      return this.prisma.$transaction(async (tx) => {
      const sender = await this.walletRepo.findUserByIdSelectBalance(fromId);
      if (!sender) {
        throw new NotFoundException('Sender not found');
      }

      if (sender.balance.lt(amountDecimal)) {
        throw new BadRequestException('Insufficient funds');
      }

      const receiverExists = await this.walletRepo.userExists(toId);
      if (!receiverExists) {
        throw new NotFoundException('Recipient not found');
      }

      await this.walletRepo.lockUserBalanceForUpdate(tx, fromId);

      await this.walletRepo.debitUser(tx, fromId, amountDecimal);
      await this.walletRepo.creditUser(tx, toId, amountDecimal);

      await this.walletRepo.createTransaction(tx, {
        amount,
        senderId: fromId,
        receiverId: toId,
      });

      return {
        message: 'Transfer successful',
        amount,
        newBalance: (sender.balance.toNumber() - amount).toFixed(2),
      };
    });
  }
}