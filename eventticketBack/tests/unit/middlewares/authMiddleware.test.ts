import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { authMiddleware } from "../../../src/middlewares/authMiddleware.ts";

describe("authMiddleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      cookies: {},
    } as Request;

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    next = vi.fn();

    process.env.JWT_ACCESS_SECRET = "test-secret";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("quando não existe token", () => {
    it("deve retornar 401", () => {
      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Não autenticado",
      });

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("quando o token é inválido", () => {
    it("deve retornar 401", () => {
      req.cookies = {
        access_token: "token-invalido",
      };

      vi.spyOn(jwt, "verify").mockImplementation(() => {
        throw new Error("Token inválido");
      });

      authMiddleware(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        "token-invalido",
        "test-secret",
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token inválido ou expirado",
      });

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("quando o token não possui sub", () => {
    it("deve retornar 401 com token inválido", () => {
      req.cookies = {
        access_token: "token-sem-sub",
      };

      vi.spyOn(jwt, "verify").mockImplementation(() => ({
        role: "USER",  
      } as jwt.JwtPayload));

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token inválido",
      });

      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe("quando o token é válido", () => {
    it("deve adicionar o usuário ao request e chamar next", () => {
      req.cookies = {
        access_token: "token-valido",
      };

      vi.spyOn(jwt, "verify").mockImplementation(() => ({
        sub: "10",
        role: "USER",
      } as jwt.JwtPayload));

      authMiddleware(req, res, next);

      expect(req.user).toEqual({
        id: 10,
        role: "USER",
      });

      expect(next).toHaveBeenCalledOnce();

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("deve converter sub para number", () => {
      req.cookies = {
        access_token: "token-valido",
      };

      vi.spyOn(jwt, "verify").mockImplementation(() => ({
        sub: "123",
        role: "ORGANIZER",
      } as jwt.JwtPayload));

      authMiddleware(req, res, next);

      expect(req.user).toEqual({
        id: 123,
        role: "ORGANIZER",
      });
    });

    it("deve converter role para string", () => {
      req.cookies = {
        access_token: "token-valido",
      };

       vi.spyOn(jwt, "verify").mockImplementation(() => ({
        sub: "10",
        role: "ADMIN",
      } as jwt.JwtPayload));

      authMiddleware(req, res, next);

      expect(req.user?.role).toBe("ADMIN");
    });
  });
});