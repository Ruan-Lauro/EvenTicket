export interface ISeat {
    id: number;
    publicationId: number;
    row: string;
    number: number;
    status: "AVAILABLE" | "RESERVED" | "SOLD";
    createdAt: Date;
    updatedAt: Date;
}

export interface ISeatCreate {
    publicationId: number;
    row: string;
    number: number;
    status: "AVAILABLE" | "RESERVED" | "SOLD";
}