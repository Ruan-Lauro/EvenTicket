import type { IShoppingCartItem, IShoppingCartItemCreate } from "./shoppingCartItemInterface.ts";

export interface IShoppingCartItemRepository {
    create(shoppingCartId: number, item: IShoppingCartItemCreate): Promise<IShoppingCartItem>;
    findById(id: number): Promise<IShoppingCartItem | null>;
    findByCartId(shoppingCartId: number): Promise<IShoppingCartItem[]>;
    findBySeatAndCart(seatId: number, shoppingCartId: number): Promise<IShoppingCartItem | null>;
    delete(id: number): Promise<void>;
    deleteAllByCartId(shoppingCartId: number): Promise<void>;
}