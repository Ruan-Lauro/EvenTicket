export type PublicationStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CANCELLED";

export interface PublicationCreateData {
  externalEventId: string;
  local: string;
  date: Date | string;
  price: number;
  capacity: number;
  status: PublicationStatus;
  userId: number;
}

export interface PublicationUpdateData {
  externalEventId?: string;
  local?: string;
  date?: Date | string;
  price?: number;
  capacity?: number;
  status?: PublicationStatus;
  userId?: number;
}

export interface Publication {
  id: number;
  userId: number;
  externalEventId: string;
  name: string;
  local: string;
  capacity: number;
  description?: string | null;
  type: string;
  image: string | null;
  status: PublicationStatus;
  price: number;
  date: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SearchPublicationsParams {
  search?: string;
  gender?: string;
  recent?: boolean;
  page?: number;
  total?: number;
}

export interface Seat {
    id: number;
    publicationId: number;
    row: string;
    number: number;
    status: "AVAILABLE" | "RESERVED" | "SOLD";
    createdAt: Date;
    updatedAt: Date;
}
