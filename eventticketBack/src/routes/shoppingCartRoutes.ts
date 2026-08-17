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

router.get("/:id", authMiddleware, (req, res, next) =>
  shoppingCartController.getShoppingCartById(req, res, next),
);

router.get("/user/:id", authMiddleware, (req, res, next) =>
  shoppingCartController.getShoppingCartByUserId(req, res, next),
);

router.put("/:id", authMiddleware, (req, res, next) =>
  shoppingCartController.updateShoppingCart(req, res, next),
);

router.post("/", authMiddleware, (req, res, next) =>
  shoppingCartController.createShoppingCart(req, res, next),
);

router.delete("/:id", authMiddleware, (req, res, next) =>
  shoppingCartController.deleteShoppingCart(req, res, next),
);


export default router;