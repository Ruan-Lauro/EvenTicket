import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { requireRole } from "../middlewares/roleMiddleware.ts";
import { TicketController } from "../controllers/ticketController.ts";
import { TicketService } from "../services/ticketService.ts";
import { TicketRepository } from "../repositories/ticketRepository.ts";
import { PurchaseRepository } from "../repositories/purchaseRepository.ts";
import { ShoppingCartRepository } from "../repositories/shoppingCartRepository.ts";

const router = Router();

const ticketRepo = new TicketRepository();
const purchaseRepo = new PurchaseRepository();
const cartRepo = new ShoppingCartRepository();
const ticketService = new TicketService(ticketRepo, purchaseRepo, cartRepo);
const ticketController = new TicketController(ticketService);

router.get("/purchases/:purchaseId/tickets", authMiddleware, (req, res) => 
    ticketController.getByPurchaseId(req, res),
);

router.get("/tickets/:code", authMiddleware, (req: Request<{ code: string }>, res: Response) => 
    ticketController.getByCode(req, res),
);

router.patch("/tickets/:code/validate", authMiddleware, requireRole("CONCIERGE"), (req: Request<{ code: string }>, res: Response) => 
    ticketController.validate(req, res),
);

export default router;