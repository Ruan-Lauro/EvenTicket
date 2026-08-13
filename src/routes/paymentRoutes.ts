import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { PaymentController } from "../controllers/paymentController.ts";
import { PaymentService } from "../services/paymentService.ts";
import { PaymentRepository } from "../repositories/paymentRepository.ts";
import { PurchaseRepository } from "../repositories/purchaseRepository.ts";
import { ShoppingCartRepository } from "../repositories/shoppingCartRepository.ts";
import { ShoppingCartItemRepository } from "../repositories/shoppingCartItemRepository.ts";
import { TicketRepository } from "../repositories/ticketRepository.ts";
import { SeatRepository } from "../repositories/seatRepository.ts";

const router = Router();

const paymentRepo = new PaymentRepository();
const purchaseRepo = new PurchaseRepository();
const cartRepo = new ShoppingCartRepository();
const cartItemRepo = new ShoppingCartItemRepository();
const ticketRepo = new TicketRepository();
const seatRepo = new SeatRepository();

const paymentService = new PaymentService(
    paymentRepo, purchaseRepo, cartRepo, cartItemRepo, ticketRepo, seatRepo,
);
const paymentController = new PaymentController(paymentService);

router.post("/:purchaseId/payment", authMiddleware, (req, res) => 
    paymentController.initiate(req, res),
);

router.delete("/:purchaseId/payment", authMiddleware, (req, res) => 
    paymentController.cancel(req, res),
);

router.get("/:purchaseId/payment", authMiddleware, (req, res) => 
    paymentController.getByPurchaseId(req, res),
);

export default router;