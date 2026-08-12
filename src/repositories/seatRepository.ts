import { prisma } from "../config/database.ts";
import type { ISeat, ISeatCreate } from "../interfaces/seatInterface.ts";
import type { ISeatRepository } from "../interfaces/seatRepositoryInterface.ts";

export class SeatRepository implements ISeatRepository {

    async getSeats() {
        return prisma.seat.findMany();
    }

    async getSeatById(id: number) {
        return prisma.seat.findUnique({
            where: { id },
        });
    }

    async getSeatsByPublicationId(publicationId: number) {
        return prisma.seat.findMany({
            where: { publicationId },
        });
    }

    async createSeat(data: ISeatCreate) {
        return prisma.seat.create({
            data,
        });
    }

    async updateSeat(id: number, data: Partial<ISeat>) {
        return prisma.seat.update({
            where: { id },
            data,
        });
    }

    async deleteSeat(id: number) {
        await prisma.seat.delete({
            where: { id },
        });
    }

}