import { AppError } from "../errors/appError.ts";
import { Decimal } from "@prisma/client/runtime/client";
import type { IShoppingCartItem } from "../interfaces/shoppingCartItemInterface.ts";
import type { IShoppingCartItemRepository } from "../interfaces/shoppingCartItemRepositoryInterface.ts";
import type { IShoppingCartRepository } from "../interfaces/shoppingCartRepositoryInterface.ts";
import type { ISeatRepository } from "../interfaces/seatRepositoryInterface.ts";

export class ShoppingCartItemService {

    private readonly cartItemRepo: IShoppingCartItemRepository;
    private readonly cartRepo: IShoppingCartRepository;
    private readonly seatRepo: ISeatRepository;

    constructor(
        cartItemRepo: IShoppingCartItemRepository,
        cartRepo: IShoppingCartRepository,
        seatRepo: ISeatRepository,
    ) {
        this.cartItemRepo = cartItemRepo;
        this.cartRepo = cartRepo;
        this.seatRepo = seatRepo;
    }

    async addItem(userId: number, seatId: number): Promise<IShoppingCartItem> {
        const seat = await this.seatRepo.getSeatById(seatId);
        if (!seat) throw new AppError("Assento não encontrado", 404);
        if (seat.status !== "AVAILABLE") throw new AppError("Assento indisponível", 409);
        let cart = await this.cartRepo.findByUserId(userId);
        if (!cart) {
            cart = await this.cartRepo.create({
                userId,
                total: new Decimal(0),
                status: "ACTIVE",
            });
        }

        const duplicate = await this.cartItemRepo.findBySeatAndCart(seatId, cart.id);
        if (duplicate) throw new AppError("Assento já adicionado ao carrinho", 409);

        const publication = await this.seatRepo.findPublicationBySeatId(seatId);
        if (!publication) throw new AppError("Publicação do assento não encontrada", 404);

        const item = await this.cartItemRepo.create(cart.id, {
            seatId,
            value: publication.price,
        });

        const newTotal = new Decimal(cart.total).add(publication.price);
        await this.cartRepo.update(cart.id, { total: newTotal });

        return item;
    }

    async removeItem(userId: number, itemId: number): Promise<void> {
        const item = await this.cartItemRepo.findById(itemId);
        if (!item) throw new AppError("Item não encontrado", 404);

        const cart = await this.cartRepo.findById(item.shoppingCartId);
        if (!cart || cart.userId !== userId) {
            throw new AppError("Acesso negado", 403);
        }
        if (cart.status !== "ACTIVE") {
            throw new AppError("Não é possível remover itens de um carrinho finalizado", 400);
        }

        const newTotal = new Decimal(cart.total).sub(item.value);
        await this.cartRepo.update(cart.id, { total: newTotal });

        await this.cartItemRepo.delete(itemId);
    }

    async listByCart(userId: number): Promise<IShoppingCartItem[]> {
        const cart = await this.cartRepo.findByUserId(userId);
        if (!cart) throw new AppError("Nenhum carrinho ativo encontrado", 404);
        return this.cartItemRepo.findByCartId(cart.id);
    }
}