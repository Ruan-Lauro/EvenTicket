
import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService.ts";
import {
    userSchemaUpdate,
    createUserWithRoleSchema,
    idParamSchema,
} from "../utils/validatorsUtil.ts";

export class UserController {

    private readonly userService: UserService;
    constructor(userService: UserService) {
        this.userService = userService;
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getUsers();
            return res.status(200).json(users);
        } catch (error) {
            return next(error);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const params = idParamSchema.parse(req.params);
            const user = await this.userService.getUserById(params.id);
            return res.status(200).json(user);
        } catch (error) {
            return next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const params = idParamSchema.parse(req.params);
            const data = userSchemaUpdate.parse(req.body);
            const updatedUser = await this.userService.updateUser(params.id, data);
            return res.status(200).json({
                message: "Usuário atualizado com sucesso",
                data: updatedUser,
            });
        } catch (error) {
            return next(error);
        }
    }

    async createUserWithRole(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createUserWithRoleSchema.parse(req.body);
            const newUser = await this.userService.createUserWithRole(data);
            return res.status(201).json({
                message: "Usuário criado com sucesso",
                data: newUser,
            });
        } catch (error) {
            return next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const params = idParamSchema.parse(req.params);
            await this.userService.deleteUser(params.id);
            return res.status(200).json({
                message: "Usuário deletado com sucesso",
            });
        } catch (error) {
            return next(error);
        }
    }
}