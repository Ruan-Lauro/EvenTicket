export type PaymentMethod =
  | "PIX"
  | "CREDIT_CARD"
  | "DEBIT_CARD";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface Payment {
  id: number;
  purchaseId: number;
  method: PaymentMethod;
  value: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface PaymentInitiateData {
  method: PaymentMethod;
}

export interface PaymentApiError {
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}