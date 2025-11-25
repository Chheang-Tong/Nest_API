import { Controller, Param, Post, Get } from '@nestjs/common';
import { SellService } from './sell.service';

// src/sell/sell.controller.ts
@Controller('sell')
export class SellController {
  constructor(private readonly sellService: SellService) {}

  @Post('checkout/:cartUuid')
  checkout(@Param('cartUuid') cartUuid: string) {
    return this.sellService.checkout(cartUuid);
  }

  @Get(':sellUuid')
  getReport(@Param('sellUuid') sellUuid: string) {
    return this.sellService.getSellReport(sellUuid);
  }
}
