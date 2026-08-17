import { prisma } from "../config/database.ts";
import type { IPurchase, IPurchaseCreate } from "../interfaces/purchaseInterface.ts";
import type { IPurchaseRepository } from "../interfaces/purchaseRepositoryInterface.ts";

export class PurchaseRepository implements IPurchaseRepository {

    async create(purchase: IPurchaseCreate): Promise<IPurchase> {
        return prisma.purchase.create({ 
            data: purchase 
        });
    }

    async findById(id: number): Promise<IPurchase | null> {
        return prisma.purchase.findUnique({
            where: { id } 
        });
    }

    async findByCartId(shoppingCartId: number): Promise<IPurchase | null> {
        return prisma.purchase.findUnique({ 
            where: { shoppingCartId } 
        });
    }
}