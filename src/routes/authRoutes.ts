import { Router } from "express";
import { AuthController } from "../controllers/authController.ts";
import { AuthService } from "../services/authService.ts";
import { UserRepository } from "../repositories/userRepository.ts";

const router = Router();

const userRepository = new UserRepository();

const authService = new AuthService(
    userRepository
);

const authController = new AuthController(
    authService
);

router.post("/register", (req, res) =>
  authController.register(req, res),
);

router.post("/login", (req, res) =>
  authController.login(req, res),
);

router.post("/logout", (req, res) =>
  authController.logout(req, res),
);

export default router;