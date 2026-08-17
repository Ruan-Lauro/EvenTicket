import { Router } from "express";
import { UserController } from "../controllers/userController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { requireRole, isUserOrRole } from "../middlewares/roleMiddleware.ts";
import { UserRepository } from "../repositories/userRepository.ts";
import { UserService } from "../services/userService.ts";

const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get("/", authMiddleware, requireRole("ADMIN"), (req, res, next) =>
  userController.getUsers(req, res, next),
);

router.get("/:id", authMiddleware, isUserOrRole("ADMIN"), (req, res, next) =>
  userController.getUserById(req, res, next),
);

router.put("/:id", authMiddleware, isUserOrRole("ADMIN"), (req, res, next) =>
  userController.updateUser(req, res, next),
);

router.post("/createwithrole", authMiddleware, requireRole("ADMIN"), (req, res, next) =>
  userController.createUserWithRole(req, res, next),
);

router.delete("/:id", authMiddleware, requireRole("ADMIN"), (req, res, next) =>
  userController.deleteUser(req, res, next),
);


export default router;