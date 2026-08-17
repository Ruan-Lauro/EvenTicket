import { ShoppingCartItem } from "./shoppingCartItem";

export interface Purchase {
  id: number;
  shoppingCartId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseDetails extends Purchase {
  items: ShoppingCartItem[];
  totalPaid: string;
}


export interface PurchaseApiError {
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}