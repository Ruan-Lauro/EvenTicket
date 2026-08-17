import { apiFetch } from "@/lib/api";

import type {
  Purchase,
  PurchaseDetails,
  PurchaseApiError,
} from "@/types/purchase";

export async function checkoutApi(): Promise<Purchase> {
  const response = await apiFetch("/purchase/checkout", {
    method: "POST",
  });

  if (!response.ok) {
    const error: PurchaseApiError = await response.json();

    throw error;
  }

  return response.json();
}

export async function getPurchaseByIdApi(
  id: number
): Promise<PurchaseDetails> {
  const response = await apiFetch(`/purchase/${id}`);

  if (!response.ok) {
    const error: PurchaseApiError = await response.json();

    throw error;
  }

  return response.json();
}