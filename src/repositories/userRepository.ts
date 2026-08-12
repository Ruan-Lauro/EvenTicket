import { prisma } from "../config/database.ts";
import type { IUserRepository } from "../interfaces/userRepositoryInterface.ts";

export class UserRepository implements IUserRepository {
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: {
                email,
            },
        });
    }

    async getUsers(){
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                createdAt: true,
            },
        });
    }

    async findById(id: number) {
        return prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                createdAt: true,
            },
        });
    }

    async create(data: {
        name: string;
        email: string;
        passwordHash: string;
    }) {
        return prisma.user.create({
            data,
        });
    }

    async createWithRole(data: {
        name: string;
        email: string;
        passwordHash: string;
        role: "USER" | "ADMIN" | "ORGANIZER" | "CONCIERGE";
    }) {
        return prisma.user.create({
            data: {
                ...data,
            },
        });
    }

    async update(id: number, data: {
        name?: string;
        email?: string;
        passwordHash?: string;
    }) {
        return prisma.user.update({ 
            where: {
                id,
            },
            data,
        });
    }

    async delete(id: number) {
         prisma.user.delete({
            where: {
                id,
            },
        });
    }
}