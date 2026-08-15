import type { Request, Response, NextFunction } from "express";
import type { PaymentService } from "../services/paymentService.ts";
import { paymentInitiateSchema } from "../utils/validatorsUtil.ts";

export class PaymentController {

    private readonly paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
    }

    async initiate(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const purchaseId = Number(req.params.purchaseId);
            const data = paymentInitiateSchema.parse(req.body);
            const payment = await this.paymentService.initiate(purchaseId, data.method, userId);
            return res.status(201).json(payment);
        } catch (error) {
            return next(error);
        }
    }

    async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const purchaseId = Number(req.params.purchaseId);
            const result = await this.paymentService.cancel(purchaseId, userId);
            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async getByPurchaseId(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const purchaseId = Number(req.params.purchaseId);
            const payment = await this.paymentService.findByPurchaseId(purchaseId, userId);
            return res.status(200).json(payment);
        } catch (error) {
            return next(error);
        }
    }
}