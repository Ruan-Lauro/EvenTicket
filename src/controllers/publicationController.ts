import type { Request, Response } from "express";
import { AppError } from "../errors/appError.ts";
import type { PublicationService } from "../services/publicationService.ts";
import {
    publicationCreateSchema,
    publicationUpdateSchema,
    idParamSchema,
} from "../utils/validatorsUtil.ts";

export class PublicationController {

    private readonly publicationService: PublicationService;
    constructor(publicationService: PublicationService) {
    this.publicationService = publicationService;
    }

    async getPublications(req: Request, res: Response) {
        try {
            const publications = await this.publicationService.getPublications();
            return res.status(200).json(publications);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            console.error(error);

            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async getPublicationById(req: Request, res: Response) {
        try {
            const params = idParamSchema.parse(req.params);
            const publication = await this.publicationService.getPublicationById(params.id);
            return res.status(200).json(publication);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            console.error(error);

            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async createPublication(req: Request, res: Response) {
        try {
            const data = publicationCreateSchema.parse(req.body);
            const publication = await this.publicationService.createPublication(data);
            return res.status(201).json(publication);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            console.error(error);

            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async updatePublication(req: Request, res: Response) {
        try {
            const params = idParamSchema.parse(req.params);
            const data = publicationUpdateSchema.parse(req.body);
            const publication = await this.publicationService.updatePublication(params.id, data);
            return res.status(200).json(publication);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            console.error(error);

            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async deletePublication(req: Request, res: Response) {
        try {
            const params = idParamSchema.parse(req.params);
            await this.publicationService.deletePublication(params.id);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            console.error(error);

            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

}