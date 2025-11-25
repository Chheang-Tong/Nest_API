import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { GetUser } from '../auth/decorator';
import { JwtAuthGuard } from '../auth/guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // 1) Start new cart -> create uuid
  @UseGuards(JwtAuthGuard)
  @Post('start')
  startCart() {
    return this.cartService.startCart();
  }

  // 2) Add to cart: POST /cart/uuid/:cartUuid/add
  @UseGuards(JwtAuthGuard)
  @Post('uuid/:cartUuid/add')
  addToCart(
    @Param('cartUuid') cartUuid: string,
    @GetUser('id') userId: number,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, cartUuid, dto);
  }

  // 3) Get cart by uuid: GET /cart/uuid/:cartUuid
  @UseGuards(JwtAuthGuard)
  @Get('uuid/:cartUuid')
  getCart(@Param('cartUuid') cartUuid: string) {
    return this.cartService.getCartByUuid(cartUuid);
  }

  // 4) Update item: PATCH /cart/uuid/:cartUuid/item/:itemId
  @UseGuards(JwtAuthGuard)
  @Patch('uuid/:cartUuid/item/:itemId')
  updateItem(
    @Param('cartUuid') cartUuid: string,
    @Param('itemId', ParseIntPipe) itemId: number,
    @GetUser('id') userId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, cartUuid, itemId, dto);
  }

  // 4) Update item by productId: PATCH /cart/uuid/:cartUuid/product/:productId
  @UseGuards(JwtAuthGuard)
  @Patch('uuid/:cartUuid/product/:productId')
  updateItems(
    @Param('cartUuid') cartUuid: string,
    @Param('productId', ParseIntPipe) productId: number,
    @GetUser('id') userId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemByProduct(
      userId,
      cartUuid,
      productId,
      dto,
    );
  }

  // 5) Remove item: DELETE /cart/uuid/:cartUuid/item/:itemId
  @UseGuards(JwtAuthGuard)
  @Delete('uuid/:cartUuid/item/:itemId')
  removeItem(
    @Param('cartUuid') cartUuid: string,
    @Param('itemId', ParseIntPipe) itemId: number,
    @GetUser('id') userId: number,
  ) {
    return this.cartService.removeItem(userId, cartUuid, itemId);
  }

  // 5) Remove item by productId: DELETE /cart/uuid/:cartUuid/product/:productId
  @UseGuards(JwtAuthGuard)
  @Delete('uuid/:cartUuid/product/:productId')
  removeItems(
    @Param('cartUuid') cartUuid: string,
    @Param('productId', ParseIntPipe) productId: number,
    @GetUser('id') userId: number,
  ) {
    return this.cartService.removeItemByProduct(userId, cartUuid, productId);
  }

  // 6) Clear cart by user (optional; still uses userId)
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/clear')
  clearCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.clearCart(userId);
  }
}
