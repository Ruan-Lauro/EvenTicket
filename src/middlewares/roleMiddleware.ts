import type { NextFunction, Response, Request } from "express";

export function requireRole(...roles: string[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Não autenticado",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Acesso negado",
      });
    }

    next();
  };
}

export function isUserOrRole(...roles: string[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Não autenticado",
      });
    }

    if (!roles.includes(req.user.role) && req.user.id !== Number(req.params.id)) {
      return res.status(403).json({
        message: "Acesso negado",
      });
    }

    next();
  };
} 


export function isAdminOrRole(...roles: string[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Não autenticado",
      });
    }

    if (!roles.includes(req.user.role) && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Acesso negado",
      });
    }

    next();
  };
} 