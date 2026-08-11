import type { Request, Response } from "express";
import { AuthService } from "../services/authService.ts";
import {
  loginSchema,
  registerSchema,
} from "../interfaces/authInterface.ts";
import { AppError } from "../errors/appError.ts";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);

    const user = await authService.register(
      data.name,
      data.email,
      data.password,
    );

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      user,
    });
  }

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    try {
      const result = await authService.login(
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
        if (error instanceof AppError) {
          return res.status(error.statusCode).json({
          message: error.message,
        });
      }

      console.error(error);

      return res.status(500).json({
        message: "Erro interno do servidor",
      });
    }
    
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("access_token");

    return res.status(200).json({
      message: "Logout realizado com sucesso",
    });
  }
}