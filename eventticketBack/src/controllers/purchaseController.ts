import type { Request, Response } from "express";
import { AppError } from "../errors/appError.ts";
import type { PurchaseService } from "../services/purchaseService.ts";

export class PurchaseController {

    private readonly purchaseService: PurchaseService;
    constructor(purchaseService: PurchaseService) {
        this.purchaseService = purchaseService;
    }

    async checkout(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const purchase = await this.purchaseService.checkout(userId);
            return res.status(201).json(purchase);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async getPurchaseById(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const purchaseId = Number(req.params.id);
            const purchase = await this.purchaseService.findById(purchaseId, userId);
            return res.status(200).json(purchase);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }
}