import { apiFetch } from "@/lib/api";

import type {
  Ticket,
  TicketApiError,
} from "@/types/ticket";

export async function getTicketsByPurchaseIdApi(
  purchaseId: number
): Promise<Ticket[]> {
  const response = await apiFetch(
    `/purchases/${purchaseId}/tickets`
  );

  if (!response.ok) {
    const error: TicketApiError = await response.json();

    throw error;
  }

  return response.json();
}

export async function getTicketByCodeApi(
  code: string
): Promise<Ticket> {
  const response = await apiFetch(
    `/tickets/${code}`
  );

  if (!response.ok) {
    const error: TicketApiError = await response.json();

    throw error;
  }

  return response.json();
}

export async function validateTicketApi(
  code: string
): Promise<Ticket> {
  const response = await apiFetch(
    `/tickets/${code}/validate`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    const error: TicketApiError = await response.json();

    throw error;
  }

  return response.json();
}