import type { Request, Response } from "express";
import { AppError } from "../errors/appError.ts";
import type { PaymentService } from "../services/paymentService.ts";
import { paymentInitiateSchema } from "../utils/validatorsUtil.ts";

export class PaymentController {

    private readonly paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
    }

    async initiate(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const purchaseId = Number(req.params.purchaseId);
            const data = paymentInitiateSchema.parse(req.body);
            const payment = await this.paymentService.initiate(purchaseId, data.method, userId);
            return res.status(201).json(payment);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async cancel(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const purchaseId = Number(req.params.purchaseId);
            const result = await this.paymentService.cancel(purchaseId, userId);
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async getByPurchaseId(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const purchaseId = Number(req.params.purchaseId);
            const payment = await this.paymentService.findByPurchaseId(purchaseId, userId);
            return res.status(200).json(payment);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }
}