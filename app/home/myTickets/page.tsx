"use client";

import MainPage from "@/components/main";
import Hero from "@/components/hero";
import hero from "@/assets/hero2.webp";
import { useEffect, useState } from "react";
import { getTicketByUserIdApi } from "@/services/ticketService";
import { getPublicationByIdApi, getPublicationBySeatIdApi, getSeatPublicationByIdApi } from "@/services/publicationService";
import type { Ticket } from "@/types/ticket";
import type { Publication, Seat } from "@/types/publication";
import { useAuth } from "@/hooks/useAuth"; 
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Armchair,
  Tag,
  Clock,
  TicketX,
  Loader2,
} from "lucide-react";

type EnrichedTicket = {
  ticket: Ticket;
  publication: Publication | null;
  seat: Seat | null;
};

function statusLabel(status: string) {
  switch (status?.toLowerCase()) {
    case "valid":
      return { label: "Válido", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    case "used":
      return { label: "Usado", color: "bg-gray-100 text-gray-500 border-gray-200" };
    case "cancelled":
      return { label: "Cancelado", color: "bg-red-100 text-red-600 border-red-200" };
    default:
      return { label: status ?? "—", color: "bg-blue-50 text-blue-600 border-blue-200" };
  }
}

function TicketCard({ enriched }: { enriched: EnrichedTicket }) {
  const { ticket, publication, seat } = enriched;
  const { label, color } = statusLabel(ticket.type);

  const eventDate = publication?.date
    ? new Date(publication.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const eventTime = publication?.date
    ? new Date(publication.date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const generatedAt = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/tickets/${ticket.code}`}
      className="group relative flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm"
    >

      {publication?.image ? (
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={publication.image}
            alt={publication.name ?? "Evento"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <span
            className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${color}`}
          >
            {label}
          </span>
        </div>
      ) : (
        <div className="relative h-40 w-full bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <span
            className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${color}`}
          >
            {label}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4 flex-1">
        <div>
          <p className="text-xs font-medium text-blue uppercase tracking-widest mb-1">
            {publication?.type ?? "Evento"}
          </p>
          <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-blue transition-colors">
            {publication?.name ?? "Evento"}
          </h3>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-gray-500">
          {eventDate && (
            <span className="flex items-center gap-2">
              <CalendarDays size={14} className="text-blue shrink-0" />
              {eventDate}
              {eventTime && (
                <>
                  <Clock size={13} className="text-gray-400 ml-1" />
                  {eventTime}
                </>
              )}
            </span>
          )}

          {publication?.local && (
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-blue shrink-0" />
              <span className="truncate">{publication.local}</span>
            </span>
          )}

          {seat && (
            <span className="flex items-center gap-2">
              <Armchair size={14} className="text-blue shrink-0" />
              Assento{" "}
              <strong className="text-gray-700">
                {seat.row}{seat.number}
              </strong>
            </span>
          )}
        </div>

        <div className="border-t border-dashed border-gray-200 my-1" />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Tag size={12} />
              <span className="font-mono tracking-widest text-gray-500 text-xs">
                {ticket.code}
              </span>
            </span>
            {generatedAt && (
              <span className="text-xs text-gray-400">
                Emitido em {generatedAt}
              </span>
            )}
          </div>

        </div>
      </div>
    </Link>
  );
}

export default function MeusTickets() {
  const { user } = useAuth();
  const [enriched, setEnriched] = useState<EnrichedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const ticket = await getTicketByUserIdApi(String(user.id));
        const tickets = Array.isArray(ticket) ? ticket : [ticket];

        const enrichedList: EnrichedTicket[] = await Promise.all(
          tickets.map(async (t) => {
            try {
              let pub: Publication | null = null;
              let seat: Seat | null = null;
              if (t.seatId) {
                pub = await getPublicationBySeatIdApi(t.seatId);
                seat = (await getSeatPublicationByIdApi(pub.id)).filter(v=> v.id === t.seatId)[0];
              } else if (t.publicationId) {
                pub = await getPublicationByIdApi(t.publicationId);
              }
              return { ticket: t, publication: pub, seat };
            } catch {
              return { ticket: t, publication: null, seat: null };
            }
          })
        );

        setEnriched(enrichedList);
      } catch {
        setError("Não foi possível carregar seus tickets.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.id]);

  return (
    <MainPage page={3}>
      <Hero img={hero} keyword="Tickets" text="Meus" />

      <main className="w-full flex flex-col items-center px-4 pb-16 pt-6">
        <div className="w-full max-w-6xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Meus ingressos</h2>
            <p className="text-gray-500 text-sm mt-1">
              Todos os bilhetes vinculados à sua conta.
            </p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={32} className="animate-spin text-blue" />
              <span className="text-sm">Carregando seus ingressos…</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
              <TicketX size={40} className="text-red-400" />
              <p className="text-gray-600 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && enriched.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <TicketX size={48} className="text-gray-300" />
              <p className="text-gray-500 font-medium text-lg">
                Você ainda não possui ingressos.
              </p>
              <p className="text-sm text-gray-400">
                Compre um ingresso para um evento e ele aparecerá aqui.
              </p>
              <Link
                href="/home"
                className="mt-2 px-5 py-2 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-2 transition-colors"
              >
                Ver eventos
              </Link>
            </div>
          )}

          {!loading && !error && enriched.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enriched.map((e) => (
                <TicketCard key={e.ticket.code} enriched={e} />
              ))}
            </div>
          )}
        </div>
      </main>
    </MainPage>
  );
}