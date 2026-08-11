
import type { Request, Response } from "express";
import { UserService } from "../services/userService.ts";

const userService = new UserService();

export class UserController {
    async getUsers(req: Request, res: Response) {
        const users = await userService.getUsers();
        return res.status(200).json(users);
    }

    async getUserById(req: Request, res: Response) {
        const id = Number(req.params.id);
        const user = await userService.getUserById(id);
        return res.status(200).json(user);
    }

    async updateUser(req: Request, res: Response) {
        const id = Number(req.params.id);
        const data = req.body;
        const updatedUser = await userService.updateUser(id, data);
        return res.status(200).json({
            mensagem: "Usuário atualizado com sucesso",
            data: updatedUser
        });
    }
}