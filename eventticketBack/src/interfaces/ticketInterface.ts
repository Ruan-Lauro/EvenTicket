import type { Decimal } from "@prisma/client/runtime/client";

export interface ITicket {
    id: number;
    purchaseId: number;
    publicationId: number;
    seatId: number;
    code: string;
    value: Decimal;
    type: string;
    shareLink: string | null;
    usedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITicketCreate {
    purchaseId: number;
    publicationId: number;
    seatId: number;
    code: string;
    value: Decimal;
    type: string;
    shareLink?: string;
}