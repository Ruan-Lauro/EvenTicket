
import type { Request, Response } from "express";
import { UserService } from "../services/userService.ts";
import {
  userSchemaUpdate,
  createUserWithRoleSchema
} from "../utils/validatorsUtil.ts";

export class UserController {

    private readonly userService: UserService;
    constructor(userService: UserService) {
        this.userService = userService;
    }

    async getUsers(req: Request, res: Response) {
        const users = await this.userService.getUsers();
        return res.status(200).json(users);
    }

    async getUserById(req: Request, res: Response) {
        const id = Number(req.params.id);
        const user = await this.userService.getUserById(id);
        return res.status(200).json(user);
    }

    async updateUser(req: Request, res: Response) {
        const id = Number(req.params.id);
        const data = userSchemaUpdate.parse(req.body);
        const updatedUser = await this.userService.updateUser(id, data);
        return res.status(200).json({
            mensagem: "Usuário atualizado com sucesso",
            data: updatedUser
        });
    }

    async createUserWithRole(req: Request, res: Response) {
        const data = createUserWithRoleSchema.parse(req.body);
        const newUser = await this.userService.createUserWithRole(data);
        return res.status(201).json({
            mensagem: "Usuário criado com sucesso",
            data: newUser
        });
    }

    async deleteUser(req: Request, res: Response) {
        const id = Number(req.params.id);
        await this.userService.deleteUser(id);
        return res.status(200).json({
            mensagem: "Usuário deletado com sucesso"
        });
    }
}