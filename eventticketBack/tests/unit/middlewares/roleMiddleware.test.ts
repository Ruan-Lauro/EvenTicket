import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

import {
  requireRole,
  isUserOrRole,
  isAdminOrRole,
} from "../../../src/middlewares/roleMiddleware.ts";

describe("roleMiddleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      params: {},
    } as Request;

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    next = vi.fn();
  });

  describe("requireRole", () => {
    it("deve retornar 401 quando usuário não está autenticado", () => {
      const middleware = requireRole("ADMIN");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        message: "Não autenticado",
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando usuário possui a role permitida", () => {
      req.user = {
        id: 1,
        role: "ADMIN",
      };

      const middleware = requireRole("ADMIN");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("deve chamar next para qualquer uma das roles permitidas", () => {
      req.user = {
        id: 1,
        role: "ORGANIZER",
      };

      const middleware = requireRole("ADMIN", "ORGANIZER");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it("deve retornar 403 quando usuário não possui a role permitida", () => {
      req.user = {
        id: 1,
        role: "USER",
      };

      const middleware = requireRole("ADMIN");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);

      expect(res.json).toHaveBeenCalledWith({
        message: "Acesso negado",
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("deve negar USER quando apenas ADMIN é permitido", () => {
      req.user = {
        id: 1,
        role: "USER",
      };

      const middleware = requireRole("ADMIN");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("deve permitir CONCIERGE quando a role é permitida", () => {
      req.user = {
        id: 1,
        role: "CONCIERGE",
      };

      const middleware = requireRole("CONCIERGE");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });
  });

  describe("isUserOrRole", () => {
    it("deve retornar 401 quando usuário não está autenticado", () => {
      const middleware = isUserOrRole("ADMIN");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        message: "Não autenticado",
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("deve permitir o próprio usuário", () => {
      req.user = {
        id: 10,
        role: "USER",
      };

      req.params = {
        id: "10",
      };

      const middleware = isUserOrRole("ADMIN");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();

      expect(res.status).not.toHaveBeenCalled();
    });

    it("deve permitir usuário que possui uma das roles", () => {
      req.user = {
        id: 10,
        role: "ORGANIZER",
      };

      req.params = {
        id: "999",
      };

      const middleware = isUserOrRole("ORGANIZER");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it("deve permitir ADMIN quando ADMIN estiver entre as roles permitidas", () => {
      req.user = {
        id: 10,
        role: "ADMIN",
      };

      req.params = {
        id: "999",
      };

      const middleware = isUserOrRole("ADMIN");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it("deve retornar 403 quando usuário tenta acessar outro usuário", () => {
      req.user = {
        id: 10,
        role: "USER",
      };

      req.params = {
        id: "20",
      };

      const middleware = isUserOrRole("ADMIN");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);

      expect(res.json).toHaveBeenCalledWith({
        message: "Acesso negado",
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("deve permitir USER acessar o próprio id mesmo sem role permitida", () => {
      req.user = {
        id: 10,
        role: "USER",
      };

      req.params = {
        id: "10",
      };

      const middleware = isUserOrRole("ADMIN");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });
  });

  describe("isAdminOrRole", () => {
    it("deve retornar 401 quando usuário não está autenticado", () => {
      const middleware = isAdminOrRole("ORGANIZER");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        message: "Não autenticado",
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("deve permitir ADMIN mesmo sem estar nas roles informadas", () => {
      req.user = {
        id: 1,
        role: "ADMIN",
      };

      const middleware = isAdminOrRole("ORGANIZER");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("deve permitir usuário que possui a role informada", () => {
      req.user = {
        id: 1,
        role: "ORGANIZER",
      };

      const middleware = isAdminOrRole("ORGANIZER");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it("deve permitir CONCIERGE quando a role for permitida", () => {
      req.user = {
        id: 1,
        role: "CONCIERGE",
      };

      const middleware = isAdminOrRole("CONCIERGE");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it("deve retornar 403 quando usuário não possui role suficiente", () => {
      req.user = {
        id: 1,
        role: "USER",
      };

      const middleware = isAdminOrRole("ORGANIZER");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);

      expect(res.json).toHaveBeenCalledWith({
        message: "Acesso negado",
      });

      expect(next).not.toHaveBeenCalled();
    });
  });
});