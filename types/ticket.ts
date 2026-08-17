export interface Ticket {
  id: number;
  purchaseId: number;
  publicationId: number;
  seatId: number;
  code: string;
  value: number;
  type: string;
  shareLink: string | null;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketApiError {
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}