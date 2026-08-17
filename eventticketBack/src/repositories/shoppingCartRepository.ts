import { prisma } from "../config/database.ts";
import type { IShoppingCart, IShoppingCartCreate } from "../interfaces/shoppingCartInterface.ts";
import type { IShoppingCartRepository } from "../interfaces/shoppingCartRepositoryInterface.ts";

export class ShoppingCartRepository implements IShoppingCartRepository {
    
    async findById(id: number): Promise<IShoppingCart | null> {
        return prisma.shoppingCart.findUnique({
            where: { id },
        });
    }

    async findByUserId(userId: number): Promise<IShoppingCart | null> {
        return prisma.shoppingCart.findFirst({
            where: {
                userId,
                status: "ACTIVE",
            },
        });
    }

    async update(id: number, shoppingCart: Partial<IShoppingCart>): Promise<IShoppingCart | null> {
        return prisma.shoppingCart.update({
            where: { id },
            data: shoppingCart,
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.shoppingCart.delete({
            where: { id },
        });
    }

    async create(shoppingCart: IShoppingCartCreate): Promise<IShoppingCart> {
        return prisma.shoppingCart.create({
            data: shoppingCart,
        });
    }
}