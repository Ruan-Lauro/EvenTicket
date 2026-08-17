import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService.ts";
import {
  loginSchema,
  registerSchema,
} from "../utils/validatorsUtil.ts";

export class AuthController {

  private readonly authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);

      const user = await this.authService.register(
        data.name,
        data.email,
        data.password,
      );

      return res.status(201).json({
        message: "Usuário criado com sucesso",
        user,
      });
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await this.authService.login(
        data.email,
        data.password,
      );

      res.cookie("access_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Login realizado com sucesso",
        user: result.user,
      });
    } catch (error) {
      return next(error);
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("access_token");

    return res.status(200).json({
      message: "Logout realizado com sucesso",
    });
  }

  async me(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Não autenticado",
      });
    }

    const user = await this.authService.me(req.user.id);

    return res.status(200).json(user);
  }

}