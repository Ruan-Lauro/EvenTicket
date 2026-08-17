import type { IPublication, IPublicationCreate  } from "./publicationInterface.ts";


export interface ISearchPublicationsFilters {
    search?: string;
    gender?: string;
    recent?: boolean;
    page?: number;
    total?: number;
}

export interface ISearchPublicationsResult {
    data: IPublication[];
    totalItems: number;
    totalPages: number;
    page: number;
    total: number;
}

export interface IPublicationRepository {
    getPublications(): Promise<IPublication[]>;
    getPublicationById(id: number): Promise<IPublication | null>;
    getPublicationByExternalEventId(id: string): Promise<IPublication | null>;
    createPublication(data: IPublicationCreate): Promise<IPublication>;
    updatePublication(id: number, data: Partial<IPublication>): Promise<IPublication>;
    deletePublication(id: number): Promise<void>;
    searchPublications(filters: ISearchPublicationsFilters): Promise<ISearchPublicationsResult>;
    getPublicationCategories(): Promise<string[]>;
    getPublicationsByUserId(userId: number): Promise<IPublication[]>;
}