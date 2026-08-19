import { prisma } from "../config/database.ts";
import type { ITicket, ITicketCreate } from "../interfaces/ticketInterface.ts";
import type { ITicketRepository } from "../interfaces/ticketRepositoryInterface.ts";

export class TicketRepository implements ITicketRepository {

    async create(ticket: ITicketCreate): Promise<ITicket> {
        return prisma.ticket.create({ 
            data: ticket 
        });
    }

    async createMany(tickets: ITicketCreate[]): Promise<number> {
        const result = await prisma.ticket.createMany({ 
            data: tickets
        });
        return result.count;
    }

    async findById(id: number): Promise<ITicket | null> {
        return prisma.ticket.findUnique({ 
            where: { id } 
        });
    }

    async findByCode(code: string): Promise<ITicket | null> {
        return prisma.ticket.findUnique({ 
            where: { code } 
        });
    }

    async findByPurchaseId(purchaseId: number): Promise<ITicket[]> {
        return prisma.ticket.findMany({ 
            where: { purchaseId } 
        });
    }

    async findByUserId(userId: number): Promise<ITicket[]> {
        return prisma.ticket.findMany({
            where: {
                purchase: {
                    shoppingCart: {
                        userId,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async markAsUsed(id: number): Promise<ITicket> {
        return prisma.ticket.update({
            where: { id, usedAt: null },
            data: { usedAt: new Date() },
        });
    }

    async deleteByPurchaseId(purchaseId: number): Promise<void> {
        await prisma.ticket.deleteMany({ 
            where: { purchaseId } 
        });
    }
}