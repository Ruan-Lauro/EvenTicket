import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { errorMiddleware } from "../../../src/middlewares/erroMiddleware.ts";
import { AppError } from "../../../src/errors/appError.ts";
import { PublicationController } from "../../../src/controllers/publicationController.ts";

describe("errorMiddleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {} as Request;
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    next = vi.fn();
  });

  it("deve responder 400 com erros de validação do Zod", () => {
    const result = z.object({ name: z.string().min(3) }).safeParse({ name: "A" });

    if (!result.success) {
      errorMiddleware(result.error, req, res, next);
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Dados inválidos",
      errors: [
        {
          field: "name",
          message: "Too small: expected string to have >=3 characters",
        },
      ],
    });
  });

  it("deve responder com o status do AppError", () => {
    const error = new AppError("Email já cadastrado", 409);

    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email já cadastrado",
    });
  });

  it("deve responder 500 para erro genérico", () => {
    errorMiddleware(new Error("Erro inesperado"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erro interno do servidor",
    });
  });

  it("deve repassar ZodError para o próximo middleware em vez de responder no controller", async () => {
    const controller = new PublicationController({
      createPublication: vi.fn(),
    } as any);

    const nextSpy = vi.fn();
    const invalidReq = {
      body: { price: -1 },
    } as Request;

    await controller.createPublication(invalidReq, res, nextSpy);

    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(nextSpy.mock.calls[0][0]).toBeInstanceOf(z.ZodError);
    expect(res.status).not.toHaveBeenCalled();
  });
});
