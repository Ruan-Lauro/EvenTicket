import { prisma } from "../config/database.ts";
import type { IPublication, IPublicationCreate } from "../interfaces/publicationInterface.ts";
import type { IPublicationRepository } from "../interfaces/publicationRepositoryInterface.ts";

export class PublicationRepository implements IPublicationRepository {
    async getPublications() {
        return prisma.publication.findMany();
    }

    async getPublicationById(id: number) {
        return prisma.publication.findUnique({
            where: { id }
        });
    }

    async getPublicationByExternalEventId(externalEventId: string) {
        return prisma.publication.findFirst({
            where: { externalEventId }
        });
    }

    async createPublication(data: IPublicationCreate) {
        return prisma.publication.create({
            data
        });
    }

    async updatePublication(id: number, data: Partial<IPublication>) {
        return prisma.publication.update({
            where: { id },
            data
        });
    }

    async deletePublication(id: number) {
        await prisma.publication.delete({
            where: { id }
        });
    }
}