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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // 1) Start new cart -> create uuid
  @ApiOperation({ summary: 'Start a new cart and get cart UUID' })
  @Post('start')
  @UseGuards(JwtAuthGuard)
  startCart() {
    // returns: { uuid: string }
    return this.cartService.startCart();
  }

  // 2) Add to cart: POST /cart/uuid/:cartUuid/add
  @ApiOperation({ summary: 'Add product to cart by cart UUID' })
  @ApiParam({
    name: 'cartUuid',
    description: 'Cart UUID',
    example: '032b80a6-5dde-4659-8cde-2fc0e44f889f',
  })
  @ApiBody({ type: AddToCartDto })
  @Post('uuid/:cartUuid/add')
  @UseGuards(JwtAuthGuard)
  addToCart(
    @Param('cartUuid') cartUuid: string,
    @GetUser('id') userId: number,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, cartUuid, dto);
  }

  // 3) Get cart by uuid: GET /cart/uuid/:cartUuid
  @ApiOperation({ summary: 'Get cart details by cart UUID' })
  @ApiParam({
    name: 'cartUuid',
    description: 'Cart UUID',
    example: '032b80a6-5dde-4659-8cde-2fc0e44f889f',
  })
  @Get('uuid/:cartUuid')
  @UseGuards(JwtAuthGuard)
  getCart(@Param('cartUuid') cartUuid: string) {
    return this.cartService.getCartByUuid(cartUuid);
  }

  // 4) Update item: PATCH /cart/uuid/:cartUuid/item/:itemId
  @ApiOperation({ summary: 'Update cart item quantity by itemId' })
  @ApiParam({
    name: 'cartUuid',
    description: 'Cart UUID',
    example: '032b80a6-5dde-4659-8cde-2fc0e44f889f',
  })
  @ApiParam({ name: 'itemId', description: 'Cart item ID', example: 5 })
  @ApiBody({ type: UpdateCartItemDto })
  @Patch('uuid/:cartUuid/item/:itemId')
  @UseGuards(JwtAuthGuard)
  updateItem(
    @Param('cartUuid') cartUuid: string,
    @Param('itemId', ParseIntPipe) itemId: number,
    @GetUser('id') userId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, cartUuid, itemId, dto);
  }

  // 4b) Update item by productId: PATCH /cart/uuid/:cartUuid/product/:productId
  @ApiOperation({ summary: 'Update cart item quantity by productId' })
  @ApiParam({
    name: 'cartUuid',
    description: 'Cart UUID',
    example: '032b80a6-5dde-4659-8cde-2fc0e44f889f',
  })
  @ApiParam({ name: 'productId', description: 'Product ID', example: 2 })
  @ApiBody({ type: UpdateCartItemDto })
  @Patch('uuid/:cartUuid/product/:productId')
  @UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'Remove cart item by itemId' })
  @ApiParam({
    name: 'cartUuid',
    description: 'Cart UUID',
    example: '032b80a6-5dde-4659-8cde-2fc0e44f889f',
  })
  @ApiParam({ name: 'itemId', description: 'Cart item ID', example: 5 })
  @Delete('uuid/:cartUuid/item/:itemId')
  @UseGuards(JwtAuthGuard)
  removeItem(
    @Param('cartUuid') cartUuid: string,
    @Param('itemId', ParseIntPipe) itemId: number,
    @GetUser('id') userId: number,
  ) {
    return this.cartService.removeItem(userId, cartUuid, itemId);
  }

  // 5b) Remove item by productId: DELETE /cart/uuid/:cartUuid/product/:productId
  @ApiOperation({ summary: 'Remove cart item by productId' })
  @ApiParam({
    name: 'cartUuid',
    description: 'Cart UUID',
    example: '032b80a6-5dde-4659-8cde-2fc0e44f889f',
  })
  @ApiParam({ name: 'productId', description: 'Product ID', example: 2 })
  @Delete('uuid/:cartUuid/product/:productId')
  @UseGuards(JwtAuthGuard)
  removeItems(
    @Param('cartUuid') cartUuid: string,
    @Param('productId', ParseIntPipe) productId: number,
    @GetUser('id') userId: number,
  ) {
    return this.cartService.removeItemByProduct(userId, cartUuid, productId);
  }

  // 6) Clear cart by user
  @ApiOperation({ summary: 'Clear all items in user cart (by userId)' })
  @ApiParam({ name: 'userId', example: 1 })
  @Delete(':userId/clear')
  @UseGuards(JwtAuthGuard)
  clearCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.clearCart(userId);
  }
}
