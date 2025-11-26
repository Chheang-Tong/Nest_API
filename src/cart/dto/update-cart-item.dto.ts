import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'ID of the product to update in the cart',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  quantity: number;
}
