import { AppError } from "../errors/appError.ts";
import type { ITicket } from "../interfaces/ticketInterface.ts";
import type { ITicketRepository } from "../interfaces/ticketRepositoryInterface.ts";
import type { IPurchaseRepository } from "../interfaces/purchaseRepositoryInterface.ts";
import type { IShoppingCartRepository } from "../interfaces/shoppingCartRepositoryInterface.ts";

export class TicketService {

    private readonly ticketRepo: ITicketRepository;
    private readonly purchaseRepo: IPurchaseRepository;
    private readonly cartRepo: IShoppingCartRepository;

    constructor(
        ticketRepo: ITicketRepository,
        purchaseRepo: IPurchaseRepository,
        cartRepo: IShoppingCartRepository,
    ) {
        this.ticketRepo = ticketRepo;
        this.purchaseRepo = purchaseRepo;
        this.cartRepo = cartRepo;
    }

    async findByPurchaseId(purchaseId: number, userId: number): Promise<ITicket[]> {
        const purchase = await this.purchaseRepo.findById(purchaseId);
        if (!purchase) throw new AppError("Compra não encontrada", 404);

        const cart = await this.cartRepo.findById(purchase.shoppingCartId);
        if (!cart || cart.userId !== userId) throw new AppError("Acesso negado", 403);

        return this.ticketRepo.findByPurchaseId(purchaseId);
    }

    async findById(id: number, userId: number): Promise<ITicket> {
        const ticket = await this.ticketRepo.findById(id);
        if (!ticket) throw new AppError("Ticket não encontrado", 404);

        const purchase = await this.purchaseRepo.findById(ticket.purchaseId);
        if (!purchase) throw new AppError("Compra não encontrada", 404);

        const cart = await this.cartRepo.findById(purchase.shoppingCartId);
        if (!cart || cart.userId !== userId) throw new AppError("Acesso negado", 403);

        return ticket;
    }

    async findByUserId(userId: number): Promise<ITicket[]> {
        const tickets = await this.ticketRepo.findByUserId(userId);
        return tickets;
    }

    async validate(code: string): Promise<{ ticket: ITicket; message: string }> {
        const ticket = await this.ticketRepo.findByCode(code);
        if (!ticket) throw new AppError("Ticket inválido", 404);

        if (ticket.usedAt) {
            throw new AppError(
                `Ticket já utilizado em ${ticket.usedAt.toLocaleString("pt-BR")}`,
                409,
            );
        }

        const updated = await this.ticketRepo.markAsUsed(ticket.id);
        return { ticket: updated, message: "Check-in realizado com sucesso" };
    }

    async findByCode(code: string): Promise<ITicket> {
        const ticket = await this.ticketRepo.findByCode(code);
        if (!ticket) throw new AppError("Ticket não encontrado", 404);
        return ticket;
    }
}