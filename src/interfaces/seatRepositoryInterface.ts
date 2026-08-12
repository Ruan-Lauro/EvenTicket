import type { ISeat, ISeatCreate } from "./seatInterface.ts";

export interface ISeatRepository {
    getSeats(): Promise<ISeat[]>;
    getSeatById(id: number): Promise<ISeat | null>;
    getSeatsByPublicationId(publicationId: number): Promise<ISeat[]>;
    createSeat(data: ISeatCreate): Promise<ISeat>;
    updateSeat(id: number, data: Partial<ISeat>): Promise<ISeat>;
    deleteSeat(id: number): Promise<void>;
}