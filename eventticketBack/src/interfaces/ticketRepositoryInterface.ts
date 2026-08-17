import type { ITicket, ITicketCreate } from "./ticketInterface.ts";

export interface ITicketRepository {
    create(ticket: ITicketCreate): Promise<ITicket>;
    createMany(tickets: ITicketCreate[]): Promise<number>;
    findById(id: number): Promise<ITicket | null>;
    findByCode(code: string): Promise<ITicket | null>;
    findByPurchaseId(purchaseId: number): Promise<ITicket[]>;
    findByUserId(userId: number): Promise<ITicket[]>;
    markAsUsed(id: number): Promise<ITicket>;
    deleteByPurchaseId(purchaseId: number): Promise<void>; 
}