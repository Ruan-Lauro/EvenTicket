import type {
  TicketMasterEvent,
  TicketMasterResponse,
  Classification,
  ClassificationsResponse,
} from "@/types/ticketmaster";

const TICKETMASTER_API_URL =
  "https://app.ticketmaster.com/discovery/v2";

const apiKey = process.env.TICKETMASTER_API_KEY;

if (!apiKey) {
  throw new Error("TICKETMASTER_API_KEY não configurada");
}

export async function getEvents(
  page = 0,
  size = 20,
  genres: string,
  keyword: string,
): Promise<TicketMasterResponse> {
  const params = new URLSearchParams({
    apikey: apiKey!,
    page: page.toString(),
    size: size.toString(),
    classificationName: genres,
    keyword: keyword,
  });

  const response = await fetch(
    `${TICKETMASTER_API_URL}/events.json?${params}`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar eventos no Ticketmaster");
  }

  return response.json();
}

export async function getEventById(
  id: string
): Promise<TicketMasterEvent | null> {
  const params = new URLSearchParams({
    apikey: apiKey!,
  });

  const response = await fetch(
    `${TICKETMASTER_API_URL}/events/${id}.json?${params}`
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar evento no Ticketmaster");
  }

  return response.json();
}

export async function getClassifications(): Promise<ClassificationsResponse> {
  const params = new URLSearchParams({
    apikey: apiKey!,
  });

  const response = await fetch(
    `${TICKETMASTER_API_URL}/classifications.json?${params}&size=50`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar classificações");
  }

  const data = await response.json();

  return {
    classifications: data._embedded?.classifications ?? [],
    page: data.page,
    size: data.size,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
  };
}