import { describe, it, expect, vi, beforeEach } from "vitest";
import { TicketService } from "../../../src/services/ticketService.ts";
import { AppError } from "../../../src/errors/appError.ts";
import type { ITicketRepository } from "../../../src/interfaces/ticketRepositoryInterface.ts";
import type { IPurchaseRepository } from "../../../src/interfaces/purchaseRepositoryInterface.ts";
import type { IShoppingCartRepository } from "../../../src/interfaces/shoppingCartRepositoryInterface.ts";
import { Decimal } from "@prisma/client/runtime/client";

const makeTicket = (overrides = {}) => ({
  id: 1,
  purchaseId: 10,
  publicationId: 5,
  seatId: 20,
  code: "CODE-ABC",
  value: new Decimal(150),
  type: "STANDARD",
  shareLink: null,
  usedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePurchase = (overrides = {}) => ({
  id: 10,
  shoppingCartId: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeCart = (overrides = {}) => ({
  id: 100,
  userId: 1,
  total: new Decimal(150),
  status: "CHECKED_OUT" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeTicketRepo = (): ITicketRepository => ({
  create: vi.fn(),
  createMany: vi.fn(),
  findById: vi.fn(),
  findByCode: vi.fn(),
  findByPurchaseId: vi.fn(),
  findByUserId: vi.fn(),
  markAsUsed: vi.fn(),
  deleteByPurchaseId: vi.fn(),
});

const makePurchaseRepo = (): IPurchaseRepository => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByCartId: vi.fn(),
});

const makeCartRepo = (): IShoppingCartRepository => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

describe("TicketService", () => {
  let ticketRepo: ITicketRepository;
  let purchaseRepo: IPurchaseRepository;
  let cartRepo: IShoppingCartRepository;
  let ticketService: TicketService;

  beforeEach(() => {
    vi.clearAllMocks();
    ticketRepo = makeTicketRepo();
    purchaseRepo = makePurchaseRepo();
    cartRepo = makeCartRepo();
    ticketService = new TicketService(ticketRepo, purchaseRepo, cartRepo);
  });

  describe("findByPurchaseId", () => {
    it("deve retornar os tickets do usuário dono da compra", async () => {
      const tickets = [makeTicket()];
      vi.mocked(purchaseRepo.findById).mockResolvedValue(makePurchase());
      vi.mocked(cartRepo.findById).mockResolvedValue(makeCart({ userId: 1 }));
      vi.mocked(ticketRepo.findByPurchaseId).mockResolvedValue(tickets);

      const result = await ticketService.findByPurchaseId(10, 1);

      expect(ticketRepo.findByPurchaseId).toHaveBeenCalledWith(10);
      expect(result).toEqual(tickets);
    });

    it("deve lançar AppError 404 quando a compra não existe", async () => {
      vi.mocked(purchaseRepo.findById).mockResolvedValue(null);

      await expect(ticketService.findByPurchaseId(99, 1)).rejects.toThrow(
        new AppError("Compra não encontrada", 404),
      );

      expect(ticketRepo.findByPurchaseId).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 403 quando o carrinho não pertence ao usuário", async () => {
      vi.mocked(purchaseRepo.findById).mockResolvedValue(makePurchase());
      vi.mocked(cartRepo.findById).mockResolvedValue(makeCart({ userId: 99 }));

      await expect(ticketService.findByPurchaseId(10, 1)).rejects.toThrow(
        new AppError("Acesso negado", 403),
      );
    });

    it("deve lançar AppError 403 quando o carrinho não existe", async () => {
      vi.mocked(purchaseRepo.findById).mockResolvedValue(makePurchase());
      vi.mocked(cartRepo.findById).mockResolvedValue(null);

      await expect(ticketService.findByPurchaseId(10, 1)).rejects.toThrow(
        new AppError("Acesso negado", 403),
      );
    });
  });

  describe("findById", () => {
    it("deve retornar o ticket quando ele pertence ao usuário", async () => {
      const ticket = makeTicket({ id: 7, purchaseId: 11 });
      vi.mocked(ticketRepo.findById).mockResolvedValue(ticket);
      vi.mocked(purchaseRepo.findById).mockResolvedValue(makePurchase({ id: 11, shoppingCartId: 200 }));
      vi.mocked(cartRepo.findById).mockResolvedValue(makeCart({ id: 200, userId: 1 }));

      const result = await ticketService.findById(7, 1);

      expect(ticketRepo.findById).toHaveBeenCalledWith(7);
      expect(result).toEqual(ticket);
    });

    it("deve lançar AppError 403 quando o ticket não pertence ao usuário", async () => {
      const ticket = makeTicket({ id: 7, purchaseId: 11 });
      vi.mocked(ticketRepo.findById).mockResolvedValue(ticket);
      vi.mocked(purchaseRepo.findById).mockResolvedValue(makePurchase({ id: 11, shoppingCartId: 200 }));
      vi.mocked(cartRepo.findById).mockResolvedValue(makeCart({ id: 200, userId: 99 }));

      await expect(ticketService.findById(7, 1)).rejects.toThrow(
        new AppError("Acesso negado", 403),
      );
    });
  });

  describe("findByUserId", () => {
    it("deve retornar todos os tickets do usuário informado", async () => {
      const tickets = [makeTicket(), makeTicket({ id: 2, code: "CODE-XYZ" })];
      vi.mocked(ticketRepo.findByUserId).mockResolvedValue(tickets);

      const result = await ticketService.findByUserId(1);

      expect(ticketRepo.findByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(tickets);
    });
  });

  describe("validate", () => {
    it("deve marcar o ticket como usado e retornar mensagem de sucesso", async () => {
      const ticket = makeTicket({ usedAt: null });
      const usedTicket = makeTicket({ usedAt: new Date() });
      vi.mocked(ticketRepo.findByCode).mockResolvedValue(ticket);
      vi.mocked(ticketRepo.markAsUsed).mockResolvedValue(usedTicket);

      const result = await ticketService.validate("CODE-ABC");

      expect(ticketRepo.markAsUsed).toHaveBeenCalledWith(ticket.id);
      expect(result).toEqual({
        ticket: usedTicket,
        message: "Check-in realizado com sucesso",
      });
    });

    it("deve lançar AppError 404 quando o código do ticket não existe", async () => {
      vi.mocked(ticketRepo.findByCode).mockResolvedValue(null);

      await expect(ticketService.validate("INVALIDO")).rejects.toThrow(
        new AppError("Ticket inválido", 404),
      );

      expect(ticketRepo.markAsUsed).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 409 quando o ticket já foi utilizado", async () => {
      const usedAt = new Date("2025-06-15T10:30:00");
      const ticket = makeTicket({ usedAt });
      vi.mocked(ticketRepo.findByCode).mockResolvedValue(ticket);

      await expect(ticketService.validate("CODE-ABC")).rejects.toThrow(
        AppError,
      );

      try {
        await ticketService.validate("CODE-ABC");
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).statusCode).toBe(409);
      }

      expect(ticketRepo.markAsUsed).not.toHaveBeenCalled();
    });
  });

 
  describe("findByCode", () => {
    it("deve retornar o ticket quando o código existe", async () => {
      const ticket = makeTicket();
      vi.mocked(ticketRepo.findByCode).mockResolvedValue(ticket);

      const result = await ticketService.findByCode("CODE-ABC");

      expect(result).toEqual(ticket);
    });

    it("deve lançar AppError 404 quando o código não existe", async () => {
      vi.mocked(ticketRepo.findByCode).mockResolvedValue(null);

      await expect(ticketService.findByCode("X")).rejects.toThrow(
        new AppError("Ticket não encontrado", 404),
      );
    });
  });
});