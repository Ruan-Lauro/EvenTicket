// repositories/paymentRepository.ts
import { prisma } from "../config/database.ts";
import type { IPayment, IPaymentCreate } from "../interfaces/paymentInterface.ts";
import type { IPaymentRepository } from "../interfaces/paymentRepositoryInterface.ts";

export class PaymentRepository implements IPaymentRepository {

    async create(payment: IPaymentCreate): Promise<IPayment> {
        return prisma.payment.create({ 
            data: payment 
        });
    }

    async findById(id: number): Promise<IPayment | null> {
        return prisma.payment.findUnique({ 
            where: { id } 
        });
    }

    async findByPurchaseId(purchaseId: number): Promise<IPayment | null> {
        return prisma.payment.findUnique({ 
            where: { purchaseId }
         });
    }

    async updateStatus(id: number, status: IPayment["status"]): Promise<IPayment> {
        return prisma.payment.update({
            where: { id },
            data: { status },
        });
    }
}