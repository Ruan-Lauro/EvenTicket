import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      message: "Não autenticado",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!,
    ) as jwt.JwtPayload;

    if (!payload.sub) {
      return res.status(401).json({
        message: "Token inválido",
      });
    }

    req.user = {
      id: Number(payload.sub),
      role: String(payload.role),
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}