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

router.get("/", authMiddleware, requireRole("ADMIN"), (req, res) =>
  userController.getUsers(req, res),
);

router.get("/:id", authMiddleware, isUserOrRole("ADMIN"), (req, res) =>
  userController.getUserById(req, res),
);

router.put("/:id", authMiddleware, isUserOrRole("ADMIN"), (req, res) =>
  userController.updateUser(req, res),
);

router.post("/createwithrole", authMiddleware, requireRole("ADMIN"), (req, res) =>
  userController.createUserWithRole(req, res),
);

router.delete("/:id", authMiddleware, requireRole("ADMIN"), (req, res) =>
  userController.deleteUser(req, res),
);


export default router;