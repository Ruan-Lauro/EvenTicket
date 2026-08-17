"use client";

import { useEffect, useState, useCallback } from "react";
import Breadcrumb from "@/components/breadcrumb";
import {
  getPublicationByIdApi,
  getSeatPublicationByIdApi,
} from "@/services/publicationService";
import { Publication, Seat } from "@/types/publication";
import { useParams } from "next/navigation";
import MainPage from "@/components/main";
import { addShoppingCartItemApi } from "@/services/shoppingCartItemService";
import { parseAddress } from "@/utils/parseAddress";
import { toast } from "sonner";
import { useCart } from "@/contexts/cartContext";
import { useCountdown } from "@/hooks/useCountdown";
import CountdownUnit from "@/components/home/CountdownUnit";
import { SeatMap } from "@/components/home/seatMap";
import { formatCurrency } from "@/utils/formatCurrency";
import { useAuth } from "@/hooks/useAuth";


function PublicationDetailPage() {

  const params = useParams();
  const id = params.id;

  const [publication, setPublication] = useState<Publication | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);
  const countdown = useCountdown(publication?.date ?? new Date());
  const {user} = useAuth();
  const { refresh } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const [pub, seatData] = await Promise.all([
          getPublicationByIdApi(Number(id)),
          getSeatPublicationByIdApi(Number(id)),
        ]);
        setPublication(pub);
        setSeats(seatData);
      } catch {
        setError("Não foi possível carregar os dados do evento.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleRefreshSeats = useCallback(async () => {
    setRefreshing(true);
    try {
      const seatData = await getSeatPublicationByIdApi(Number(id));
      setSeats(seatData);
      setSelectedSeats((prev) =>
        prev.filter((sid) =>
          seatData.find((s) => s.id === sid && s.status === "AVAILABLE")
        )
      );
    } catch {
    } finally {
      setRefreshing(false);
    }
  }, [id]);

  const toggleSeat = useCallback((seatId: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  }, []);

  async function handleAddToCart() {
  if (selectedSeats.length === 0) return;

  setCartError(null);

  try {
    const selectedSeatObjects = seats.filter((s) =>
      selectedSeats.includes(s.id)
    );

    const results = await Promise.allSettled(
      selectedSeatObjects.map((seat) =>
        addShoppingCartItemApi({ seatId: seat.id })
      )
    );

    const failed = results.filter((r) => r.status === "rejected");
    const succeeded = results.filter((r) => r.status === "fulfilled");

    if (failed.length > 0) {
      const firstError = failed[0].reason;

      let reason = "Erro ao adicionar ao carrinho.";

      if (firstError instanceof Error) {
        reason = firstError.message;
      } else if (
        firstError &&
        typeof firstError === "object" &&
        "message" in firstError &&
        typeof firstError.message === "string"
      ) {
        reason = firstError.message;
      }

      setCartError(
        succeeded.length > 0
          ? `${succeeded.length} assento(s) adicionado(s), mas ${failed.length} falhou: ${reason}`
          : reason
      );
    }

    if (succeeded.length > 0) {
      const succeededIds = selectedSeatObjects
        .filter((_, i) => results[i].status === "fulfilled")
        .map((s) => s.id);

      setSelectedSeats((prev) =>
        prev.filter((id) => !succeededIds.includes(id))
      );
      toast.success(`${succeeded.length} assento(s) adicionado(s) ao carrinho!`);
      await refresh();
      await handleRefreshSeats();
    }
  } finally {
   
  }
}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCFD]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#1570EF] border-t-transparent animate-spin" />
          <span className="text-sm text-gray-500">Carregando evento…</span>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCFD]">
        <div className="text-center">
          <p className="text-gray-500 text-sm">{error ?? "Evento não encontrado."}</p>
        </div>
      </div>
    );
  }

  const { city, state, country } = parseAddress(publication.local);
  const locationLabel = [city, state, country].filter(Boolean).join(", ");

  const eventDate = new Date(publication.date);
  const formattedDate = eventDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const availableCount = seats.filter((s) => s.status === "AVAILABLE").length;
  const selectedTotal = (publication.price * selectedSeats.length).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="min-h-screen w-full bg-[#FCFCFD]">
        <div className="relative w-full h-105 overflow-hidden bg-gray-900">
          {publication.image ? (
            <img
              src={publication.image}
              alt={publication.name}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-px">

          <div className="pt-6 pb-2">
            <Breadcrumb />
          </div>

          <div className="mb-6">
            <div className="mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#1570EF]/10 text-[#1570EF] border border-[#1570EF]/20">
                {publication.type}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] leading-tight mb-2">
              {publication.name}
            </h1>
            {locationLabel && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{locationLabel}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 pb-20">

            <div className="space-y-6">
              <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  Início do evento em
                </p>
                <div className="flex items-end gap-3 flex-wrap">
                  <CountdownUnit value={countdown.days} label="Dias" />
                  <span className="text-2xl font-bold text-gray-300 mb-6">:</span>
                  <CountdownUnit value={countdown.hours} label="Horas" />
                  <span className="text-2xl font-bold text-gray-300 mb-6">:</span>
                  <CountdownUnit value={countdown.minutes} label="Min" />
                  <span className="text-2xl font-bold text-gray-300 mb-6">:</span>
                  <CountdownUnit value={countdown.seconds} label="Seg" />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  <span className="font-medium text-gray-700">{formattedDate}</span>
                  {" "}às{" "}
                  <span className="font-medium text-gray-700">{formattedTime}</span>
                </p>
              </div>

              {publication.description && (
                <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Sobre o evento</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {publication.description}
                  </p>
                </div>
              )}

              <SeatMap
                seats={seats}
                selected={selectedSeats}
                onToggle={toggleSeat}
                onRefresh={handleRefreshSeats}
                refreshing={refreshing}
              />
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-6 sticky top-6">

                <div className="mb-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Preço por assento</p>
                  <p className="text-3xl font-bold text-[#1a1a1a]">
                    {publication.price === 0
                      ? "Gratuito"
                      : formatCurrency(Number(publication.price))}
                  </p>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Data</span>
                    <span className="font-medium text-gray-800">{formattedDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Horário</span>
                    <span className="font-medium text-gray-800">{formattedTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Disponíveis</span>
                    <span className="font-medium text-gray-800">
                      {availableCount} de {seats.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`inline-flex items-center gap-1 font-medium text-xs px-2 py-0.5 rounded-full ${
                        publication.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : publication.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          publication.status === "PUBLISHED"
                            ? "bg-green-500"
                            : publication.status === "CANCELLED"
                            ? "bg-red-500"
                            : "bg-gray-400"
                        }`}
                      />
                      {publication.status === "PUBLISHED"
                        ? "Publicado"
                        : publication.status === "CANCELLED"
                        ? "Cancelado"
                        : "Rascunho"}
                    </span>
                  </div>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="mb-4 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black font-medium">
                        {selectedSeats.length} assento{selectedSeats.length > 1 ? "s" : ""}
                      </span>
                      <span className="font-bold text-black">{selectedTotal}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedSeats.map((sid) => {
                        const s = seats.find((seat) => seat.id === sid);
                        return s ? (
                          <span
                            key={sid}
                            className="text-[10px] px-1.5 py-0.5 bg-black/10 text-black rounded font-semibold"
                          >
                            {s.row}{s.number}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {user && user.role === "USER" && (
                  <>
                    <button
                    onClick={handleAddToCart}
                    disabled={selectedSeats.length === 0 || publication.status !== "PUBLISHED"}
                    className="w-full h-12 rounded-xl font-semibold text-sm text-white bg-[#1570EF] hover:bg-[#175CD3] active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    {selectedSeats.length === 0
                      ? "Selecione um assento"
                      : `Adicionar ao carrinho · ${selectedSeats.length} assento${selectedSeats.length > 1 ? "s" : ""}`}
                  </button>

                  {selectedSeats.length === 0 && (
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Escolha um ou mais assentos no mapa acima
                    </p>
                  )}
                  </>
                )}
                
                {cartError && (
                  <p className="text-center text-xs text-red-500 mt-2">{cartError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function Page(){
  return(
    <MainPage page={0} >
        <PublicationDetailPage/>
    </MainPage>
  );
}