import type { Decimal } from "@prisma/client/runtime/client";

export interface IShoppingCartItem {
    id: number;
    shoppingCartId: number;
    seatId: number;
    value: Decimal;
    createdAt: Date;
    updatedAt: Date;
}

export interface IShoppingCartItemCreate {
    seatId: number;
    value: Decimal;
}