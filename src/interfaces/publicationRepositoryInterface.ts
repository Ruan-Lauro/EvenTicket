import type { IPublication, IPublicationCreate  } from "./publicationInterface.ts";


export interface IPublicationRepository {
    getPublications(): Promise<IPublication[]>;
    getPublicationById(id: number): Promise<IPublication | null>;
    getPublicationByExternalEventId(id: string): Promise<IPublication | null>;
    createPublication(data: IPublicationCreate): Promise<IPublication>;
    updatePublication(id: number, data: Partial<IPublication>): Promise<IPublication>;
    deletePublication(id: number): Promise<void>;
}