import bcrypt from "bcryptjs";
import {UserRepository} from "../repositories/userRepository.ts";
import { AppError } from "../errors/appError.ts";

const userRepository = new UserRepository();

export class UserService {
    async getUsers() {
        return userRepository.getUsers();
    }    

    async getUserById(id: number) {
        const user = await userRepository.findById(id);
        if(!user) throw new AppError("Usuário não encontrado", 404);
        return user;
    }

    async updateUser(id: number, data: { name?: string; email?: string; passwordHash?: string }) {
        const user = await userRepository.findById(id);
        if(!user) throw new AppError("Usuário não encontrado", 404);
        if(data.email){
            const existingUser = await userRepository.findByEmail(data.email);
            if (existingUser) {
                throw new AppError("Email já cadastrado", 400);
            }
        }

        const updatedUser = await userRepository.update(id, {
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
}