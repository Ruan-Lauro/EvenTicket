import { AppError } from "../errors/appError.ts";
import type { IPurchase, IPurchaseDetails } from "../interfaces/purchaseInterface.ts";
import type { IPurchaseRepository } from "../interfaces/purchaseRepositoryInterface.ts";
import type { IShoppingCartRepository } from "../interfaces/shoppingCartRepositoryInterface.ts";
import type { IShoppingCartItemRepository } from "../interfaces/shoppingCartItemRepositoryInterface.ts";
import type { ISeatRepository } from "../interfaces/seatRepositoryInterface.ts";

export class PurchaseService {

    private readonly purchaseRepo: IPurchaseRepository;
    private readonly cartRepo: IShoppingCartRepository;
    private readonly cartItemRepo: IShoppingCartItemRepository;
    private readonly seatRepo: ISeatRepository;

    constructor(
        purchaseRepo: IPurchaseRepository,
        cartRepo: IShoppingCartRepository,
        cartItemRepo: IShoppingCartItemRepository,
        seatRepo: ISeatRepository,
    ) {
        this.purchaseRepo = purchaseRepo;
        this.cartRepo = cartRepo;
        this.cartItemRepo = cartItemRepo;
        this.seatRepo = seatRepo;
    }

    async checkout(userId: number): Promise<IPurchaseDetails> {

        const cart = await this.cartRepo.findByUserId(userId);
        if (!cart) throw new AppError("Nenhum carrinho ativo encontrado", 404);

        const items = await this.cartItemRepo.findByCartId(cart.id);
        if (items.length === 0) throw new AppError("Carrinho está vazio", 400);

        const seatIds = items.map((item) => item.id);
        const seats = await this.seatRepo.getSeatsByIds(seatIds);

        for (const item of seats) {
            if (!item || item.status !== "AVAILABLE") {
                throw new AppError(
                    `Assento ${item.id} não está mais disponível`,
                    409,
                );
            }
        }

        await this.seatRepo.updateManyStatus(
            items.map((i) => i.seatId),
            "RESERVED",
        );

        await this.cartRepo.update(cart.id, { status: "CHECKED_OUT" });

        const purchase = await this.purchaseRepo.create({
            shoppingCartId: cart.id,
        });

        return {
            ...purchase,
            items,
            totalPaid: cart.total.toString(),
        };
    }

    async findById(id: number, userId: number): Promise<IPurchase> {
        const purchase = await this.purchaseRepo.findById(id);
        if (!purchase) throw new AppError("Compra não encontrada", 404);

        const cart = await this.cartRepo.findById(purchase.shoppingCartId);
        if (!cart || cart.userId !== userId) {
            throw new AppError("Acesso negado", 403);
        }

        return purchase;
    }
}