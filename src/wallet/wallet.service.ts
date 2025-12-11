import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });
    return { balance: user?.balance ?? 0 };
  }

  async transfer(fromId: string, toId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    if (fromId === toId) throw new BadRequestException('Cannot send to self');

    return this.prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({
        where: { id: fromId },
        select: { id: true, balance: true },
      });


      if (
        !sender ||
        Number(sender.balance) < amount
      ) {
        throw new BadRequestException('Insufficient funds');
      }

      const receiver = await tx.user.findUnique({ where: { id: toId } });
      if (!receiver) throw new NotFoundException('Recipient not found');

      await tx.$executeRaw`SELECT balance FROM "users" WHERE id = ${fromId} FOR UPDATE`;

      await tx.user.update({
        where: { id: fromId },
        data: { balance: { decrement: amount } },
      });

      await tx.user.update({
        where: { id: toId },
        data: { balance: { increment: amount } },
      });

      await tx.transaction.create({
        data: { amount, senderId: fromId, receiverId: toId },
      });

      return { message: 'Transfer successful', amount };
    });
  }
}