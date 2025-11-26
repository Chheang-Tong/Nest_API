/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Product } from '../product/entities';
import { CartItem } from '../cart/entities/cart-item.entities';
import { Sell } from '../sell/entities';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Sell)
    private readonly sellRepo: Repository<Sell>,
  ) {}

  /**
   * STOCK REPORT
   * GET /reports/stock
   * returns: [{ productId, name, price, stock, soldQty, revenue }]
   */
  async getStockReport() {
    // one query using queryBuilder (group by product)
    const rows = await this.productRepo
      .createQueryBuilder('p')
      .leftJoin('cart_items', 'ci', 'ci."productId" = p.id')
      .leftJoin('sells', 's', 's."cartUuid" = ci."cartUuid"')
      // only items that belong to a completed sell
      .select('p.id', 'productId')
      .addSelect('p.name', 'name')
      .addSelect('p.price', 'price')
      .addSelect('p.stock', 'stock')
      .addSelect('COALESCE(SUM(ci.quantity), 0)', 'soldQty')
      .addSelect('COALESCE(SUM(ci.quantity * p.price), 0)', 'revenue')
      .groupBy('p.id')
      .getRawMany<{
        productId: number;
        name: string;
        price: string;
        stock: number;
        soldQty: string;
        revenue: string;
      }>();

    return rows.map((r) => ({
      productId: r.productId,
      name: r.name,
      price: Number(r.price),
      stock: r.stock,
      soldQty: Number(r.soldQty),
      revenue: Number(r.revenue),
    }));
  }

  /**
   * SALES REPORT
   * GET /reports/sales?from=2025-11-01&to=2025-11-30
   */
  async getSalesReport(from?: string, to?: string) {
    const where: any = {};
    if (from && to) {
      where.createdAt = Between(new Date(from), new Date(to));
    } else if (from) {
      where.createdAt = Between(new Date(from), new Date());
    }

    const sells = await this.sellRepo.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    const ordersCount = sells.length;
    const grossTotal = sells.reduce((sum, s) => sum + Number(s.total), 0);
    const totalDiscountDollar = sells.reduce(
      (sum, s) => sum + Number(s.discountDollar ?? 0),
      0,
    );
    const finalTotal = sells.reduce(
      (sum, s) => sum + Number(s.finalTotal ?? s.total),
      0,
    );

    return {
      from: from ?? null,
      to: to ?? null,
      ordersCount,
      grossTotal,
      totalDiscountDollar,
      finalTotal,
      sells: sells.map((s) => ({
        sell_uuid: s.id,
        cart_uuid: s.cartUuid,
        user_id: s.user.id,
        user_name: s.user.name,
        total: Number(s.total),
        promotion_code: s.promotionCode,
        discount_dollar: Number(s.discountDollar ?? 0),
        discount_percent: Number(s.discountPercent ?? 0),
        final_total: Number(s.finalTotal ?? s.total),
        createdAt: s.createdAt,
      })),
    };
  }
}
