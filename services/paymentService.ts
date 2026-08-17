import { apiFetch } from "@/lib/api";

import type {
  Payment,
  PaymentInitiateData,
  PaymentApiError,
} from "@/types/payment";

export async function initiatePaymentApi(
  purchaseId: number,
  data: PaymentInitiateData
): Promise<Payment> {
  const response = await apiFetch(
    `/payment/${purchaseId}/payment`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error: PaymentApiError = await response.json();

    throw error;
  }

  return response.json();
}

export async function cancelPaymentApi(
  purchaseId: number
): Promise<void> {
  const response = await apiFetch(
    `/payment/${purchaseId}/payment`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error: PaymentApiError = await response.json();

    throw error;
  }
}

export async function getPaymentByPurchaseIdApi(
  purchaseId: number
): Promise<Payment | null> {
  const response = await apiFetch(
    `/payment/${purchaseId}/payment`
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}