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

  // 🔹 Add / increase cart item
  async addToCart(userId: number, dto: AddToCartDto): Promise<CartItem> {
    const user = await this.getUser(userId);
    const product = await this.getProduct(dto.productId);

    let item = await this.cartRepo.findOne({
      where: { user: { id: user.id }, product: { id: product.id } },
    });

    if (item) {
      // already in cart → increase quantity
      item.quantity += dto.quantity;
    } else {
      // create new cart item
      item = this.cartRepo.create({
        user,
        product,
        quantity: dto.quantity,
      });
    }

    return this.cartRepo.save(item);
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

  // 🔹 Update quantity of one cart item
  async updateItem(
    userId: number,
    itemId: number,
    dto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const item = await this.cartRepo.findOne({
      where: { id: itemId, user: { id: userId } },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = dto.quantity;
    return this.cartRepo.save(item);
  }

  // 🔹 Remove one item from cart
  async removeItem(
    userId: number,
    itemId: number,
  ): Promise<{ message: string }> {
    const result = await this.cartRepo.delete({
      id: itemId,
      user: { id: userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Cart item not found');
    }

    return { message: 'Cart item removed' };
  }

  // 🔹 Clear entire cart
  async clearCart(userId: number): Promise<{ message: string }> {
    await this.cartRepo.delete({ user: { id: userId } });
    return { message: 'Cart cleared' };
  }
}
