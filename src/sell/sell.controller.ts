import { Controller, Param, Post, Get, UseGuards, Body } from '@nestjs/common';
import { SellService } from './sell.service';
import { JwtAuthGuard } from '../auth/guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Sell')
@ApiBearerAuth()
@Controller('sell')
export class SellController {
  constructor(private readonly sellService: SellService) {}

  @ApiOperation({ summary: 'Checkout cart and create sell record' })
  @ApiParam({ name: 'cartUuid', description: 'UUID of the cart to checkout' })
  @ApiBody({
    type: Object,
    description: 'Optional promotion code',
    required: false,
  })
  @UseGuards(JwtAuthGuard)
  @Post('checkout/:cartUuid')
  checkout(
    @Param('cartUuid') cartUuid: string,
    @Body('promotionCode') promotionCode?: string,
  ) {
    return this.sellService.checkout(cartUuid, promotionCode);
  }

  @ApiOperation({ summary: 'Get sell report by sell UUID' })
  @ApiParam({ name: 'sellUuid', description: 'UUID of the sell record' })
  @UseGuards(JwtAuthGuard)
  @Get(':sellUuid')
  getReport(@Param('sellUuid') sellUuid: string) {
    return this.sellService.getSellReport(sellUuid);
  }
}
