import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../cart/entities/cart-item.entities';
import { SellService } from './sell.service';
import { SellController } from './sell.controller';
import { Sell } from './entities';
import { Product } from '../product/entities';
import { PromotionModule } from '../promotion/promotion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sell, CartItem, Product]),
    PromotionModule,
  ],
  controllers: [SellController],
  providers: [SellService],
  exports: [SellService],
})
export class SellModule {}
