import type { IShoppingCart, IShoppingCartCreate } from "./shoppingCartInterface.ts";

export interface IShoppingCartRepository {
    create(shoppingCart: IShoppingCartCreate): Promise<IShoppingCart>;
    findById(id: number): Promise<IShoppingCart | null>;
    findByUserId(userId: number): Promise<IShoppingCart | null>;
    update(id: number, shoppingCart: Partial<IShoppingCart>): Promise<IShoppingCart | null>;
    delete(id: number): Promise<void>;
}