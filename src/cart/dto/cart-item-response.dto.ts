import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty({ example: 1, description: 'Cart item ID' })
  id: number;
  @ApiProperty({ example: 101, description: 'Product ID' })
  productId: number;
  @ApiProperty({ example: 'Sample Product', description: 'Product name' })
  name: string;
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Product image URL',
    nullable: true,
  })
  image: string | null;
  @ApiProperty({ example: 19.99, description: 'Unit price of the product' })
  price: number;
  @ApiProperty({
    example: 2,
    description: 'Quantity of the product in the cart',
  })
  quantity: number;
  @ApiProperty({
    example: 39.98,
    description: 'Total price for this line item (price * quantity)',
  })
  lineTotal: number;
}
