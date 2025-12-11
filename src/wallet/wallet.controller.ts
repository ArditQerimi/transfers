import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferDto {
  @IsString()
  toUserId: string;

  @IsNumber()
  @Type(() => Number) 
  amount: number;
}


@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.userId);
  }

  @Post('transfer')
  transfer(@Request() req, @Body() dto: TransferDto) {
    console.log('Transfer DTO received:', dto);
    return this.walletService.transfer(req.user.userId, dto.toUserId, dto.amount);
  }
}