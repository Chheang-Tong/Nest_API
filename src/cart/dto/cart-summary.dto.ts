import { ApiProperty } from '@nestjs/swagger';

export class CartSummaryDto {
  @ApiProperty({ example: 3, description: 'Total number of items in the cart' })
  cart_quantity: number;

  @ApiProperty({ example: 39, description: 'Total price before discount' })
  cart_total: number;

  @ApiProperty({ example: 6, description: 'User ID who owns the cart' })
  user_id: number;

  @ApiProperty({ example: 'Tong', description: 'User name' })
  user_name: string;

  @ApiProperty({ example: 'SUMMER21', nullable: true })
  promotion_code: string | null;

  @ApiProperty({
    example: '10% OFF or 10$',
    description: 'Human-readable coupon description',
    nullable: true,
  })
  coupon: string | null;

  @ApiProperty({
    example: 5,
    description: 'Discount applied in dollars',
  })
  discount_dollar: number;

  @ApiProperty({
    example: 10,
    description: 'Discount in percent',
  })
  discount_percent: number;

  @ApiProperty({
    example: 34,
    description: 'Final total after discount',
  })
  final_total: number;
}
