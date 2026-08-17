import type { IPayment, IPaymentCreate } from "./paymentInterface.ts";

export interface IPaymentRepository {
    create(payment: IPaymentCreate): Promise<IPayment>;
    findById(id: number): Promise<IPayment | null>;
    findByPurchaseId(purchaseId: number): Promise<IPayment | null>;
    updateStatus(id: number, status: IPayment["status"]): Promise<IPayment>;
}