import type { Decimal } from "../generated/prisma/internal/prismaNamespace.ts";


export interface IPublication {
    id: number;
    userId: number;
    externalEventId: string;
    name: string;
    local: string;
    capacity: number;
    description?: string | null;
    type: string;
    image: string | null;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
    price: Decimal;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPublicationCreate {
    userId: number;
    externalEventId: string;
    name: string;
    local: string;
    capacity: number;
    description: string | null;
    type: string;
    image: string | null;
    date: Date;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
    price: Decimal;
}

export interface IPublicationCreateForOrganizer {
    userId: number;
    externalEventId: string;
    local: string;
    capacity: number;
    price: number;
    date: Date;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
}