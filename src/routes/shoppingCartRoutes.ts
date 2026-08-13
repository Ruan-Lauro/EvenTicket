import { Router } from "express";
import { ShoppingCartController } from "../controllers/shoppingCartController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { requireRole, isUserOrRole } from "../middlewares/roleMiddleware.ts";
import { ShoppingCartRepository } from "../repositories/shoppingCartRepository.ts";
import { ShoppingCartService } from "../services/shoppingCartService.ts";

const router = Router();

const shoppingCartRepository = new ShoppingCartRepository();
const shoppingCartService = new ShoppingCartService(shoppingCartRepository);
const shoppingCartController = new ShoppingCartController(shoppingCartService);

router.get("/:id", authMiddleware, (req, res) =>
  shoppingCartController.getShoppingCartById(req, res),
);

router.get("/user/:id", authMiddleware, (req, res) =>
  shoppingCartController.getShoppingCartByUserId(req, res),
);

router.put("/:id", authMiddleware, (req, res) =>
  shoppingCartController.updateShoppingCart(req, res),
);

router.post("/", authMiddleware, (req, res) =>
  shoppingCartController.createShoppingCart(req, res),
);

router.delete("/:id", authMiddleware, (req, res) =>
  shoppingCartController.deleteShoppingCart(req, res),
);


export default router;