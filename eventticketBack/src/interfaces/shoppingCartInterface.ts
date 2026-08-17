import type { Decimal } from "@prisma/client/runtime/client";

export interface IShoppingCart {
    id: number;
    userId: number;
    total: Decimal;
    status: "ACTIVE" | "CHECKED_OUT" | "ABANDONED";
    createdAt: Date;
    updatedAt: Date;
}

export interface IShoppingCartCreate {
    userId: number;
    total: Decimal;
    status: "ACTIVE" | "CHECKED_OUT" | "ABANDONED";
}
