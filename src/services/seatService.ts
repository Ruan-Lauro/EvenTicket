import type { IPublicationRepository } from "../interfaces/publicationRepositoryInterface.ts";
import type { ISeatCreate } from "../interfaces/seatInterface.ts";
import type { ISeatRepository } from "../interfaces/seatRepositoryInterface.ts";
import { indexToRowLabel, resolveSeatsPerRow } from "../utils/seatUtils.ts";


export class SeatService {

    private seatRepository: ISeatRepository;

    constructor(seatRepository: ISeatRepository) {
        this.seatRepository = seatRepository;
    }

    async getSeats() {
        return this.seatRepository.getSeats();
    }

    async getSeatById(id: number) {
        const seat = await this.seatRepository.getSeatById(id);
        if(!seat) throw new Error("Assento não encontrado");
        return seat;
    }

    async getSeatsByPublicationId(publicationId: number) {
        return this.seatRepository.getSeatsByPublicationId(publicationId);
    }
    

    async createSeat(data: ISeatCreate) {
        return this.seatRepository.createSeat(data);
    }

    async updateSeat(id: number, data: Partial<ISeatCreate>) {
        const seat = await this.seatRepository.getSeatById(id);
        if(!seat) throw new Error("Assento não encontrado");
        return this.seatRepository.updateSeat(id, data);
    }
    

    async deleteSeat(id: number) { 
        const seat = await this.seatRepository.getSeatById(id);
        if(!seat) throw new Error("Assento não encontrado");
        return this.seatRepository.deleteSeat(id);
    }

    async generateSeatsForPublication(publicationId: number, capacity: number): Promise<void> {
        const seatsPerRow = resolveSeatsPerRow(capacity);
        const seats: ISeatCreate[] = [];

        let remaining = capacity;
        let rowIndex = 0;

        while (remaining > 0) {
            const row = indexToRowLabel(rowIndex);
            const countInThisRow = Math.min(seatsPerRow, remaining);

            for (let num = 1; num <= countInThisRow; num++) {
                seats.push({
                    publicationId,
                    row,
                    number: num,
                    status: "AVAILABLE",
                });
            }

            remaining -= countInThisRow;
            rowIndex++;
        }

        await Promise.all(seats.map((seat) => this.seatRepository.createSeat(seat)));
    }

}