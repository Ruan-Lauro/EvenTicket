import type {
    IPublicationRepository,
    ISearchPublicationsFilters,
} from "../interfaces/publicationRepositoryInterface.ts";
import type { IPublicationCreateForOrganizer} from "../interfaces/publicationInterface.ts";
import { AppError } from "../errors/appError.ts";
import { Decimal } from "@prisma/client/runtime/client";
import type { SeatService } from "./seatService.ts";

export class PublicationService {
    
    private publicationRepository: IPublicationRepository;
    private seatService: SeatService;
    
    constructor(publicationRepository: IPublicationRepository, seatService: SeatService) {
        this.publicationRepository = publicationRepository;
        this.seatService = seatService;
    }

    async getPublications() {
        return this.publicationRepository.getPublications();
    }

    async getPublicationById(id: number) {
        const publication = await this.publicationRepository.getPublicationById(id);
        if (!publication) throw new AppError("Publicação não encontrada", 404);
        return publication;
    }

    async searchPublications(filters: ISearchPublicationsFilters = {}) {
        return this.publicationRepository.searchPublications(filters);
    }

    async getPublicationCategories() {
        return this.publicationRepository.getPublicationCategories();
    }

    async getPublicationsByUserId(userId: number) {
        return this.publicationRepository.getPublicationsByUserId(userId);
    }

    async getPublicationBySeatId(seatId: number) {
        const seat = await this.seatService.getSeatById(seatId);
        const publication = await this.publicationRepository.getPublicationById(seat.publicationId);
        if (!publication) throw new AppError("Publicação não encontrada", 404);
        return publication;
    }

    async getSeatsByPublicationId(publicationId: number) {
        return this.seatService.getSeatsByPublicationId(publicationId);
    }

    async createPublication(data: IPublicationCreateForOrganizer) {
        const findEvent = await this.findByIdTicketMaster(data.externalEventId);
        if (!findEvent) throw new AppError("Evento não encontrado na TicketMaster", 404);
        const findPublication = await this.publicationRepository.getPublicationByExternalEventId(data.externalEventId);
        if (findPublication) throw new AppError("Publicação já existe para este evento", 400);

        const publication = await this.publicationRepository.createPublication({
            userId: data.userId,
            externalEventId: data.externalEventId,
            name: findEvent.name,
            local: data.local,
            capacity: data.capacity,
            description: findEvent.info || null,
            type: findEvent.classifications[0].segment.name,
            image: findEvent.images[0].url || null,
            status: data.status,
            price: new Decimal(data.price),
            date: data.date,
        });
 
        await this.seatService.generateSeatsForPublication(publication.id, data.capacity);
 
        return publication;
    }

    async updatePublication(id: number, data: Partial<IPublicationCreateForOrganizer>) {
        const publication = await this.publicationRepository.getPublicationById(id);
        if (!publication) throw new AppError("Publicação não encontrada", 404);
        return this.publicationRepository.updatePublication(id, {...data, price: data.price ? new Decimal(data.price) : undefined});
    }

    async deletePublication(id: number) {
        const publication = await this.publicationRepository.getPublicationById(id);
        if (!publication) throw new AppError("Publicação não encontrada", 404);
        return this.publicationRepository.deletePublication(id);
    }

    async findByIdTicketMaster(id: string) {
        const apiKey = process.env.TICKETMASTER_API_KEY;

        const url =
        `https://app.ticketmaster.com/discovery/v2/events/${id}.json` +
        `?apikey=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        return response.json();
    }

}