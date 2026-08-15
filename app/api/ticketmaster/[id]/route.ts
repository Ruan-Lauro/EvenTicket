import { NextResponse } from "next/server";
import { getEventById } from "@/services/ticketMasterService";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  { params }: Props
) {
  try {
    const { id } = await params;

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