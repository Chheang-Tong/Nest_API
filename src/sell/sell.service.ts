// src/sell/sell.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../cart/entities/cart-item.entities';
import { Sell } from './entities';
import { Product } from '../product/entities';
import { randomUUID } from 'crypto';
import { PromotionService } from '../promotion/promotion.service'; // 👈 NEW

@Injectable()
export class SellService {
  constructor(
    @InjectRepository(Sell)
    private readonly sellRepo: Repository<Sell>,

    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    private readonly promoService: PromotionService, // 👈 inject promotion
  ) {}

  async checkout(
    cartUuid: string,
    promotionCode?: string,
  ): Promise<{
    sellUuid: string;
    newCartUuid: string;
  }> {
    const items = await this.cartRepo.find({
      where: { cartUuid },
      relations: ['user', 'product'],
    });

    if (items.length === 0) {
      throw new NotFoundException('Cart not found');
    }

    const user = items[0].user;

    // 1) validate stock
    for (const item of items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
        );
      }
    }

    // 2) base total
    const total = items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    // 3) apply promotion from DB
    const { promotion, discountDollar, discountPercent, finalTotal } =
      await this.promoService.applyPromotion(total, promotionCode);

    // 4) create Sell record
    const sell = this.sellRepo.create({
      user,
      cartUuid,
      total,
      promotionCode: promotion?.code ?? null,
      discountDollar,
      discountPercent,
      finalTotal,
    });

    const saved = await this.sellRepo.save(sell);

    // 5) decrease stock
    for (const item of items) {
      const product = item.product;
      product.stock -= item.quantity;
    }
    await this.productRepo.save(items.map((i) => i.product));

    // ⚠ we keep cart items so report can read them
    const newCartUuid = randomUUID();

    return {
      sellUuid: saved.id,
      newCartUuid,
    };
  }

  // report by sell UUID (now includes promotion info)
  async getSellReport(sellUuid: string) {
    const sell = await this.sellRepo.findOne({
      where: { id: sellUuid },
      relations: ['user'],
    });
    if (!sell) throw new NotFoundException('Sell not found');

    const items = await this.cartRepo.find({
      where: { cartUuid: sell.cartUuid },
      relations: ['product'],
    });

    return {
      sell_uuid: sell.id,
      cart_uuid: sell.cartUuid,
      user_id: sell.user.id,
      user_name: sell.user.name,
      total: Number(sell.total),
      promotion_code: sell.promotionCode,
      discount_dollar: Number(sell.discountDollar ?? 0),
      discount_percent: Number(sell.discountPercent ?? 0),
      final_total: Number(sell.finalTotal ?? sell.total),
      createdAt: sell.createdAt,
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: Number(i.product.price),
        quantity: i.quantity,
        lineTotal: Number(i.product.price) * i.quantity,
      })),
    };
  }
}
