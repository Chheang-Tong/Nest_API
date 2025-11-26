import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddToCartDto, CartItemResponseDto, UpdateCartItemDto } from './dto';
import { CartItem } from './entities';
import { User } from '../users/entities';
import { Product } from '../product/entities';
import { CartSummaryDto } from './dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  // 🔹 helper: get user entity
  private async getUser(userId: number): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // 🔹 helper: get product entity
  private async getProduct(productId: number): Promise<Product> {
    const product = await this.productsRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  startCart() {
    const cartUuid = randomUUID();
    return { uuid: cartUuid };
  }

  // src/cart/cart.service.ts
  async addToCart(userId: number, cartUuid: string, dto: AddToCartDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productsRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    let item = await this.cartRepo.findOne({
      where: {
        cartUuid,
        user: { id: userId },
        product: { id: product.id },
      },
    });

    if (item) {
      item.quantity += dto.quantity;
    } else {
      item = this.cartRepo.create({
        cartUuid,
        user,
        product,
        quantity: dto.quantity,
      });
    }

    await this.cartRepo.save(item);

    return this.getCartByUuid(cartUuid);
  }

  async getCartByUuid(cartUuid: string) {
    const items = await this.cartRepo.find({
      where: { cartUuid },
      order: { createdAt: 'DESC' },
      relations: ['product', 'user'],
    });

    if (items.length === 0) {
      throw new NotFoundException('Cart not found');
    }

    const user = items[0].user; // all same user for this cartUuid

    const itemDtos: CartItemResponseDto[] = items.map((item) => {
      const priceNumber = Number(item.product.price);

      return {
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        image: item.product.image ?? null,
        price: priceNumber,
        quantity: item.quantity,
        lineTotal: priceNumber * item.quantity,
      };
    });

    const cart_quantity = itemDtos.reduce((sum, i) => sum + i.quantity, 0);
    const cart_total = itemDtos.reduce((sum, i) => sum + i.lineTotal, 0);

    const summary: CartSummaryDto = {
      cart_quantity,
      cart_total,
      user_id: user.id,
      user_name: user.name,
      promotion_code: 'SUMMER21',
      coupon: '10% OFF or 10$',
      discount_dollar: 0,
      discount_percent: 0,
      final_total: cart_total,
    };

    return {
      uuid: cartUuid,
      items: itemDtos,
      summary,
    };
  }

  async getCart(userId: number): Promise<{
    uuid: string;
    items: CartItemResponseDto[];
    summary: CartSummaryDto;
  }> {
    // load items with product (and user if you want)
    const items = await this.cartRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['product'], // user is already known from userId
    });

    // map to item DTOs
    const itemDtos: CartItemResponseDto[] = items.map((item) => {
      const priceNumber = Number(item.product.price);

      return {
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        image: item.product.image ?? null,
        price: priceNumber,
        quantity: item.quantity,
        lineTotal: priceNumber * item.quantity,
      };
    });

    // totals
    const cart_quantity = itemDtos.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const cart_total = itemDtos.reduce((sum, item) => sum + item.lineTotal, 0);

    // get user for user_name
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const uuid = randomUUID();

    const summary: CartSummaryDto = {
      cart_quantity,
      cart_total,
      user_id: userId,
      user_name: user.name,
      promotion_code: '',
      coupon: '',
      discount_dollar: 0,
      discount_percent: 0,
      final_total: cart_total,
    };

    return {
      uuid,
      items: itemDtos,
      summary,
    };
  }

  async updateItem(
    userId: number,
    cartUuid: string,
    itemId: number,
    dto: UpdateCartItemDto,
  ) {
    const item = await this.cartRepo.findOne({
      where: {
        id: itemId,
        cartUuid,
        user: { id: userId },
      },
      relations: ['product', 'user'],
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = dto.quantity;
    const saved = await this.cartRepo.save(item);
    return saved;
  }

  async updateItemByProduct(
    userId: number,
    cartUuid: string,
    productId: number,
    dto: UpdateCartItemDto,
  ) {
    const item = await this.cartRepo.findOne({
      where: {
        cartUuid,
        user: { id: userId },
        product: { id: productId },
      },
      relations: ['product', 'user'],
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = dto.quantity;
    await this.cartRepo.save(item);
    return this.getCartByUuid(cartUuid);
  }

  async removeItemByProduct(
    userId: number,
    cartUuid: string,
    productId: number,
  ) {
    const item = await this.cartRepo.findOne({
      where: {
        cartUuid,
        user: { id: userId },
        product: { id: productId },
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepo.remove(item);
    return { success: true };
  }

  async removeItem(userId: number, cartUuid: string, itemId: number) {
    const item = await this.cartRepo.findOne({
      where: {
        id: itemId,
        cartUuid,
        user: { id: userId },
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepo.remove(item);
    return { success: true };
  }

  // 🔹 Clear entire cart
  async clearCart(userId: number): Promise<{ message: string }> {
    await this.cartRepo.delete({ user: { id: userId } });
    return { message: 'Cart cleared' };
  }
}
