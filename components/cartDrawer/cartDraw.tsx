"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/contexts/cartContext";
import { removeShoppingCartItemApi } from "@/services/shoppingCartItemService";
import { getPublicationByIdApi, getPublicationBySeatIdApi, getSeatPublicationByIdApi } from "@/services/publicationService";
import { Publication, Seat } from "@/types/publication";
import { ShoppingCartItem } from "@/types/shoppingCartItem";
import EmptyCart from "./emptyCart";
import CartItemCard from "./cartItemCard";
import Payment from "@/components/payment/payment";
import { useRouter } from "next/navigation";
import Button from "../Button";
import { toast } from "sonner";

export interface EnrichedItem {
  cartItem: ShoppingCartItem;
  seat: Seat | null;
  publication: Publication | null;
}


export function CartDrawer() {
  const { isOpen, closeCart, items, loadingN, refresh } = useCart();
  const [enriched, setEnriched] = useState<EnrichedItem[]>([]);
  const [enriching, setEnriching] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();
  useEffect(() => {

    console.log(items)

    if (!isOpen || items.length === 0) {
      setEnriched([]);
      return;
    }

    let cancelled = false;
    setEnriching(true);

    async function enrich() {
      const results = await Promise.all(
        items.map(async (cartItem): Promise<EnrichedItem> => {
          try {
            const seatId = (cartItem as ShoppingCartItem & { seatId?: number }).seatId;
            const getSeatPublicationId = await getPublicationBySeatIdApi(seatId); 
            const publicationId = getSeatPublicationId.id;

            if (!publicationId) {
              return { cartItem, seat: null, publication: null };
            }

            const [publication, seats] = await Promise.all([
              getPublicationByIdApi(publicationId),
              getSeatPublicationByIdApi(publicationId),
            ]);

            const seat = seats.find((s) => s.id === seatId) ?? null;
            return { cartItem, seat, publication };
          } catch {
            return { cartItem, seat: null, publication: null };
          }
        })
      );

      if (!cancelled) {
        setEnriched(results);
        setEnriching(false);
      }
    }

    enrich();
    return () => {
      cancelled = true;
    };
  }, [isOpen, items]);

  async function handleRemove(cartItemId: number) {
    setRemovingId(cartItemId);
    try {
      await removeShoppingCartItemApi(cartItemId);
      await refresh();
    } finally {
      setRemovingId(null);
    }
  }

  const total = enriched.reduce((acc, { publication }) => {
  return acc + Number(publication?.price ?? 0);
}, 0);

  const isloadingN = loadingN || enriching;

  return (
    <>
      <div
        className={`fixed inset-0 z-80 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
        className={`
          fixed z-100 bg-[#FCFCFD] flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          inset-x-0 bottom-0 top-0
          rounded-none
          sm:inset-y-0 sm:left-auto sm:right-0 sm:top-0 sm:bottom-0
          sm:w-105 sm:rounded-l-sm sm:rounded-r-none
          
          ${isOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">Meu carrinho</h2>
              <p className="text-xs text-gray-400">
                {items.length === 0
                  ? "Nenhum item"
                  : `${items.length} ${items.length === 1 ? "assento" : "assentos"}`}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Fechar carrinho"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isloadingN ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-21 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="flex flex-col gap-2.5">
              {enriched.map((item) => (
                <CartItemCard
                  key={item.cartItem.id}
                  enriched={item}
                  onRemove={handleRemove}
                  removing={removingId === item.cartItem.id}
                />
              ))}
            </div>
          )}
        </div>

        {showPayment ? (
          <Payment
            total={total}
            onBack={() => setShowPayment(false)}
            onSuccess={(id) => {
              setShowPayment(false);
              closeCart();
              toast.success(`Pagamento realizado com exito!`);
            }}
          />
        ) : (
          <Button className="max-w-40 self-center mb-5"  onClick={() => setShowPayment(true)}>Finalizar compra</Button>
        )}
      </div>
    </>
  );
}