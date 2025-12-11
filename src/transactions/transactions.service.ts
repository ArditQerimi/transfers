import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getLast24hVolume() {
    const result = await this.prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      _sum: { amount: true },
    });
    console.log('24h Volume Result:', result);

    return {
      totalVolumeLast24h: result._sum.amount || 0,
      currency: 'USD',
      generatedAt: new Date().toISOString(),
    };
  }
}