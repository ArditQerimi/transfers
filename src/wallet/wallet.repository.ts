import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WalletRepository {

  constructor(private readonly prisma: PrismaService) {}

  async findUserByIdSelectBalance(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true },
    });
  }

  async getUserBalance(userId: string): Promise<Prisma.Decimal> {
    const user = await this.findUserByIdSelectBalance(userId);
    return user ? user.balance : new Prisma.Decimal(0);
  }

  async lockUserBalanceForUpdate(tx: Prisma.TransactionClient, userId: string) {
    await tx.$executeRaw`
      SELECT balance FROM "users" WHERE id = ${userId} FOR UPDATE
    `;
  }

  async debitUser(tx: Prisma.TransactionClient, userId: string, amount: Prisma.Decimal | number) {
    return tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: amount } },
      select: { balance: true },
    });
  }

  async creditUser(tx: Prisma.TransactionClient, userId: string, amount: Prisma.Decimal | number) {
    return tx.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } },
      select: { balance: true },
    });
  }

  async createTransaction(
    tx: Prisma.TransactionClient,
    data: { amount: number; senderId: string; receiverId: string },
  ) {
    return tx.transaction.create({
      data: {
        amount: new Prisma.Decimal(data.amount),
        senderId: data.senderId,
        receiverId: data.receiverId,
      },
    });
  }

  async userExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    return !!user;
  }
}