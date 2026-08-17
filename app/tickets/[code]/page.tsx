"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getTicketByCodeApi } from "@/services/ticketService";
import { getPublicationBySeatIdApi, getPublicationByIdApi, getSeatPublicationByIdApi } from "@/services/publicationService";
import type { Ticket } from "@/types/ticket";
import type { Publication, Seat } from "@/types/publication";
import QRCode from "qrcode";
import {
  CalendarDays,
  MapPin,
  Armchair,
  Clock,
  Loader2,
  TicketX,
  Download,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";
import { InfoCell } from "@/components/tickets/infoCell";
import Button from "@/components/Button";
import ButtonExit from "@/components/ButtonExit";


function statusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "valid":
      return {
        label: "Válido",
        icon: <CheckCircle2 size={15} />,
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "used":
      return {
        label: "Usado",
        icon: <Hourglass size={15} />,
        cls: "bg-gray-100 text-gray-500 border-gray-200",
        dot: "bg-gray-400",
      };
    case "cancelled":
      return {
        label: "Cancelado",
        icon: <XCircle size={15} />,
        cls: "bg-red-50 text-red-600 border-red-200",
        dot: "bg-red-500",
      };
    default:
      return {
        label: status ?? "—",
        icon: null,
        cls: "bg-blue-50 text-blue-600 border-blue-200",
        dot: "bg-blue-400",
      };
  }
}

function fmt(date: string | undefined, opts: Intl.DateTimeFormatOptions) {
  if (!date) return null;
  return new Date(date).toLocaleString("pt-BR", opts);
}

export default function TicketViewPage() {
    
  const { code } = useParams<{ code: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [seatData, setSeatData] = useState<Seat | null>(null);
  const [pub, setPub] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const t = await getTicketByCodeApi(code);
        setTicket(t);

        let publication: Publication | null = null;
        let seat: Seat | null = null;
        try {
          if (t.seatId) {
            publication = await getPublicationBySeatIdApi(t.seatId);
            seat = (await getSeatPublicationByIdApi(publication.id)).filter(v=> v.id === t.seatId)[0];
          } else if (t.publicationId) {
            publication = await getPublicationByIdApi(t.publicationId);
          }
        } catch {}
        setPub(publication);
        setSeatData(seat);
        const shareUrl = `${window.location.origin}/tickets/${t.code}`;
        const qr = await QRCode.toDataURL(shareUrl, {
          width: 220,
          margin: 2,
          color: { dark: "#0f172a", light: "#ffffff" },
        });
        setQrDataUrl(qr);
      } catch {
        setError("Bilhete não encontrado ou inválido.");
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const eventDate = fmt(pub?.date, { day: "2-digit", month: "long", year: "numeric" });
  const eventTime = fmt(pub?.date, { hour: "2-digit", minute: "2-digit" });
  const issuedAt = fmt(ticket?.createdAt, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const status = ticket ? statusConfig(ticket.type) : null;

  function handleDownload() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCFD]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={36} className="animate-spin text-[#1570EF]" />
          <span className="text-sm">Carregando bilhete…</span>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCFD]">
        <div className="flex flex-col items-center gap-3 text-center">
          <TicketX size={48} className="text-gray-300" />
          <p className="text-gray-600 font-semibold text-lg">{error ?? "Bilhete não encontrado."}</p>
          <p className="text-gray-400 text-sm">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #ticket-print, #ticket-print * { visibility: visible; }
          #ticket-print { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>

      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 py-12">

        <div className="mb-8 flex items-center gap-2 text-white/60 text-sm select-none no-print">
          <span className="font-semibold tracking-wide">Eventicket</span>
          <span className="mx-2">·</span>
          <span>Bilhete digital</span>
        </div>

        <div
          id="ticket-print"
          ref={ticketRef}
          className="w-full max-w-md bg-white rounded-sm overflow-hidden shadow-2xl shadow-black/40"
        >

          <div className="relative h-52 overflow-hidden bg-linear-to-br from-slate-800 to-slate-900">
            {pub?.image && (
              <img
                src={pub.image}
                alt={pub.name ?? "Evento"}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

            {status && (
              <div className={`absolute top-4 right-4 flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${status.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.icon}
                {status.label}
              </div>
            )}

            <div className="absolute bottom-0 left-0 p-5">
              {(pub?.type) && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#1570EF] mb-1">
                  {pub?.type}
                </p>
              )}
              <h1 className="text-white text-xl font-bold leading-tight line-clamp-2">
                {pub?.name ?? "Evento"}
              </h1>
            </div>
          </div>

          <div className="px-6 pt-5 pb-2 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {eventDate && (
                <InfoCell
                  icon={<CalendarDays size={14} className="text-[#1570EF]" />}
                  label="Data"
                  value={eventDate}
                />
              )}
              {eventTime && (
                <InfoCell
                  icon={<Clock size={14} className="text-[#1570EF]" />}
                  label="Horário"
                  value={eventTime}
                />
              )}
              {pub?.local && (
                <InfoCell
                  icon={<MapPin size={14} className="text-[#1570EF]" />}
                  label="Local"
                  value={pub.local}
                  wide
                />
              )}
              {seatData && (
                <InfoCell
                  icon={<Armchair size={14} className="text-[#1570EF]" />}
                  label="Assento"
                  value={`Fileira ${seatData.row} · Nº ${seatData.number}`}
                />
              )}
              {pub?.price != null && (
                <InfoCell
                  icon={<span className="text-[#1570EF] font-bold text-xs">R$</span>}
                  label="Valor pago"
                  value={Number(pub.price).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                />
              )}
            </div>
          </div>

          <div className="relative flex items-center mx-6 my-4">
            <div className="absolute -left-10 w-7 h-7 rounded-full bg-linear-to-br from-slate-800 to-slate-900" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
            <div className="absolute -right-10 w-7 h-7 rounded-full bg-linear-to-br from-slate-800 to-slate-900" />
          </div>

          <div className="flex flex-col items-center gap-3 px-6 pb-6">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-inner">
                <img src={qrDataUrl} alt="QR Code do bilhete" className="w-44 h-44" />
              </div>
            ) : (
              <div className="w-44 h-44 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-gray-300" />
              </div>
            )}

            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Código do ingresso
              </p>
              <p className="font-mono text-base font-bold tracking-widest text-slate-800">
                {ticket.code}
              </p>
            </div>

            {issuedAt && (
              <p className="text-[11px] text-gray-400 text-center">
                Emitido em {issuedAt}
              </p>
            )}
          </div>

        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 no-print">
          <ButtonExit
            onClick={handleDownload}
            className={'min-w-40'}
          >
            Salvar / Imprimir
          </ButtonExit>
          <Button
            className={'min-w-40'}
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            Copiar link do bilhete
          </Button>
        </div>

        <p className="mt-6 text-white/30 text-xs text-center no-print">
          Este bilhete é pessoal e intransferível. Apresente o QR Code na entrada.
        </p>
      </div>
    </>
  );
}


