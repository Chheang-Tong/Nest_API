import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities';
import { CartItem } from '../cart/entities/cart-item.entities';
import { Sell } from '../sell/entities';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, CartItem, Sell])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
