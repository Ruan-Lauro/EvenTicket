import { NextResponse, NextRequest } from "next/server";
import { getEventById } from "@/services/ticketMasterService";


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const event = await getEventById(id);

    if (!event) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao buscar evento" },
      { status: 500 }
    );
  }
}