export type ShoppingCartStatus =
  | "ACTIVE"
  | "CHECKED_OUT"
  | "ABANDONED";

export interface ShoppingCart {
  id: number;
  userId: number;
  total: number;
  status: ShoppingCartStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingCartCreateData {
  userId: number;
  total: number;
  status: ShoppingCartStatus;
}

export interface ShoppingCartUpdateData {
  total?: number;
  status?: ShoppingCartStatus;
}