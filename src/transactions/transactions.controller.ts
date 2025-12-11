import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Public()
  @Get('stats')
  async getStats() {
    return this.transactionsService.getLast24hVolume();
  }
}