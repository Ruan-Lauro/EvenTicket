import { prisma } from "../config/database.ts";
import type { IShoppingCartItem, IShoppingCartItemCreate } from "../interfaces/shoppingCartItemInterface.ts";
import type { IShoppingCartItemRepository } from "../interfaces/shoppingCartItemRepositoryInterface.ts";

export class ShoppingCartItemRepository implements IShoppingCartItemRepository {

    async create(shoppingCartId: number, item: IShoppingCartItemCreate): Promise<IShoppingCartItem> {
        return prisma.shoppingCartItem.create({
            data: {
                shoppingCartId,
                seatId: item.seatId,
                value: item.value,
            },
        });
    }

    async findById(id: number): Promise<IShoppingCartItem | null> {
        return prisma.shoppingCartItem.findUnique({
            where: { id },
        });
    }

    async findByCartId(shoppingCartId: number): Promise<IShoppingCartItem[]> {
        return prisma.shoppingCartItem.findMany({
            where: { shoppingCartId },
        });
    }

    async findBySeatAndCart(seatId: number, shoppingCartId: number): Promise<IShoppingCartItem | null> {
        return prisma.shoppingCartItem.findUnique({
            where: {
                shoppingCartId_seatId: { shoppingCartId, seatId },
            },
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.shoppingCartItem.delete({ where: { id } });
    }

    async deleteAllByCartId(shoppingCartId: number): Promise<void> {
        await prisma.shoppingCartItem.deleteMany({ where: { shoppingCartId } });
    }
}