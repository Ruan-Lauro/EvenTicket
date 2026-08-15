import { apiFetch } from "@/lib/api";

export interface PublicationCreateData {
  externalEventId: string;
  local: string;
  date: Date | string;
  price: number;
  capacity: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  userId: number;
}

function getFriendlyErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const errors = "errors" in payload ? payload.errors : undefined;

  if (Array.isArray(errors) && errors.length > 0) {
    const firstError = errors[0];

    if (firstError && typeof firstError === "object") {
      const field = "field" in firstError ? String(firstError.field).toLowerCase() : "";
      const message = "message" in firstError ? String(firstError.message) : "";

      if (field.includes("price") || message.toLowerCase().includes("too small") || message.toLowerCase().includes(">=0")) {
        return "O preço deve ser maior ou igual a zero.";
      }

      if (field.includes("date") || message.toLowerCase().includes("date") || message.toLowerCase().includes("future")) {
        return "A data e hora do evento devem ser no futuro.";
      }

      if (message) {
        return message;
      }
    }
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return null;
}

export async function createPublicationApi(data: PublicationCreateData) {
  const response = await apiFetch("/publication", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const friendlyMessage = getFriendlyErrorMessage(payload) ?? "Erro ao criar publicação do evento";

    throw new Error(friendlyMessage);
  }

  return response.json();
}