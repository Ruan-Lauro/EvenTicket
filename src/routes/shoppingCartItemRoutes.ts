import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { ShoppingCartItemController } from "../controllers/shoppingCartItemController.ts";
import { ShoppingCartItemService } from "../services/shoppingCartItemService.ts";
import { ShoppingCartItemRepository } from "../repositories/shoppingCartItemRepository.ts";
import { ShoppingCartRepository } from "../repositories/shoppingCartRepository.ts";
import { SeatRepository } from "../repositories/seatRepository.ts";

const router = Router();

const cartItemRepo = new ShoppingCartItemRepository();
const cartRepo = new ShoppingCartRepository();
const seatRepo = new SeatRepository();
const cartItemService = new ShoppingCartItemService(cartItemRepo, cartRepo, seatRepo);
const cartItemController = new ShoppingCartItemController(cartItemService);

router.get("/", authMiddleware, (req, res) => 
    cartItemController.listItems(req, res));

router.post("/", authMiddleware, (req, res) => 
    cartItemController.addItem(req, res),
);

router.delete("/:id", authMiddleware, (req, res) =>
     cartItemController.removeItem(req, res),
);

export default router;