import type { Request, Response, NextFunction } from "express";
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

    async getPublications(req: Request, res: Response, next: NextFunction) {
        try {
            const publications = await this.publicationService.getPublications();
            return res.status(200).json(publications);
        } catch (error) {
            return next(error);
        }
    }

    async searchPublications(req: Request, res: Response, next: NextFunction) {
        try {
            const page = Number(req.query.page ?? 1);
            const total = Number(req.query.total ?? 10);
            const search = typeof req.query.search === "string" ? req.query.search : undefined;
            const gender = typeof req.query.gender === "string" ? req.query.gender : undefined;
            const recent = req.query.recent === "true" || req.query.recent === "1";

            const result = await this.publicationService.searchPublications({
                search,
                gender,
                recent,
                page,
                total,
            });

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async getPublicationCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await this.publicationService.getPublicationCategories();
            return res.status(200).json(categories);
        } catch (error) {
            return next(error);
        }
    }

    async getPublicationsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const params = idParamSchema.parse(req.params);
            const publications = await this.publicationService.getPublicationsByUserId(params.id);
            return res.status(200).json(publications);
        } catch (error) {
            return next(error);
        }
    }

    async getPublicationById(req: Request, res: Response, next: NextFunction) {
        try {
            const params = idParamSchema.parse(req.params);
            const publication = await this.publicationService.getPublicationById(params.id);
            return res.status(200).json(publication);
        } catch (error) {
            return next(error);
        }
    }

    async createPublication(req: Request, res: Response, next: NextFunction) {
        try {
            const data = publicationCreateSchema.parse(req.body);
            const publication = await this.publicationService.createPublication(data);
            return res.status(201).json(publication);
        } catch (error) {
            return next(error);
        }
    }

    async updatePublication(req: Request, res: Response, next: NextFunction) {
        try {
            const params = idParamSchema.parse(req.params);
            const data = publicationUpdateSchema.parse(req.body);
            const publication = await this.publicationService.updatePublication(params.id, data);
            return res.status(200).json(publication);
        } catch (error) {
            return next(error);
        }
    }

    async deletePublication(req: Request, res: Response, next: NextFunction) {
        try {
            const params = idParamSchema.parse(req.params);
            await this.publicationService.deletePublication(params.id);
            return res.status(204).send();
        } catch (error) {
            return next(error);
        }
    }

}