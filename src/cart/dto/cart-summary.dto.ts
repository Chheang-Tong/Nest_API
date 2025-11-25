export class CartSummaryDto {
  cart_quantity: number;
  cart_total: number;
  user_id: number;
  user_name: string;
  promotion_code: string;
  coupon: string;
  discount_dollar: number;
  discount_percent: number;
  final_total: number;
}
