import { Router } from "express";
import { AuthController } from "../controllers/authController.ts";
import { AuthService } from "../services/authService.ts";
import { UserRepository } from "../repositories/userRepository.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const router = Router();

const userRepository = new UserRepository();

const authService = new AuthService(
    userRepository
);

const authController = new AuthController(
    authService
);

router.post("/register", (req, res, next) =>
  authController.register(req, res, next),
);

router.post("/login", (req, res, next) =>
  authController.login(req, res, next),
);

router.post("/logout", (req, res) =>
  authController.logout(req, res),
);

router.get("/me",authMiddleware,(req, res) => 
  authController.me(req, res),
);

export default router;