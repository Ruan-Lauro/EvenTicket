import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentService } from "../../../src/services/paymentService.ts";
import { AppError } from "../../../src/errors/appError.ts";
import type { IPaymentRepository } from "../../../src/interfaces/paymentRepositoryInterface.ts";
import type { IPurchaseRepository } from "../../../src/interfaces/purchaseRepositoryInterface.ts";
import type { IShoppingCartRepository } from "../../../src/interfaces/shoppingCartRepositoryInterface.ts";
import type { IShoppingCartItemRepository } from "../../../src/interfaces/shoppingCartItemRepositoryInterface.ts";
import type { ITicketRepository } from "../../../src/interfaces/ticketRepositoryInterface.ts";
import type { ISeatRepository } from "../../../src/interfaces/seatRepositoryInterface.ts";
import { Decimal } from "@prisma/client/runtime/client";

const makePayment = (overrides = {}) => ({
  id: 1,
  purchaseId: 1,
  method: "PIX" as const,
  value: new Decimal(300),
  status: "PENDING" as const,
  createdAt: new Date(),
  ...overrides,
});

const makePurchase = (overrides = {}) => ({
  id: 1,
  shoppingCartId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeShoppingCart = (overrides = {}) => ({
  id: 1,
  userId: 10,
  total: new Decimal(300),
  status: "CHECKED_OUT" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeShoppingCartItem = (overrides = {}) => ({
  id: 1,
  shoppingCartId: 1,
  seatId: 1,
  value: new Decimal(150),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeSeat = (overrides = {}) => ({
  id: 1,
  publicationId: 1,
  row: "A",
  number: 1,
  status: "RESERVED" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePaymentRepository = (): IPaymentRepository => ({
    create: vi.fn(),
    findByPurchaseId: vi.fn(),
    updateStatus: vi.fn(),
    findById: vi.fn(),
});

const makePurchaseRepository = (): IPurchaseRepository => ({
    findById: vi.fn(),
    create: vi.fn(),
    findByCartId: vi.fn(),
});

const makeShoppingCartRepository = (): IShoppingCartRepository => ({
    findById: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    findByUserId: vi.fn(),
    delete: vi.fn(),
});

const makeShoppingCartItemRepository = (): IShoppingCartItemRepository => ({
    findByCartId: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findBySeatAndCart: vi.fn(),
    delete: vi.fn(),
    deleteAllByCartId: vi.fn(),
});

const makeTicketRepository = (): ITicketRepository => ({
    createMany: vi.fn(),
    deleteByPurchaseId: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByCode: vi.fn(),
    findByPurchaseId: vi.fn(),
    markAsUsed: vi.fn(),
});

const makeSeatRepository = (): ISeatRepository => ({
    getSeatById: vi.fn(),
    updateManyStatus: vi.fn(),
    getSeats: vi.fn(),
    getSeatsByPublicationId: vi.fn(),
    createSeat: vi.fn(),
    updateSeat: vi.fn(),
    deleteSeat: vi.fn(),
    findPublicationBySeatId: vi.fn(),
});

describe("PaymentService", () => {
  let paymentRepo: IPaymentRepository;
  let purchaseRepo: IPurchaseRepository;
  let cartRepo: IShoppingCartRepository;
  let cartItemRepo: IShoppingCartItemRepository;
  let ticketRepo: ITicketRepository;
  let seatRepo: ISeatRepository;
  let paymentService: PaymentService;

  beforeEach(() => {
    vi.clearAllMocks();
    paymentRepo = makePaymentRepository();
    purchaseRepo = makePurchaseRepository();
    cartRepo = makeShoppingCartRepository();
    cartItemRepo = makeShoppingCartItemRepository();
    ticketRepo = makeTicketRepository();
    seatRepo = makeSeatRepository();
    paymentService = new PaymentService(
      paymentRepo,
      purchaseRepo,
      cartRepo,
      cartItemRepo,
      ticketRepo,
      seatRepo,
    );
  });

  describe("initiate", () => {
    it("deve lançar AppError 404 quando compra não existe", async () => {
      vi.mocked(purchaseRepo.findById).mockResolvedValue(null);

      await expect(
        paymentService.initiate(99, "PIX", 10),
      ).rejects.toThrow(new AppError("Compra não encontrada", 404));

      expect(paymentRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 403 quando carrinho não existe ou não pertence ao usuário", async () => {
      const purchase = makePurchase();
      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(null);

      await expect(
        paymentService.initiate(1, "PIX", 10),
      ).rejects.toThrow(new AppError("Acesso negado", 403));

      expect(paymentRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 403 quando carrinho pertence a outro usuário", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart({ userId: 99 });
      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);

      await expect(
        paymentService.initiate(1, "PIX", 10),
      ).rejects.toThrow(new AppError("Acesso negado", 403));

      expect(paymentRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 409 quando pagamento já foi realizado", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart();
      const existingPayment = makePayment({ status: "PAID" });
      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(paymentRepo.findByPurchaseId).mockResolvedValue(existingPayment);

      await expect(
        paymentService.initiate(1, "PIX", 10),
      ).rejects.toThrow(new AppError("Compra já foi paga", 409));

      expect(paymentRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 409 quando pagamento está pendente", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart();
      const existingPayment = makePayment({ status: "PENDING" });
      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(paymentRepo.findByPurchaseId).mockResolvedValue(existingPayment);

      await expect(
        paymentService.initiate(1, "PIX", 10),
      ).rejects.toThrow(new AppError("Pagamento já em andamento", 409));

      expect(paymentRepo.create).not.toHaveBeenCalled();
    });

    it("deve criar pagamento e confirmá-lo quando simulação retorna PAID", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart();
      const item = makeShoppingCartItem();
      const seat = makeSeat();
      const payment = makePayment({ status: "PENDING" });
      const paidPayment = makePayment({ status: "PAID" });

      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(paymentRepo.findByPurchaseId).mockResolvedValue(null);
      vi.mocked(paymentRepo.create).mockResolvedValue(payment);
      vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([item]);
      vi.mocked(seatRepo.getSeatById).mockResolvedValue(seat);
      vi.mocked(paymentRepo.updateStatus).mockResolvedValue(paidPayment);
      vi.mocked(ticketRepo.createMany).mockResolvedValue(0);
      vi.mocked(seatRepo.updateManyStatus).mockResolvedValue(undefined);

      vi.spyOn(Math, "random").mockReturnValue(0.5);

      const result = await paymentService.initiate(1, "PIX", 10);

      expect(paymentRepo.create).toHaveBeenCalledWith({
        purchaseId: 1,
        method: "PIX",
        value: cart.total,
      });
      expect(paymentRepo.updateStatus).toHaveBeenCalledWith(payment.id, "PAID");
      expect(ticketRepo.createMany).toHaveBeenCalled();
      expect(seatRepo.updateManyStatus).toHaveBeenCalledWith([item.seatId], "SOLD");
      expect(result).toEqual(paidPayment);
    });

    it("deve criar pagamento e falhar quando simulação retorna FAILED", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart();
      const item = makeShoppingCartItem();
      const payment = makePayment({ status: "PENDING" });
      const failedPayment = makePayment({ status: "FAILED" });

      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(paymentRepo.findByPurchaseId).mockResolvedValue(null);
      vi.mocked(paymentRepo.create).mockResolvedValue(payment);
      vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([item]);
      vi.mocked(paymentRepo.updateStatus).mockResolvedValue(failedPayment);
      vi.mocked(seatRepo.updateManyStatus).mockResolvedValue(undefined);
      vi.mocked(cartRepo.update).mockResolvedValue(null);

      vi.spyOn(Math, "random").mockReturnValue(0.05);

      const result = await paymentService.initiate(1, "PIX", 10);

      expect(paymentRepo.create).toHaveBeenCalledWith({
        purchaseId: 1,
        method: "PIX",
        value: cart.total,
      });
      expect(paymentRepo.updateStatus).toHaveBeenCalledWith(payment.id, "FAILED");
      expect(seatRepo.updateManyStatus).toHaveBeenCalledWith([item.seatId], "AVAILABLE");
      expect(cartRepo.update).toHaveBeenCalledWith(cart.id, { status: "ACTIVE" });
      expect(result).toEqual(failedPayment);
    });

    it("deve lançar AppError quando assento não existe durante confirmação", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart();
      const item = makeShoppingCartItem();
      const payment = makePayment({ status: "PENDING" });

      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(paymentRepo.findByPurchaseId).mockResolvedValue(null);
      vi.mocked(paymentRepo.create).mockResolvedValue(payment);
      vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([item]);
      vi.mocked(seatRepo.getSeatById).mockResolvedValue(null);
      vi.spyOn(Math, "random").mockReturnValue(0.5);

      await expect(
        paymentService.initiate(1, "PIX", 10),
      ).rejects.toThrow(new AppError(`Assento ${item.seatId} não encontrado`, 404));
    });
  });

  describe("cancel", () => {
    it("deve lançar AppError 404 quando compra não existe", async () => {
      vi.mocked(purchaseRepo.findById).mockResolvedValue(null);

      await expect(
        paymentService.cancel(99, 10),
      ).rejects.toThrow(new AppError("Compra não encontrada", 404));
    });

    it("deve lançar AppError 403 quando carrinho não existe ou não pertence ao usuário", async () => {
      const purchase = makePurchase();
      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(null);

      await expect(
        paymentService.cancel(1, 10),
      ).rejects.toThrow(new AppError("Acesso negado", 403));
    });

    it("deve lançar AppError 403 quando carrinho pertence a outro usuário", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart({ userId: 99 });
      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);

      await expect(
        paymentService.cancel(1, 10),
      ).rejects.toThrow(new AppError("Acesso negado", 403));
    });

    it("deve cancelar compra com pagamento PAID e fazer estorno", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart();
      const item = makeShoppingCartItem();
      const payment = makePayment({ status: "PAID" });

      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(paymentRepo.findByPurchaseId).mockResolvedValue(payment);
      vi.mocked(paymentRepo.updateStatus).mockResolvedValue(
        makePayment({ status: "REFUNDED" }),
      );
      vi.mocked(ticketRepo.deleteByPurchaseId).mockResolvedValue(undefined);
      vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([item]);
      vi.mocked(seatRepo.updateManyStatus).mockResolvedValue(undefined);
      vi.mocked(cartRepo.update).mockResolvedValue(null);

      const result = await paymentService.cancel(1, 10);

      expect(paymentRepo.updateStatus).toHaveBeenCalledWith(payment.id, "REFUNDED");
      expect(ticketRepo.deleteByPurchaseId).toHaveBeenCalledWith(1);
      expect(seatRepo.updateManyStatus).toHaveBeenCalledWith([item.seatId], "AVAILABLE");
      expect(cartRepo.update).toHaveBeenCalledWith(cart.id, { status: "ACTIVE" });
      expect(result).toEqual({ message: "Compra cancelada e estorno realizado com sucesso" });
    });

    it("deve cancelar compra sem pagamento PAID", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart();
      const item = makeShoppingCartItem();

      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(paymentRepo.findByPurchaseId).mockResolvedValue(null);
      vi.mocked(ticketRepo.deleteByPurchaseId).mockResolvedValue(undefined);
      vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([item]);
      vi.mocked(seatRepo.updateManyStatus).mockResolvedValue(undefined);
      vi.mocked(cartRepo.update).mockResolvedValue(null);

      const result = await paymentService.cancel(1, 10);

      expect(paymentRepo.updateStatus).not.toHaveBeenCalled();
      expect(ticketRepo.deleteByPurchaseId).toHaveBeenCalledWith(1);
      expect(seatRepo.updateManyStatus).toHaveBeenCalledWith([item.seatId], "AVAILABLE");
      expect(result).toEqual({ message: "Compra cancelada e estorno realizado com sucesso" });
    });

    it("deve lidar com carrinho não encontrado durante cancelamento", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart();

      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(paymentRepo.findByPurchaseId).mockResolvedValue(null);
      vi.mocked(ticketRepo.deleteByPurchaseId).mockResolvedValue(undefined);
      vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([]);
      vi.mocked(seatRepo.updateManyStatus).mockResolvedValue(undefined);
      vi.mocked(cartRepo.update).mockResolvedValue(null);

      const result = await paymentService.cancel(1, 10);

      expect(result).toEqual({ message: "Compra cancelada e estorno realizado com sucesso" });
    });
  });

  describe("findByPurchaseId", () => {
    it("deve retornar pagamento quando existe", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart();
      const payment = makePayment();

      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(paymentRepo.findByPurchaseId).mockResolvedValue(payment);

      const result = await paymentService.findByPurchaseId(1, 10);

      expect(result).toEqual(payment);
    });

    it("deve lançar AppError 404 quando compra não existe", async () => {
      vi.mocked(purchaseRepo.findById).mockResolvedValue(null);

      await expect(
        paymentService.findByPurchaseId(99, 10),
      ).rejects.toThrow(new AppError("Compra não encontrada", 404));
    });

    it("deve lançar AppError 403 quando carrinho não existe ou não pertence ao usuário", async () => {
      const purchase = makePurchase();
      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(null);

      await expect(
        paymentService.findByPurchaseId(1, 10),
      ).rejects.toThrow(new AppError("Acesso negado", 403));
    });

    it("deve lançar AppError 403 quando carrinho pertence a outro usuário", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart({ userId: 99 });
      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);

      await expect(
        paymentService.findByPurchaseId(1, 10),
      ).rejects.toThrow(new AppError("Acesso negado", 403));
    });

    it("deve lançar AppError 404 quando pagamento não existe", async () => {
      const purchase = makePurchase();
      const cart = makeShoppingCart();
      vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(paymentRepo.findByPurchaseId).mockResolvedValue(null);

      await expect(
        paymentService.findByPurchaseId(1, 10),
      ).rejects.toThrow(new AppError("Pagamento não encontrado", 404));
    });
  });
});
