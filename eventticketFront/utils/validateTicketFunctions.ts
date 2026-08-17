import { Ticket } from "@/types/ticket";
import { ErrorKind } from "@/types/validateTicket";

export function classifyError(err: unknown, ticket?: Ticket): { kind: ErrorKind; message: string } {
  if (ticket) {
    const s = ticket.type?.toLowerCase();
    if (s === "used")
      return { kind: "already_used", message: "Este ingresso já foi utilizado." };
    if (s === "cancelled")
      return { kind: "cancelled", message: "Este ingresso foi cancelado." };
  }

  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const status = Number(e.status ?? e.statusCode ?? 0);
    const msg = String(e.message ?? e.error ?? "");

    if (status === 404 || msg.toLowerCase().includes("not found"))
      return { kind: "not_found", message: "Ingresso não encontrado." };
    if (status === 409 || msg.toLowerCase().includes("already") || msg.toLowerCase().includes("used"))
      return { kind: "already_used", message: "Este ingresso já foi utilizado." };
    if (msg.toLowerCase().includes("cancel"))
      return { kind: "cancelled", message: "Este ingresso foi cancelado." };
    if (msg) return { kind: "unknown", message: msg };
  }

  return { kind: "unknown", message: "Erro ao processar o ingresso. Tente novamente." };
}
