export interface ShoppingCartItem {
  id: number;
  shoppingCartId: number;
  seatId: number;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingCartItemCreateData {
  seatId: number;
}