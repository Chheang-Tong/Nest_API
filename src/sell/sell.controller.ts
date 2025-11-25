import { Controller, Param, Post, Get, UseGuards, Body } from '@nestjs/common';
import { SellService } from './sell.service';
import { JwtAuthGuard } from '../auth/guard';

// src/sell/sell.controller.ts
@Controller('sell')
export class SellController {
  constructor(private readonly sellService: SellService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout/:cartUuid')
  checkout(
    @Param('cartUuid') cartUuid: string,
    @Body('promotionCode') promotionCode?: string,
  ) {
    return this.sellService.checkout(cartUuid, promotionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':sellUuid')
  getReport(@Param('sellUuid') sellUuid: string) {
    return this.sellService.getSellReport(sellUuid);
  }
}
