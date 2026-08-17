import { describe, it, expect, vi, beforeEach } from "vitest";
import { PurchaseService } from "../../../src/services/purchaseService.js";
import { AppError } from "../../../src/errors/appError.js";
import { Decimal } from "@prisma/client/runtime/client";
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
    status: "ACTIVE",
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
    status: "AVAILABLE",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});
const makePurchaseRepository = () => ({
    create: vi.fn(),
    findById: vi.fn(),
    findByCartId: vi.fn(),
});
const makeShoppingCartRepository = () => ({
    findByUserId: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    create: function (shoppingCart) {
        throw new Error("Function not implemented.");
    },
    delete: function (id) {
        throw new Error("Function not implemented.");
    }
});
const makeShoppingCartItemRepository = () => ({
    findByCartId: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findBySeatAndCart: vi.fn(),
    delete: vi.fn(),
    deleteAllByCartId: vi.fn()
});
const makeSeatRepository = () => ({
    getSeatById: vi.fn(),
    updateManyStatus: vi.fn(),
    getSeats: vi.fn(),
    getSeatsByPublicationId: vi.fn(),
    createSeat: vi.fn(),
    updateSeat: vi.fn(),
    deleteSeat: vi.fn(),
    findPublicationBySeatId: vi.fn(),
});
describe("PurchaseService", () => {
    let purchaseRepo;
    let cartRepo;
    let cartItemRepo;
    let seatRepo;
    let purchaseService;
    beforeEach(() => {
        vi.clearAllMocks();
        purchaseRepo = makePurchaseRepository();
        cartRepo = makeShoppingCartRepository();
        cartItemRepo = makeShoppingCartItemRepository();
        seatRepo = makeSeatRepository();
        purchaseService = new PurchaseService(purchaseRepo, cartRepo, cartItemRepo, seatRepo);
    });
    describe("checkout", () => {
        it("deve lançar AppError 404 quando carrinho não existe", async () => {
            vi.mocked(cartRepo.findByUserId).mockResolvedValue(null);
            await expect(purchaseService.checkout(10)).rejects.toThrow(new AppError("Nenhum carrinho ativo encontrado", 404));
            expect(purchaseRepo.create).not.toHaveBeenCalled();
        });
        it("deve lançar AppError 400 quando carrinho está vazio", async () => {
            const cart = makeShoppingCart();
            vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
            vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([]);
            await expect(purchaseService.checkout(10)).rejects.toThrow(new AppError("Carrinho está vazio", 400));
            expect(purchaseRepo.create).not.toHaveBeenCalled();
        });
        it("deve lançar AppError 409 quando assento não está disponível", async () => {
            const cart = makeShoppingCart();
            const item = makeShoppingCartItem();
            const seat = makeSeat({ status: "RESERVED" });
            vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
            vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([item]);
            vi.mocked(seatRepo.getSeatById).mockResolvedValue(seat);
            await expect(purchaseService.checkout(10)).rejects.toThrow(new AppError(`Assento ${item.seatId} não está mais disponível`, 409));
            expect(seatRepo.updateManyStatus).not.toHaveBeenCalled();
            expect(purchaseRepo.create).not.toHaveBeenCalled();
        });
        it("deve lançar AppError 409 quando assento não existe", async () => {
            const cart = makeShoppingCart();
            const item = makeShoppingCartItem();
            vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
            vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([item]);
            vi.mocked(seatRepo.getSeatById).mockResolvedValue(null);
            await expect(purchaseService.checkout(10)).rejects.toThrow(new AppError(`Assento ${item.seatId} não está mais disponível`, 409));
            expect(seatRepo.updateManyStatus).not.toHaveBeenCalled();
            expect(purchaseRepo.create).not.toHaveBeenCalled();
        });
        it("deve criar compra com sucesso e retornar detalhes", async () => {
            const cart = makeShoppingCart();
            const item1 = makeShoppingCartItem({ seatId: 1 });
            const item2 = makeShoppingCartItem({ id: 2, seatId: 2 });
            const seat1 = makeSeat({ id: 1 });
            const seat2 = makeSeat({ id: 2 });
            const purchase = makePurchase();
            vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
            vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([item1, item2]);
            vi.mocked(seatRepo.getSeatById)
                .mockResolvedValueOnce(seat1)
                .mockResolvedValueOnce(seat2);
            vi.mocked(seatRepo.updateManyStatus).mockResolvedValue(undefined);
            vi.mocked(cartRepo.update).mockResolvedValue(null);
            vi.mocked(purchaseRepo.create).mockResolvedValue(purchase);
            const result = await purchaseService.checkout(10);
            expect(seatRepo.getSeatById).toHaveBeenCalledTimes(2);
            expect(seatRepo.updateManyStatus).toHaveBeenCalledWith([1, 2], "RESERVED");
            expect(cartRepo.update).toHaveBeenCalledWith(cart.id, { status: "CHECKED_OUT" });
            expect(purchaseRepo.create).toHaveBeenCalledWith({
                shoppingCartId: cart.id,
            });
            expect(result).toEqual({
                ...purchase,
                items: [item1, item2],
                totalPaid: cart.total.toString(),
            });
        });
        it("deve validar todos os assentos antes de criar compra", async () => {
            const cart = makeShoppingCart();
            const item1 = makeShoppingCartItem({ seatId: 1 });
            const item2 = makeShoppingCartItem({ id: 2, seatId: 2 });
            const seat1 = makeSeat({ id: 1 });
            vi.mocked(cartRepo.findByUserId).mockResolvedValue(cart);
            vi.mocked(cartItemRepo.findByCartId).mockResolvedValue([item1, item2]);
            vi.mocked(seatRepo.getSeatById)
                .mockResolvedValueOnce(seat1)
                .mockResolvedValueOnce(makeSeat({ id: 2, status: "SOLD" }));
            await expect(purchaseService.checkout(10)).rejects.toThrow(new AppError(`Assento ${item2.seatId} não está mais disponível`, 409));
            expect(seatRepo.updateManyStatus).not.toHaveBeenCalled();
            expect(purchaseRepo.create).not.toHaveBeenCalled();
        });
    });
    describe("findById", () => {
        it("deve retornar compra quando existe e pertence ao usuário", async () => {
            const purchase = makePurchase();
            const cart = makeShoppingCart({ userId: 10 });
            vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
            vi.mocked(cartRepo.findById).mockResolvedValue(cart);
            const result = await purchaseService.findById(1, 10);
            expect(result).toEqual(purchase);
        });
        it("deve lançar AppError 404 quando compra não existe", async () => {
            vi.mocked(purchaseRepo.findById).mockResolvedValue(null);
            await expect(purchaseService.findById(99, 10)).rejects.toThrow(new AppError("Compra não encontrada", 404));
            expect(cartRepo.findById).not.toHaveBeenCalled();
        });
        it("deve lançar AppError 403 quando carrinho não existe", async () => {
            const purchase = makePurchase();
            vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
            vi.mocked(cartRepo.findById).mockResolvedValue(null);
            await expect(purchaseService.findById(1, 10)).rejects.toThrow(new AppError("Acesso negado", 403));
        });
        it("deve lançar AppError 403 quando carrinho pertence a outro usuário", async () => {
            const purchase = makePurchase();
            const cart = makeShoppingCart({ userId: 99 });
            vi.mocked(purchaseRepo.findById).mockResolvedValue(purchase);
            vi.mocked(cartRepo.findById).mockResolvedValue(cart);
            await expect(purchaseService.findById(1, 10)).rejects.toThrow(new AppError("Acesso negado", 403));
        });
    });
});
//# sourceMappingURL=PurchaseService.test.js.map