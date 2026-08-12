import bcrypt from "bcryptjs";
import type { IUserRepository } from "../interfaces/userRepositoryInterface.ts";
import { AppError } from "../errors/appError.ts";

export class UserService {

    private readonly userRepo: IUserRepository;
    
    constructor(userRepo: IUserRepository) {
        this.userRepo = userRepo;
    }

    async getUsers() {
        return this.userRepo.getUsers();
    }    

    async getUserById(id: number) {
        const user = await this.userRepo.findById(id);
        if(!user) throw new AppError("Usuário não encontrado", 404);
        return user;
    }

    async updateUser(id: number, data: { name?: string; email?: string; passwordHash?: string }) {
        const user = await this.userRepo.findById(id);
        if(!user) throw new AppError("Usuário não encontrado", 404);
        if(data.email){
            const existingUser = await this.userRepo.findByEmail(data.email);
            if (existingUser) {
                throw new AppError("Email já cadastrado", 400);
            }
        }

        const updatedUser = await this.userRepo.update(id, {
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash? await bcrypt.hash(data.passwordHash, 12) : data.passwordHash,
        });

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        };
    }

    async createUserWithRole(data: { name: string; email: string; passwordHash: string; role: "USER" | "ADMIN" | "ORGANIZER" | "CONCIERGE" }) {
        const existingUser = await this.userRepo.findByEmail(data.email);
        if (existingUser) {
            throw new AppError("Email já cadastrado", 400);
        }
         const passwordHash = await bcrypt.hash(data.passwordHash, 12);
        
        const user = await this.userRepo.createWithRole({
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role,
        });
    
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }

    async deleteUser(id: number) {
        const user = await this.userRepo.findById(id);
        if(!user) throw new AppError("Usuário não encontrado", 404);
        await this.userRepo.delete(id);
    }
}