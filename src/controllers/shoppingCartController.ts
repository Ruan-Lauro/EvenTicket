import type { Request, Response } from "express";
import { AppError } from "../errors/appError.ts";
import type { ShoppingCartService } from "../services/shoppingCartService.ts";
import {
	idParamSchema,
	shoppingCartCreateSchema,
    shoppingCartUpdateSchema
} from "../utils/validatorsUtil.ts";
import { Decimal } from "@prisma/client/runtime/client";

export class ShoppingCartController {

	private readonly shoppingCartService: ShoppingCartService;
	constructor(shoppingCartService: ShoppingCartService) {
		this.shoppingCartService = shoppingCartService;
	}

	async getShoppingCartById(req: Request, res: Response) {
		try {
			const params = idParamSchema.parse(req.params);
			const shoppingCart = await this.shoppingCartService.findById(params.id);
			return res.status(200).json(shoppingCart);
		} catch (error) {
			if (error instanceof AppError) {
				return res.status(error.statusCode).json({ message: error.message });
			}

			console.error(error);

			return res.status(500).json({ message: "Erro interno do servidor" });
		}
	}

	async getShoppingCartByUserId(req: Request, res: Response) {
		try {
			const params = idParamSchema.parse(req.params);
			const shoppingCart = await this.shoppingCartService.findByUserId(params.id);
			return res.status(200).json(shoppingCart);
		} catch (error) {
			if (error instanceof AppError) {
				return res.status(error.statusCode).json({ message: error.message });
			}

			console.error(error);

			return res.status(500).json({ message: "Erro interno do servidor" });
		}
	}

	async createShoppingCart(req: Request, res: Response) {
		try {
			const data = shoppingCartCreateSchema.parse(req.body);
			const shoppingCart = await this.shoppingCartService.create({...data, total: new Decimal(data.total)});
			return res.status(201).json(shoppingCart);
		} catch (error) {
			if (error instanceof AppError) {
				return res.status(error.statusCode).json({ message: error.message });
			}

			console.error(error);

			return res.status(500).json({ message: "Erro interno do servidor" });
		}
	}

	async updateShoppingCart(req: Request, res: Response) {
		try {
			const params = idParamSchema.parse(req.params);
			const data = shoppingCartUpdateSchema.parse(req.body);
			const shoppingCart = await this.shoppingCartService.update(params.id, {...data, total: data.total? new Decimal(data.total): undefined});
			return res.status(200).json(shoppingCart);
		} catch (error) {
			if (error instanceof AppError) {
				return res.status(error.statusCode).json({ message: error.message });
			}

			console.error(error);

			return res.status(500).json({ message: "Erro interno do servidor" });
		}
	}

	async deleteShoppingCart(req: Request, res: Response) {
		try {
			const params = idParamSchema.parse(req.params);
			await this.shoppingCartService.delete(params.id);
			return res.status(204).send();
		} catch (error) {
			if (error instanceof AppError) {
				return res.status(error.statusCode).json({ message: error.message });
			}

			console.error(error);

			return res.status(500).json({ message: "Erro interno do servidor" });
		}
	}

}