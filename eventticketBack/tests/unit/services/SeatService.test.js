import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeatService } from "../../../src/services/seatService.js";
import * as seatUtils from "../../../src/utils/seatUtils.js";
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
const makeSeatRepository = () => ({
    getSeats: vi.fn(),
    getSeatById: vi.fn(),
    getSeatsByPublicationId: vi.fn(),
    createSeat: vi.fn(),
    updateSeat: vi.fn(),
    deleteSeat: vi.fn(),
    findPublicationBySeatId: vi.fn(),
    updateManyStatus: vi.fn(),
});
describe("SeatService", () => {
    let seatRepo;
    let seatService;
    beforeEach(() => {
        vi.clearAllMocks();
        seatRepo = makeSeatRepository();
        seatService = new SeatService(seatRepo);
    });
    describe("getSeats", () => {
        it("deve retornar todos os assentos", async () => {
            const seats = [
                makeSeat(),
                makeSeat({ id: 2, row: "A", number: 2 }),
                makeSeat({ id: 3, row: "B", number: 1 }),
            ];
            vi.mocked(seatRepo.getSeats).mockResolvedValue(seats);
            const result = await seatService.getSeats();
            expect(result).toEqual(seats);
            expect(seatRepo.getSeats).toHaveBeenCalledOnce();
        });
        it("deve retornar lista vazia quando não há assentos", async () => {
            vi.mocked(seatRepo.getSeats).mockResolvedValue([]);
            const result = await seatService.getSeats();
            expect(result).toEqual([]);
        });
    });
    describe("getSeatById", () => {
        it("deve retornar assento quando existe", async () => {
            const seat = makeSeat();
            vi.mocked(seatRepo.getSeatById).mockResolvedValue(seat);
            const result = await seatService.getSeatById(1);
            expect(result).toEqual(seat);
            expect(seatRepo.getSeatById).toHaveBeenCalledWith(1);
        });
        it("deve lançar erro quando assento não existe", async () => {
            vi.mocked(seatRepo.getSeatById).mockResolvedValue(null);
            await expect(seatService.getSeatById(99)).rejects.toThrow("Assento não encontrado");
        });
    });
    describe("getSeatsByPublicationId", () => {
        it("deve retornar assentos da publicação", async () => {
            const seats = [
                makeSeat({ publicationId: 1 }),
                makeSeat({ id: 2, publicationId: 1, row: "A", number: 2 }),
            ];
            vi.mocked(seatRepo.getSeatsByPublicationId).mockResolvedValue(seats);
            const result = await seatService.getSeatsByPublicationId(1);
            expect(result).toEqual(seats);
            expect(seatRepo.getSeatsByPublicationId).toHaveBeenCalledWith(1);
        });
        it("deve retornar lista vazia quando publicação não tem assentos", async () => {
            vi.mocked(seatRepo.getSeatsByPublicationId).mockResolvedValue([]);
            const result = await seatService.getSeatsByPublicationId(99);
            expect(result).toEqual([]);
        });
    });
    describe("createSeat", () => {
        it("deve criar assento com sucesso", async () => {
            const seatData = {
                publicationId: 1,
                row: "A",
                number: 1,
                status: "AVAILABLE",
            };
            const createdSeat = makeSeat();
            vi.mocked(seatRepo.createSeat).mockResolvedValue(createdSeat);
            const result = await seatService.createSeat(seatData);
            expect(result).toEqual(createdSeat);
            expect(seatRepo.createSeat).toHaveBeenCalledWith(seatData);
        });
        it("deve criar múltiplos assentos", async () => {
            const seatData = {
                publicationId: 1,
                row: "B",
                number: 5,
                status: "AVAILABLE",
            };
            const createdSeat = makeSeat({ row: "B", number: 5 });
            vi.mocked(seatRepo.createSeat).mockResolvedValue(createdSeat);
            const result = await seatService.createSeat(seatData);
            expect(result).toEqual(createdSeat);
        });
    });
    describe("updateSeat", () => {
        it("deve atualizar assento quando existe", async () => {
            const existingSeat = makeSeat();
            const updatedData = { status: "RESERVED" };
            const updatedSeat = makeSeat({ status: "RESERVED" });
            vi.mocked(seatRepo.getSeatById).mockResolvedValue(existingSeat);
            vi.mocked(seatRepo.updateSeat).mockResolvedValue(updatedSeat);
            const result = await seatService.updateSeat(1, updatedData);
            expect(result).toEqual(updatedSeat);
            expect(seatRepo.updateSeat).toHaveBeenCalledWith(1, updatedData);
        });
        it("deve lançar erro quando assento não existe", async () => {
            vi.mocked(seatRepo.getSeatById).mockResolvedValue(null);
            await expect(seatService.updateSeat(99, { status: "RESERVED" })).rejects.toThrow("Assento não encontrado");
            expect(seatRepo.updateSeat).not.toHaveBeenCalled();
        });
        it("deve permitir atualização parcial do assento", async () => {
            const existingSeat = makeSeat();
            const partialUpdate = { number: 5 };
            const updatedSeat = makeSeat({ number: 5 });
            vi.mocked(seatRepo.getSeatById).mockResolvedValue(existingSeat);
            vi.mocked(seatRepo.updateSeat).mockResolvedValue(updatedSeat);
            const result = await seatService.updateSeat(1, partialUpdate);
            expect(result).toEqual(updatedSeat);
            expect(seatRepo.updateSeat).toHaveBeenCalledWith(1, partialUpdate);
        });
    });
    describe("deleteSeat", () => {
        it("deve deletar assento quando existe", async () => {
            const seat = makeSeat();
            vi.mocked(seatRepo.getSeatById).mockResolvedValue(seat);
            vi.mocked(seatRepo.deleteSeat).mockResolvedValue(undefined);
            await seatService.deleteSeat(1);
            expect(seatRepo.deleteSeat).toHaveBeenCalledWith(1);
        });
        it("deve lançar erro quando assento não existe", async () => {
            vi.mocked(seatRepo.getSeatById).mockResolvedValue(null);
            await expect(seatService.deleteSeat(99)).rejects.toThrow("Assento não encontrado");
            expect(seatRepo.deleteSeat).not.toHaveBeenCalled();
        });
    });
    describe("generateSeatsForPublication", () => {
        beforeEach(() => {
            vi.spyOn(seatUtils, "resolveSeatsPerRow").mockReturnValue(10);
            vi.spyOn(seatUtils, "indexToRowLabel").mockImplementation((index) => {
                const labels = [
                    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
                ];
                return labels[index] || `Row${index}`;
            });
        });
        it("deve gerar assentos para publicação com capacidade menor que assentos por fileira", async () => {
            vi.mocked(seatRepo.createSeat).mockResolvedValue(makeSeat());
            await seatService.generateSeatsForPublication(1, 5);
            expect(seatRepo.createSeat).toHaveBeenCalledTimes(5);
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(1, {
                publicationId: 1,
                row: "A",
                number: 1,
                status: "AVAILABLE",
            });
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(5, {
                publicationId: 1,
                row: "A",
                number: 5,
                status: "AVAILABLE",
            });
        });
        it("deve gerar assentos para múltiplas fileiras quando capacidade excede assentos por fileira", async () => {
            vi.mocked(seatRepo.createSeat).mockResolvedValue(makeSeat());
            await seatService.generateSeatsForPublication(1, 25);
            expect(seatRepo.createSeat).toHaveBeenCalledTimes(25);
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(1, {
                publicationId: 1,
                row: "A",
                number: 1,
                status: "AVAILABLE",
            });
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(10, {
                publicationId: 1,
                row: "A",
                number: 10,
                status: "AVAILABLE",
            });
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(11, {
                publicationId: 1,
                row: "B",
                number: 1,
                status: "AVAILABLE",
            });
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(20, {
                publicationId: 1,
                row: "B",
                number: 10,
                status: "AVAILABLE",
            });
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(21, {
                publicationId: 1,
                row: "C",
                number: 1,
                status: "AVAILABLE",
            });
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(25, {
                publicationId: 1,
                row: "C",
                number: 5,
                status: "AVAILABLE",
            });
        });
        it("deve gerar assentos com capacidade exata", async () => {
            vi.mocked(seatRepo.createSeat).mockResolvedValue(makeSeat());
            await seatService.generateSeatsForPublication(2, 20);
            expect(seatRepo.createSeat).toHaveBeenCalledTimes(20);
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(10, {
                publicationId: 2,
                row: "A",
                number: 10,
                status: "AVAILABLE",
            });
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(20, {
                publicationId: 2,
                row: "B",
                number: 10,
                status: "AVAILABLE",
            });
        });
        it("deve gerar assento único", async () => {
            vi.mocked(seatRepo.createSeat).mockResolvedValue(makeSeat());
            await seatService.generateSeatsForPublication(3, 1);
            expect(seatRepo.createSeat).toHaveBeenCalledTimes(1);
            expect(seatRepo.createSeat).toHaveBeenCalledWith({
                publicationId: 3,
                row: "A",
                number: 1,
                status: "AVAILABLE",
            });
        });
        it("deve gerar assentos para grande capacidade", async () => {
            vi.mocked(seatRepo.createSeat).mockResolvedValue(makeSeat());
            await seatService.generateSeatsForPublication(1, 100);
            expect(seatRepo.createSeat).toHaveBeenCalledTimes(100);
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(1, {
                publicationId: 1,
                row: "A",
                number: 1,
                status: "AVAILABLE",
            });
            expect(seatRepo.createSeat).toHaveBeenNthCalledWith(100, {
                publicationId: 1,
                row: "J",
                number: 10,
                status: "AVAILABLE",
            });
        });
    });
});
//# sourceMappingURL=SeatService.test.js.map