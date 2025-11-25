import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // 🔹 Add to cart: POST /cart/:userId/add
  //    (later: use userId from JWT instead of param)
  @Post(':userId/add')
  addToCart(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, dto);
  }

  // 🔹 Get user's cart: GET /cart/:userId
  @Get(':userId')
  getCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.getCart(userId);
  }

  // 🔹 Update quantity: PATCH /cart/:userId/item/:itemId
  @Patch(':userId/item/:itemId')
  updateItem(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, itemId, dto);
  }

  // 🔹 Remove item: DELETE /cart/:userId/item/:itemId
  @Delete(':userId/item/:itemId')
  removeItem(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.cartService.removeItem(userId, itemId);
  }

  // 🔹 Clear cart: DELETE /cart/:userId/clear
  @Delete(':userId/clear')
  clearCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.clearCart(userId);
  }
}
