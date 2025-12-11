import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(private readonly transactionsRepo: TransactionsRepository) {}

  async getLast24hVolume() {
    const totalTransactionsIn24h = await this.transactionsRepo.getTotalIn24h();

    return {
      totalTransactionsIn24h,
    };
  }
}
