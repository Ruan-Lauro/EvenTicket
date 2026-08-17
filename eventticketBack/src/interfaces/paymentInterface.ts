import type { Decimal } from "@prisma/client/runtime/client";

export interface IPayment {
    id: number;
    purchaseId: number;
    method: "PIX" | "CREDIT_CARD" | "DEBIT_CARD";
    value: Decimal;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    createdAt: Date;
}

export interface IPaymentCreate {
    purchaseId: number;
    method: "PIX" | "CREDIT_CARD" | "DEBIT_CARD";
    value: Decimal;
}