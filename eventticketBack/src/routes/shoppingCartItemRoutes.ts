import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { ShoppingCartItemController } from "../controllers/shoppingCartItemController.ts";
import { ShoppingCartItemService } from "../services/shoppingCartItemService.ts";
import { ShoppingCartItemRepository } from "../repositories/shoppingCartItemRepository.ts";
import { ShoppingCartRepository } from "../repositories/shoppingCartRepository.ts";
import { SeatRepository } from "../repositories/seatRepository.ts";
import { requireRole } from "../middlewares/roleMiddleware.ts";

const router = Router();

const cartItemRepo = new ShoppingCartItemRepository();
const cartRepo = new ShoppingCartRepository();
const seatRepo = new SeatRepository();
const cartItemService = new ShoppingCartItemService(cartItemRepo, cartRepo, seatRepo);
const cartItemController = new ShoppingCartItemController(cartItemService);

router.get("/", authMiddleware, requireRole("USER"), (req, res, next) => 
    cartItemController.listItems(req, res, next));

router.post("/", authMiddleware, requireRole("USER"), (req, res, next) => 
    cartItemController.addItem(req, res, next),
);

router.delete("/:id", authMiddleware, requireRole("USER"), (req, res, next) =>
     cartItemController.removeItem(req, res, next),
);

export default router;