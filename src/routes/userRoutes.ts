import { Router } from "express";
import { UserController } from "../controllers/userController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { requireRole, isUserOrRole } from "../middlewares/roleMiddleware.ts";

const router = Router();

const controller = new UserController();

router.get("/", authMiddleware, requireRole("ADMIN"), (req, res) =>
  controller.getUsers(req, res),
);

router.get("/:id", authMiddleware, isUserOrRole("ADMIN"), (req, res) =>
  controller.getUserById(req, res),
);

router.put("/:id", authMiddleware, isUserOrRole("ADMIN"), (req, res) =>
  controller.updateUser(req, res),
);


export default router;