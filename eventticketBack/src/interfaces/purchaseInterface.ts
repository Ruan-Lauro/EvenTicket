import type { IShoppingCartItem } from "./shoppingCartItemInterface.ts";

export interface IPurchase {
    id: number;
    shoppingCartId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPurchaseCreate {
    shoppingCartId: number;
}


export interface IPurchaseDetails extends IPurchase {
    items: IShoppingCartItem[];
    totalPaid: string;
}