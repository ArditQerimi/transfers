import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class TransactionsRepository {
  constructor(private prisma: PrismaService) {}

  async getTotalIn24h(): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ? result._sum.amount.toNumber() : 0;
  }
}
