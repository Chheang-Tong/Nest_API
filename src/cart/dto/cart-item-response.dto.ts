export class CartItemResponseDto {
  id: number;
  productId: number;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}
