import { NextResponse } from "next/server";
import { getClassifications } from "@/services/ticketMasterService";

export async function GET() {
  try {
    const classifications = await getClassifications();

    return NextResponse.json(classifications);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao buscar classificações" },
      { status: 500 }
    );
  }
}