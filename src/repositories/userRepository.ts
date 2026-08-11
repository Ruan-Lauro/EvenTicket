import { prisma } from "../config/database.ts";

export class UserRepository {
    async findByEmail(email: string) {
        return prisma.user.findUnique({
        where: {
            email,
        },
        });
    }

    async getUsers(){
        return prisma.user.findMany();
    }

    async findById(id: number) {
        return prisma.user.findUnique({
            where: {
                id,
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
}