import crypto from "node:crypto";
import { AppError } from "../errors/appError.ts";
import { Decimal } from "@prisma/client/runtime/client";
import type { IPayment } from "../interfaces/paymentInterface.ts";
import type { IPaymentRepository } from "../interfaces/paymentRepositoryInterface.ts";
import type { IPurchaseRepository } from "../interfaces/purchaseRepositoryInterface.ts";
import type { IShoppingCartRepository } from "../interfaces/shoppingCartRepositoryInterface.ts";
import type { IShoppingCartItemRepository } from "../interfaces/shoppingCartItemRepositoryInterface.ts";
import type { ITicketRepository } from "../interfaces/ticketRepositoryInterface.ts";
import type { ISeatRepository } from "../interfaces/seatRepositoryInterface.ts";

async function simulateGateway(
    method: IPayment["method"],
    value: Decimal,
): Promise<"PAID" | "FAILED"> {
    await new Promise((r) => setTimeout(r, 400)); 
    return Math.random() > 0.1 ? "PAID" : "FAILED";
}

export class PaymentService {

    private readonly paymentRepo: IPaymentRepository;
    private readonly purchaseRepo: IPurchaseRepository;
    private readonly cartRepo: IShoppingCartRepository;
    private readonly cartItemRepo: IShoppingCartItemRepository;
    private readonly ticketRepo: ITicketRepository;
    private readonly seatRepo: ISeatRepository;

    constructor(
        paymentRepo: IPaymentRepository,
        purchaseRepo: IPurchaseRepository,
        cartRepo: IShoppingCartRepository,
        cartItemRepo: IShoppingCartItemRepository,
        ticketRepo: ITicketRepository,
        seatRepo: ISeatRepository,
    ){
        this.paymentRepo = paymentRepo;
        this.purchaseRepo = purchaseRepo;
        this.cartRepo = cartRepo;
        this.cartItemRepo = cartItemRepo;
        this.ticketRepo = ticketRepo;
        this.seatRepo = seatRepo;
    }

    async initiate(
        purchaseId: number,
        method: IPayment["method"],
        userId: number,
    ): Promise<IPayment> {
        const purchase = await this.purchaseRepo.findById(purchaseId);
        if (!purchase) throw new AppError("Compra não encontrada", 404);

        const cart = await this.cartRepo.findById(purchase.shoppingCartId);
        if (!cart || cart.userId !== userId) throw new AppError("Acesso negado", 403);

        const existing = await this.paymentRepo.findByPurchaseId(purchaseId);
        if (existing) {
            if (existing.status === "PAID") throw new AppError("Compra já foi paga", 409);
            if (existing.status === "PENDING") throw new AppError("Pagamento já em andamento", 409);
        }

        const payment = await this.paymentRepo.create({
            purchaseId,
            method,
            value: cart.total,
        });

        const gatewayResult = await simulateGateway(method, cart.total);

        if (gatewayResult === "PAID") {
            return this.confirmPayment(payment.id, purchase, cart);
        } else {
            return this.failPayment(payment.id, purchase);
        }
    }

    private async confirmPayment(
        paymentId: number,
        purchase: { id: number; shoppingCartId: number },
        cart: { id: number; total: Decimal },
    ): Promise<IPayment> {
        const updatedPayment = await this.paymentRepo.updateStatus(paymentId, "PAID");

        const items = await this.cartItemRepo.findByCartId(cart.id);

        const ticketData = await Promise.all(
            items.map(async (item) => {
                const seat = await this.seatRepo.getSeatById(item.seatId);
                if (!seat) throw new AppError(`Assento ${item.seatId} não encontrado`, 404);
                const code = crypto.randomUUID();
                return {
                    purchaseId: purchase.id,
                    publicationId: seat.publicationId,
                    seatId: item.seatId,
                    code,
                    value: item.value,
                    type: "STANDARD",
                    shareLink: `/tickets/${code}`,
                };
            }),
        );

        await this.ticketRepo.createMany(ticketData);

        await this.seatRepo.updateManyStatus(
            items.map((i) => i.seatId),
            "SOLD",
        );

        return updatedPayment;
    }

    private async failPayment(
        paymentId: number,
        purchase: { id: number; shoppingCartId: number },
    ): Promise<IPayment> {
        const updatedPayment = await this.paymentRepo.updateStatus(paymentId, "FAILED");

        const cart = await this.cartRepo.findById(purchase.shoppingCartId);
        if (cart) {
            const items = await this.cartItemRepo.findByCartId(cart.id);
            await this.seatRepo.updateManyStatus(
                items.map((i) => i.seatId),
                "AVAILABLE",
            );

            await this.cartRepo.update(cart.id, { status: "ACTIVE" });
        }

        return updatedPayment;
    }

    async cancel(purchaseId: number, userId: number): Promise<{ message: string }> {
        const purchase = await this.purchaseRepo.findById(purchaseId);
        if (!purchase) throw new AppError("Compra não encontrada", 404);

        const cart = await this.cartRepo.findById(purchase.shoppingCartId);
        if (!cart || cart.userId !== userId) throw new AppError("Acesso negado", 403);

        const payment = await this.paymentRepo.findByPurchaseId(purchaseId);

        if (payment?.status === "PAID") {
            await this.paymentRepo.updateStatus(payment.id, "REFUNDED");
        }

        await this.ticketRepo.deleteByPurchaseId(purchaseId);

        const items = await this.cartItemRepo.findByCartId(cart.id);
        await this.seatRepo.updateManyStatus(
            items.map((i) => i.seatId),
            "AVAILABLE",
        );

        await this.cartRepo.update(cart.id, { status: "ACTIVE" });

        return { message: "Compra cancelada e estorno realizado com sucesso" };
    }

    async findByPurchaseId(purchaseId: number, userId: number): Promise<IPayment> {
        const purchase = await this.purchaseRepo.findById(purchaseId);
        if (!purchase) throw new AppError("Compra não encontrada", 404);

        const cart = await this.cartRepo.findById(purchase.shoppingCartId);
        if (!cart || cart.userId !== userId) throw new AppError("Acesso negado", 403);

        const payment = await this.paymentRepo.findByPurchaseId(purchaseId);
        if (!payment) throw new AppError("Pagamento não encontrado", 404);

        return payment;
    }
}