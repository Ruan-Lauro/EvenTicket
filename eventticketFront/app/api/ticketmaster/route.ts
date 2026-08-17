import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/services/ticketMasterService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 20);
    const genre = searchParams.get("genres") ?? "";
    const keyword = searchParams.get("keyword") ?? "";

    if (page < 0 || size <= 0) {
      return NextResponse.json(
        { error: "Página ou tamanho inválido" },
        { status: 400 }
      );
    }

    const events = await getEvents(page, size, genre, keyword);

    return NextResponse.json(events);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao buscar eventos" },
      { status: 500 }
    );
  }
}