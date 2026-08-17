import type { Decimal } from "@prisma/client/runtime/client";
import type { ISeat, ISeatCreate } from "./seatInterface.ts";

export interface ISeatRepository {
    getSeats(): Promise<ISeat[]>;
    getSeatById(id: number): Promise<ISeat | null>;
    getSeatsByPublicationId(publicationId: number): Promise<ISeat[]>;
    createSeat(data: ISeatCreate): Promise<ISeat>;
    updateSeat(id: number, data: Partial<ISeat>): Promise<ISeat>;
    deleteSeat(id: number): Promise<void>;
    findPublicationBySeatId(seatId: number): Promise<{ price: Decimal } | null>;
    updateManyStatus(seatIds: number[], status: "AVAILABLE" | "RESERVED" | "SOLD"): Promise<void>;
}