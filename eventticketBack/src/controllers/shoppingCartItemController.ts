import type { Request, Response, NextFunction } from "express";
import type { ShoppingCartItemService } from "../services/shoppingCartItemService.ts";
import { addCartItemSchema } from "../utils/validatorsUtil.ts";

export class ShoppingCartItemController {

    private readonly cartItemService: ShoppingCartItemService;

    constructor(cartItemService: ShoppingCartItemService) {
        this.cartItemService = cartItemService;
    }

    async addItem(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const data = addCartItemSchema.parse(req.body);
            const item = await this.cartItemService.addItem(userId, data.seatId);
            return res.status(201).json(item);
        } catch (error) {
            return next(error);
        }
    }

    async removeItem(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const itemId = Number(req.params.id);
            await this.cartItemService.removeItem(userId, itemId);
            return res.status(204).send();
        } catch (error) {
            return next(error);
        }
    }

    async listItems(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const items = await this.cartItemService.listByCart(userId);
            return res.status(200).json(items);
        } catch (error) {
            return next(error);
        }
    }
}