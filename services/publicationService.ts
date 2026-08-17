import { apiFetch } from "@/lib/api";
import { Publication, PublicationCreateData, PublicationUpdateData, SearchPublicationsParams, Seat } from "@/types/publication";

function getFriendlyErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const errors = "errors" in payload ? payload.errors : undefined;

  if (Array.isArray(errors) && errors.length > 0) {
    const firstError = errors[0];

    if (firstError && typeof firstError === "object") {
      const field =
        "field" in firstError
          ? String(firstError.field).toLowerCase()
          : "";

      const message =
        "message" in firstError
          ? String(firstError.message)
          : "";

      if (
        field.includes("price") ||
        message.toLowerCase().includes("too small") ||
        message.toLowerCase().includes(">=0")
      ) {
        return "O preço deve ser maior ou igual a zero.";
      }

      if (
        field.includes("date") ||
        message.toLowerCase().includes("date") ||
        message.toLowerCase().includes("future")
      ) {
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

export async function getPublicationsApi(): Promise<Publication[]> {
  const response = await apiFetch("/publication", {
    method: "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(
      getFriendlyErrorMessage(payload) ??
        "Erro ao buscar publicações"
    );
  }

  return response.json();
}

export async function searchPublicationsApi(
  params: SearchPublicationsParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.gender) {
    searchParams.set("gender", params.gender);
  }

  if (params.recent !== undefined) {
    searchParams.set("recent", String(params.recent));
  }

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.total !== undefined) {
    searchParams.set("total", String(params.total));
  }

  const query = searchParams.toString();

  const response = await apiFetch(
    `/publication/search${ query ? `?${query}` : ""}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(
      getFriendlyErrorMessage(payload) ??
        "Erro ao buscar publicações"
    );
  }

  return response.json();
}

export async function getPublicationCategoriesApi() {
  const response = await apiFetch("/publication/categories", {
    method: "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(
      getFriendlyErrorMessage(payload) ??
        "Erro ao buscar categorias das publicações"
    );
  }

  return response.json();
}

export async function getPublicationsByUserIdApi(
  userId: number
): Promise<Publication[]> {
  const response = await apiFetch(`/publication/user/${userId}`, {
    method: "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(
      getFriendlyErrorMessage(payload) ??
        "Erro ao buscar publicações do usuário"
    );
  }

  return response.json();
}

export async function getPublicationByIdApi(
  id: number
): Promise<Publication> {
  const response = await apiFetch(`/publication/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(
      getFriendlyErrorMessage(payload) ??
        "Erro ao buscar publicação"
    );
  }

  return response.json();
}

export async function createPublicationApi(
  data: PublicationCreateData
): Promise<Publication> {
  const response = await apiFetch("/publication", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    const friendlyMessage =
      getFriendlyErrorMessage(payload) ??
      "Erro ao criar publicação do evento";

    throw new Error(friendlyMessage);
  }

  return response.json();
}

export async function updatePublicationApi(
  id: number,
  data: PublicationUpdateData
): Promise<Publication> {
  const response = await apiFetch(`/publication/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(
      getFriendlyErrorMessage(payload) ??
        "Erro ao atualizar publicação"
    );
  }

  return response.json();
}

export async function deletePublicationApi(
  id: number
): Promise<void> {
  const response = await apiFetch(`/publication/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(
      getFriendlyErrorMessage(payload) ??
        "Erro ao excluir publicação"
    );
  }
}

export async function getSeatPublicationByIdApi(
  id: number
): Promise<Seat[]>{
  const response = await apiFetch(`/publication/${id}/seats`, {
    method: "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(
      getFriendlyErrorMessage(payload) ??
        "Erro ao buscar publicação"
    );
  }

  return response.json();
}

export async function getPublicationBySeatIdApi(id:number): Promise<Publication> {
  const response = await apiFetch(`/publication/seat/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(
      getFriendlyErrorMessage(payload) ??
        "Erro ao buscar publicação"
    );
  }

  return response.json();
}