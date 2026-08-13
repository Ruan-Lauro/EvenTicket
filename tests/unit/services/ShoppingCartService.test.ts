import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShoppingCartService } from "../../../src/services/shoppingCartService.ts";
import { AppError } from "../../../src/errors/appError.ts";
import type { IShoppingCartRepository } from "../../../src/interfaces/shoppingCartRepositoryInterface.ts";
import { Decimal } from "@prisma/client/runtime/client";

const makeShoppingCart = (overrides = {}) => ({
  id: 1,
  userId: 10,
  total: new Decimal(300),
  status: "ACTIVE" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeShoppingCartRepository = (): IShoppingCartRepository => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

describe("ShoppingCartService", () => {
  let cartRepo: IShoppingCartRepository;
  let cartService: ShoppingCartService;

  beforeEach(() => {
    vi.clearAllMocks();
    cartRepo = makeShoppingCartRepository();
    cartService = new ShoppingCartService(cartRepo);
  });

  describe("findById", () => {
    it("deve retornar carrinho quando existe", async () => {
      const cart = makeShoppingCart();
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);

      const result = await cartService.findById(1);

      expect(result).toEqual(cart);
      expect(cartRepo.findById).toHaveBeenCalledWith(1);
    });

    it("deve lançar AppError 404 quando carrinho não existe", async () => {
      vi.mocked(cartRepo.findById).mockResolvedValue(null);

      await expect(cartService.findById(99)).rejects.toThrow(
        new AppError("Carrinho não encontrado", 404),
      );
    });
  });

  describe("findByUserId", () => {
    it("deve retornar carrinho quando usuário tem um ativo", async () => {
      const cart = makeShoppingCart({ userId: 10 });
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);

      const result = await cartService.findByUserId(10);

      expect(result).toEqual(cart);
      expect(cartRepo.findByUserId).toHaveBeenCalledWith(10);
    });

    it("deve lançar AppError 404 quando usuário não tem carrinho ativo", async () => {
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(null);

      await expect(cartService.findByUserId(99)).rejects.toThrow(
        new AppError("Carriinho de Usuário não encontrado", 404),
      );
    });
  });

  describe("update", () => {
    it("deve atualizar carrinho quando existe", async () => {
      const existingCart = makeShoppingCart();
      const updateData = { status: "CHECKED_OUT" as const };
      const updatedCart = makeShoppingCart({ status: "CHECKED_OUT" });

      vi.mocked(cartRepo.findById).mockResolvedValue(existingCart);
      vi.mocked(cartRepo.update).mockResolvedValue(updatedCart);

      const result = await cartService.update(1, updateData);

      expect(result).toEqual(updatedCart);
      expect(cartRepo.findById).toHaveBeenCalledWith(1);
      expect(cartRepo.update).toHaveBeenCalledWith(1, updateData);
    });

    it("deve lançar AppError 404 quando carrinho não existe", async () => {
      vi.mocked(cartRepo.findById).mockResolvedValue(null);

      await expect(
        cartService.update(99, { status: "ABANDONED" }),
      ).rejects.toThrow(new AppError("Carrinho não encontrado", 404));

      expect(cartRepo.update).not.toHaveBeenCalled();
    });

    it("deve permitir atualização parcial do carrinho", async () => {
      const existingCart = makeShoppingCart();
      const partialUpdate = { total: new Decimal(500) };
      const updatedCart = makeShoppingCart({ total: new Decimal(500) });

      vi.mocked(cartRepo.findById).mockResolvedValue(existingCart);
      vi.mocked(cartRepo.update).mockResolvedValue(updatedCart);

      const result = await cartService.update(1, partialUpdate);

      expect(result).toEqual(updatedCart);
      expect(cartRepo.update).toHaveBeenCalledWith(1, partialUpdate);
    });

    it("deve permitir atualização de múltiplos campos", async () => {
      const existingCart = makeShoppingCart();
      const multiUpdate = {
        status: "ABANDONED" as const,
        total: new Decimal(0),
      };
      const updatedCart = makeShoppingCart(multiUpdate);

      vi.mocked(cartRepo.findById).mockResolvedValue(existingCart);
      vi.mocked(cartRepo.update).mockResolvedValue(updatedCart);

      const result = await cartService.update(1, multiUpdate);

      expect(result).toEqual(updatedCart);
      expect(cartRepo.update).toHaveBeenCalledWith(1, multiUpdate);
    });
  });

  describe("delete", () => {
    it("deve deletar carrinho quando existe", async () => {
      const cart = makeShoppingCart();
      vi.mocked(cartRepo.findById).mockResolvedValue(cart);
      vi.mocked(cartRepo.delete).mockResolvedValue(undefined);

      await cartService.delete(1);

      expect(cartRepo.findById).toHaveBeenCalledWith(1);
      expect(cartRepo.delete).toHaveBeenCalledWith(1);
    });

    it("deve lançar AppError 404 quando carrinho não existe", async () => {
      vi.mocked(cartRepo.findById).mockResolvedValue(null);

      await expect(cartService.delete(99)).rejects.toThrow(
        new AppError("Carrinho não encontrado", 404),
      );

      expect(cartRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    const validCartData = {
      userId: 10,
      total: new Decimal(0),
      status: "ACTIVE" as const,
    };

    it("deve criar novo carrinho com sucesso", async () => {
      const createdCart = makeShoppingCart();
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(null);
      vi.mocked(cartRepo.create).mockResolvedValue(createdCart);

      const result = await cartService.create(validCartData);

      expect(cartRepo.findByUserId).toHaveBeenCalledWith(validCartData.userId);
      expect(cartRepo.create).toHaveBeenCalledWith(validCartData);
      expect(result).toEqual(createdCart);
    });

    it("deve lançar AppError 409 quando usuário já tem carrinho ativo", async () => {
      const existingCart = makeShoppingCart({ userId: 10 });
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(existingCart);

      await expect(cartService.create(validCartData)).rejects.toThrow(
        new AppError("Já tem um carrinho ativo", 409),
      );

      expect(cartRepo.create).not.toHaveBeenCalled();
    });

    it("deve criar carrinho para novo usuário", async () => {
      const newUserData = {
        userId: 999,
        total: new Decimal(0),
        status: "ACTIVE" as const,
      };
      const createdCart = makeShoppingCart({
        userId: 999,
        id: 100,
      });

      vi.mocked(cartRepo.findByUserId).mockResolvedValue(null);
      vi.mocked(cartRepo.create).mockResolvedValue(createdCart);

      const result = await cartService.create(newUserData);

      expect(cartRepo.findByUserId).toHaveBeenCalledWith(999);
      expect(cartRepo.create).toHaveBeenCalledWith(newUserData);
      expect(result).toEqual(createdCart);
    });

    it("deve criar carrinho com total inicial", async () => {
      const cartDataWithTotal = {
        userId: 10,
        total: new Decimal(100),
        status: "ACTIVE" as const,
      };
      const createdCart = makeShoppingCart({ total: new Decimal(100) });

      vi.mocked(cartRepo.findByUserId).mockResolvedValue(null);
      vi.mocked(cartRepo.create).mockResolvedValue(createdCart);

      const result = await cartService.create(cartDataWithTotal);

      expect(cartRepo.create).toHaveBeenCalledWith(cartDataWithTotal);
      expect(result).toEqual(createdCart);
    });

    it("deve validar que usuário não tem carrinho antes de criar", async () => {
      vi.mocked(cartRepo.findByUserId).mockResolvedValue(null);
      vi.mocked(cartRepo.create).mockResolvedValue(makeShoppingCart());

      await cartService.create(validCartData);

      expect(cartRepo.findByUserId).toHaveBeenCalledBefore(
        cartRepo.create as any,
      );
    });
  });
});
