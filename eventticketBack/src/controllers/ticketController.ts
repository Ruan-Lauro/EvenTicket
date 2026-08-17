import type { Request, Response } from "express";
import { AppError } from "../errors/appError.ts";
import type { TicketService } from "../services/ticketService.ts";

export class TicketController { 

    private readonly ticketService: TicketService;

    constructor(ticketService: TicketService) {
        this.ticketService = ticketService;
    }

    async getByPurchaseId(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const purchaseId = Number(req.params.purchaseId);
            const tickets = await this.ticketService.findByPurchaseId(purchaseId, userId);
            return res.status(200).json(tickets);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async validate(req: Request<{ code: string }>, res: Response) {
        try {
            const { code } = req.params;
            const result = await this.ticketService.validate(code);
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async getByCode(req: Request<{ code: string }>, res: Response) {
        try {
            const { code } = req.params;
            const ticket = await this.ticketService.findByCode(code);
            return res.status(200).json(ticket);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }
}