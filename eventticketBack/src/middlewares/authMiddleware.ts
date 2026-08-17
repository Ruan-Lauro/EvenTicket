import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(
  req: Request,
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