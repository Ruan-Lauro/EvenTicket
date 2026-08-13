import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { PurchaseController } from "../controllers/purchaseController.ts";
import { PurchaseService } from "../services/purchaseService.ts";
import { PurchaseRepository } from "../repositories/purchaseRepository.ts";
import { ShoppingCartRepository } from "../repositories/shoppingCartRepository.ts";
import { ShoppingCartItemRepository } from "../repositories/shoppingCartItemRepository.ts";
import { SeatRepository } from "../repositories/seatRepository.ts";

const router = Router();

const purchaseRepo = new PurchaseRepository();
const cartRepo = new ShoppingCartRepository();
const cartItemRepo = new ShoppingCartItemRepository();
const seatRepo = new SeatRepository();
const purchaseService = new PurchaseService(purchaseRepo, cartRepo, cartItemRepo, seatRepo);
const purchaseController = new PurchaseController(purchaseService);

router.post("/checkout", authMiddleware, (req, res) => purchaseController.checkout(req, res));
router.get("/:id", authMiddleware, (req, res) => purchaseController.getPurchaseById(req, res));

export default router;