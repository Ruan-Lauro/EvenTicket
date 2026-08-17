import type { IPurchase, IPurchaseCreate } from "./purchaseInterface.ts";

export interface IPurchaseRepository {
    create(purchase: IPurchaseCreate): Promise<IPurchase>;
    findById(id: number): Promise<IPurchase | null>;
    findByCartId(shoppingCartId: number): Promise<IPurchase | null>;
}