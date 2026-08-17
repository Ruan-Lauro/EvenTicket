import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShoppingCartItemService } from "../../../src/services/shoppingCartItemService.ts";
import { AppError } from "../../../src/errors/appError.ts";
import type { IShoppingCartItemRepository } from "../../../src/interfaces/shoppingCartItemRepositoryInterface.ts";
import type { IShoppingCartRepository } from "../../../src/interfaces/shoppingCartRepositoryInterface.ts";
import type { ISeatRepository } from "../../../src/interfaces/seatRepositoryInterface.ts";
import { Decimal } from "@prisma/client/runtime/client";

const makeShoppingCartItem = (overrides = {}) => ({
  id: 1,
  shoppingCartId: 1,
  seatId: 1,
  value: new Decimal(150),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeShoppingCart = (overrides = {}) => ({
  id: 1,
  userId: 10,
  total: new Decimal(300),
  status: "ACTIVE" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeSeat = (overrides = {}) => ({
  id: 1,
  publicationId: 1,
  row: "A",
  number: 1,
  status: "AVAILABLE" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePublication = (overrides = {}) => ({
  price: new Decimal(150),
  ...overrides,
});

const makeShoppingCartItemRepository = (): IShoppingCartItemRepository => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByCartId: vi.fn(),
  findBySeatAndCart: vi.fn(),
  delete: vi.fn(),
  deleteAllByCartId: vi.fn(),
});

const makeShoppingCartRepository = (): IShoppingCartRepository => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

const makeSeatRepository = (): ISeatRepository => ({
  getSeats: vi.fn(),
  getSeatById: vi.fn(),
  getSeatsByPublicationId: vi.fn(),
  createSeat: vi.fn(),
  updateSeat: vi.fn(),
  deleteSeat: vi.fn(),
  findPublicationBySeatId: vi.fn(),
  updateManyStatus: vi.fn(),
});

describe("ShoppingCartItemService", () => {
  let cartItemRepo: IShoppingCartItemRepository;
  let cartRepo: IShoppingCartRepository;
  let seatRepo: ISeatRepository;
  let cartItemService: ShoppingCartItemService;

  beforeEach(() => {
    vi.clearAllMocks();
    cartItemRepo = makeShoppingCartItemRepository();
    cartRepo = makeShoppingCartRepository();
    seatRepo = makeSeatRepository();
    cartItemService = new ShoppingCartItemService(cartItemRepo, cartRepo, seatRepo);
  });

  describe("addItem", () => {
    it("deve lançar AppError 404 quando assento não existe", async () => {
      vi.mocked(seatRepo.getSeatById).mockResolvedValue(null);

      await expect(cartItemService.addItem(10, 99)).rejects.toThrow(
        new AppError("Assento não encontrado", 404),
      );

      expect(cartRepo.findByUserId).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 409 quando assento não está disponível", async () => {
      const seat = makeSeat({ status: "RESERVED" });
      vi.mocked(seatRepo.getSeatById).mockResolvedValue(seat);

      await expect(cartItemService.addItem(10, 1)).rejects.toThrow(
        new AppError("Assento indisponível", 409),
      );

      expect(cartRepo.findByUserId).not.toHaveBeenCalled();
    });

    it("deve criar novo carrinho quando usuário não tem um ativo", async () => {
      const seat = makeSeat();
      const newCart = makeShoppingCart({ total: new Decimal(0) });
      const publication = makePublication();
      const createdItem = makeShoppingCartItem();

      vi.mocked(seatRepo.getSeatById).mockResolvedValue(seat);
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(null);
      vi.mocked(cartRepo.create).mockResolvedValue(newCart);
      vi.mocked(cartItemRepo.findBySeatAndCart).mockResolvedValue(null);
      vi.mocked(seatRepo.findPublicationBySeatId).mockResolvedValue(publication);
      vi.mocked(cartItemRepo.create).mockResolvedValue(createdItem);
      vi.mocked(cartRepo.update).mockResolvedValue(newCart);

      const result = await cartItemService.addItem(10, 1);

      expect(cartRepo.create).toHaveBeenCalledWith({
        userId: 10,
        total: new Decimal(0),
        status: "ACTIVE",
      });
      expect(result).toEqual(createdItem);
    });

    it("deve usar carrinho existente quando usuário tem um ativo", async () => {
      const seat = makeSeat();
      const existingCart = makeShoppingCart();
      const publication = makePublication();
      const createdItem = makeShoppingCartItem();

      vi.mocked(seatRepo.getSeatById).mockResolvedValue(seat);
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(existingCart);
      vi.mocked(cartItemRepo.findBySeatAndCart).mockResolvedValue(null);
      vi.mocked(seatRepo.findPublicationBySeatId).mockResolvedValue(publication);
      vi.mocked(cartItemRepo.create).mockResolvedValue(createdItem);
      vi.mocked(cartRepo.update).mockResolvedValue(existingCart);

      const result = await cartItemService.addItem(10, 1);

      expect(cartRepo.create).not.toHaveBeenCalled();
      expect(cartItemRepo.create).toHaveBeenCalledWith(existingCart.id, {
        seatId: 1,
        value: publication.price,
      });
      expect(result).toEqual(createdItem);
    });

    it("deve lançar AppError 409 quando assento já está no carrinho", async () => {
      const seat = makeSeat();
      const cart = makeShoppingCart();
      const duplicateItem = makeShoppingCartItem();

      vi.mocked(seatRepo.getSeatById).mockResolvedValue(seat);
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
      vi.mocked(cartItemRepo.findBySeatAndCart).mockResolvedValue(duplicateItem);

      await expect(cartItemService.addItem(10, 1)).rejects.toThrow(
        new AppError("Assento já adicionado ao carrinho", 409),
      );

      expect(seatRepo.findPublicationBySeatId).not.toHaveBeenCalled();
      expect(cartItemRepo.create).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 404 quando publicação do assento não existe", async () => {
      const seat = makeSeat();
      const cart = makeShoppingCart();

      vi.mocked(seatRepo.getSeatById).mockResolvedValue(seat);
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
      vi.mocked(cartItemRepo.findBySeatAndCart).mockResolvedValue(null);
      vi.mocked(seatRepo.findPublicationBySeatId).mockResolvedValue(null);

      await expect(cartItemService.addItem(10, 1)).rejects.toThrow(
        new AppError("Publicação do assento não encontrada", 404),
      );

      expect(cartItemRepo.create).not.toHaveBeenCalled();
    });

    it("deve adicionar item e atualizar total do carrinho", async () => {
      const seat = makeSeat();
      const cart = makeShoppingCart({ total: new Decimal(150) });
      const publication = makePublication({ price: new Decimal(100) });
      const createdItem = makeShoppingCartItem({ value: new Decimal(100) });
      const updatedCart = makeShoppingCart({ total: new Decimal(250) });

      vi.mocked(seatRepo.getSeatById).mockResolvedValue(seat);
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
      vi.mocked(cartItemRepo.findBySeatAndCart).mockResolvedValue(null);
      vi.mocked(seatRepo.findPublicationBySeatId).mockResolvedValue(publication);
      vi.mocked(cartItemRepo.create).mockResolvedValue(createdItem);
      vi.mocked(cartRepo.update).mockResolvedValue(updatedCart);

      const result = await cartItemService.addItem(10, 1);

      expect(cartRepo.update).toHaveBeenCalledWith(cart.id, {
        total: new Decimal(250),
      });
      expect(result).toEqual(createdItem);
    });

    it("deve adicionar múltiplos itens ao carrinho", async () => {
      const seat1 = makeSeat({ id: 1 });
      const seat2 = makeSeat({ id: 2 });
      const cart = makeShoppingCart();
      const publication = makePublication({ price: new Decimal(150) });
      const item1 = makeShoppingCartItem({ seatId: 1 });
      const item2 = makeShoppingCartItem({ id: 2, seatId: 2 });

      vi.mocked(seatRepo.getSeatById).mockResolvedValueOnce(seat1);
      vi.mocked(cartRepo.findByUserId).mockResolvedValueOnce(cart);
      vi.mocked(cartItemRepo.findBySeatAndCart).mockResolvedValueOnce(null);
      vi.mocked(seatRepo.findPublicationBySeatId).mockResolvedValueOnce(publication);
      vi.mocked(cartItemRepo.create).mockResolvedValueOnce(item1);
      vi.mocked(cartRepo.update).mockResolvedValueOnce(cart);

      await cartItemService.addItem(10, 1);

      vi.mocked(seatRepo.getSeatById).mockResolvedValueOnce(seat2);
      vi.mocked(cartRepo.findByUserId).mockResolvedValueOnce(cart);
      vi.mocked(cartItemRepo.findBySeatAndCart).mockResolvedValueOnce(null);
      vi.mocked(seatRepo.findPublicationBySeatId).mockResolvedValueOnce(publication);
      vi.mocked(cartItemRepo.create).mockResolvedValueOnce(item2);
      vi.mocked(cartRepo.update).mockResolvedValueOnce(cart);

      await cartItemService.addItem(10, 2);

      expect(cartItemRepo.create).toHaveBeenCalledTimes(2);
    });
  });

  describe("removeItem", () => {
    it("deve lançar AppError 404 quando item não existe", async () => {
      vi.mocked(cartItemRepo.findById).mockResolvedValue(null);

      await expect(cartItemService.removeItem(10, 99)).rejects.toThrow(
        new AppError("Item não encontrado", 404),
      );

      expect(cartRepo.findById).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 403 quando carrinho não existe", async () => {
      const item = makeShoppingCartItem();
      vi.mocked(cartItemRepo.findById).mockResolvedValue(item);
      vi.mocked(cartRepo.findById).mockResolvedValue(null);

      await expect(cartItemService.removeItem(10, 1)).rejects.toThrow(
        new AppError("Acesso negado", 403),
      );

      expect(cartRepo.update).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 403 quando carrinho pertence a outro usuário", async () => {
      const item = makeShoppingCartItem();
      const cart = makeShoppingCart({ userId: 99 });
      vi.mocked(cartItemRepo.findById).mockResolvedValue(item);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);

      await expect(cartItemService.removeItem(10, 1)).rejects.toThrow(
        new AppError("Acesso negado", 403),
      );

      expect(cartRepo.update).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 400 quando carrinho não está ACTIVE", async () => {
      const item = makeShoppingCartItem();
      const cart = makeShoppingCart({ status: "CHECKED_OUT" });
      vi.mocked(cartItemRepo.findById).mockResolvedValue(item);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);

      await expect(cartItemService.removeItem(10, 1)).rejects.toThrow(
        new AppError("Não é possível remover itens de um carrinho finalizado", 400),
      );

      expect(cartRepo.update).not.toHaveBeenCalled();
    });

    it("deve remover item e atualizar total do carrinho", async () => {
      const item = makeShoppingCartItem({ value: new Decimal(150) });
      const cart = makeShoppingCart({ total: new Decimal(300) });
      const updatedCart = makeShoppingCart({ total: new Decimal(150) });

      vi.mocked(cartItemRepo.findById).mockResolvedValue(item);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(cartRepo.update).mockResolvedValue(updatedCart);
      vi.mocked(cartItemRepo.delete).mockResolvedValue(undefined);

      await cartItemService.removeItem(10, 1);

      expect(cartRepo.update).toHaveBeenCalledWith(cart.id, {
        total: new Decimal(150),
      });
      expect(cartItemRepo.delete).toHaveBeenCalledWith(1);
    });

    it("deve remover item com sucesso quando carrinho está ACTIVE", async () => {
      const item = makeShoppingCartItem();
      const cart = makeShoppingCart({ status: "ACTIVE" });

      vi.mocked(cartItemRepo.findById).mockResolvedValue(item);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(cartRepo.update).mockResolvedValue(cart);
      vi.mocked(cartItemRepo.delete).mockResolvedValue(undefined);

      await cartItemService.removeItem(10, 1);

      expect(cartItemRepo.delete).toHaveBeenCalledWith(1);
    });

    it("deve calcular corretamente o novo total ao remover item", async () => {
      const item = makeShoppingCartItem({ value: new Decimal(100) });
      const cart = makeShoppingCart({ total: new Decimal(400) });

      vi.mocked(cartItemRepo.findById).mockResolvedValue(item);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(cartRepo.update).mockResolvedValue(cart);
      vi.mocked(cartItemRepo.delete).mockResolvedValue(undefined);

      await cartItemService.removeItem(10, 1);

      expect(cartRepo.update).toHaveBeenCalledWith(cart.id, {
        total: new Decimal(300),
      });
    });

    it("deve remover item mesmo que total fique zero", async () => {
      const item = makeShoppingCartItem({ value: new Decimal(150) });
      const cart = makeShoppingCart({ total: new Decimal(150) });

      vi.mocked(cartItemRepo.findById).mockResolvedValue(item);
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(cartRepo.update).mockResolvedValue(cart);
      vi.mocked(cartItemRepo.delete).mockResolvedValue(undefined);

      await cartItemService.removeItem(10, 1);

      expect(cartRepo.update).toHaveBeenCalledWith(cart.id, {
        total: new Decimal(0),
      });
      expect(cartItemRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("listByCart", () => {
    it("deve retornar itens do carrinho do usuário", async () => {
      const cart = makeShoppingCart();
      const items = [
        makeShoppingCartItem({ seatId: 1 }),
        makeShoppingCartItem({ id: 2, seatId: 2 }),
      ];

      vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
      vi.mocked(cartItemRepo.findByCartId).mockResolvedValue(items);

      const result = await cartItemService.listByCart(10);

      expect(result).toEqual(items);
      expect(cartRepo.findByUserId).toHaveBeenCalledWith(10);
      expect(cartItemRepo.findByCartId).toHaveBeenCalledWith(cart.id);
    });

    it("deve retornar lista vazia quando carrinho não tem itens", async () => {
      const cart = makeShoppingCart();
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
      vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([]);

      const result = await cartItemService.listByCart(10);

      expect(result).toEqual([]);
    });

    it("deve lançar AppError 404 quando usuário não tem carrinho ativo", async () => {
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(null);

      await expect(cartItemService.listByCart(99)).rejects.toThrow(
        new AppError("Nenhum carrinho ativo encontrado", 404),
      );

      expect(cartItemRepo.findByCartId).not.toHaveBeenCalled();
    });

    it("deve retornar múltiplos itens do carrinho", async () => {
      const cart = makeShoppingCart();
      const items = [
        makeShoppingCartItem({ id: 1, seatId: 1, value: new Decimal(100) }),
        makeShoppingCartItem({ id: 2, seatId: 2, value: new Decimal(150) }),
        makeShoppingCartItem({ id: 3, seatId: 3, value: new Decimal(200) }),
      ];

      vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
      vi.mocked(cartItemRepo.findByCartId).mockResolvedValue(items);

      const result = await cartItemService.listByCart(10);

      expect(result).toHaveLength(3);
      expect(result).toEqual(items);
    });
  });
});
