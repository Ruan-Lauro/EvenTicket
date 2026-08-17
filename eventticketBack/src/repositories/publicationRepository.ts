import { prisma } from "../config/database.ts";
import { Prisma } from "../generated/prisma/client.ts";
import type { IPublication, IPublicationCreate } from "../interfaces/publicationInterface.ts";
import type {
    IPublicationRepository,
    ISearchPublicationsFilters,
} from "../interfaces/publicationRepositoryInterface.ts";

export class PublicationRepository implements IPublicationRepository {
    async getPublications() {
        return prisma.publication.findMany({
            orderBy: { createdAt: "desc" },
        });
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

    async searchPublications({
        search,
        gender,
        recent,
        page = 1,
        total = 10,
    }: ISearchPublicationsFilters) {
        const safePage = Math.max(1, Number(page) || 1);
        const safeTotal = Math.max(1, Number(total) || 10);

        const where: Prisma.PublicationWhereInput = {
            ...(search
                ? {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            local: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            type: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            description: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }
                : {}),

            ...(gender
                ? {
                    type: {
                        contains: gender,
                        mode: "insensitive",
                    },
                }
                : {}),
        };

        const [data, totalItems] = await Promise.all([
            prisma.publication.findMany({
                where,
                orderBy: recent
                    ? [
                        { createdAt: "desc" },
                        { date: "asc" },
                    ]
                    : [{ date: "asc" }],
                skip: (safePage - 1) * safeTotal,
                take: safeTotal,
            }),

            prisma.publication.count({
                where,
            }),
        ]);

        const totalPages = Math.max(
            1,
            Math.ceil(totalItems / safeTotal)
        );

        return {
            data,
            totalItems,
            totalPages,
            page: safePage,
            total: totalItems,
        };
    }

    async getPublicationCategories() {
        const categories = await prisma.publication.groupBy({
            by: ["type"],
        });

        return categories
            .map((category) => category.type)
            .sort((a, b) => a.localeCompare(b));
    }

    async getPublicationsByUserId(userId: number) {
        return prisma.publication.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
}