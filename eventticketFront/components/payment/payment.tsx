"use client";

import { useState } from "react";
import { checkoutApi } from "@/services/purchaseService";
import { initiatePaymentApi } from "@/services/paymentService";
import type { PaymentMethod } from "@/types/payment";
import type { Purchase } from "@/types/purchase";
import { useCart } from "@/contexts/cartContext";
import { toast } from "sonner";
import SuccessScreen from "./successScreen";
import PixCode from "./pixCode";
import CreditCardDisplay from "./creditCardDisplay";
import { formatCardNumber, formatExpiry } from "@/utils/paymentFunctions";
import { formatCurrency } from "@/utils/formatCurrency";

export interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export interface PaymentPageProps {
  total: number;
  onSuccess?: (purchaseId: number) => void;
  onBack?: () => void;
}

export default function Payment({ total, onSuccess, onBack }: PaymentPageProps) {
  const { refresh } = useCart();

  const [method, setMethod] = useState<PaymentMethod>("PIX");
  const [cardType, setCardType] = useState<"CREDIT_CARD" | "DEBIT_CARD">("CREDIT_CARD");
  const [card, setCard] = useState<CardData>({ number: "", name: "", expiry: "", cvv: "" });
  const [cvvFocused, setCvvFocused] = useState(false);

  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateCard(field: keyof CardData, value: string) {
    setCard((prev) => ({ ...prev, [field]: value }));
  }

  function isCardValid() {
    if (method !== "PIX") {
      const digits = card.number.replace(/\s/g, "");
      if (digits.length < 16) return false;
      if (!card.name.trim()) return false;
      if (card.expiry.length < 5) return false;
      if (card.cvv.length < 3) return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!isCardValid()) {
      setError("Preencha todos os dados do cartão corretamente.");
      return;
    }
    setError(null);
    setStep("processing");

    try {
      const purchase: Purchase = await checkoutApi();
      setPurchaseId(purchase.id);

      const paymentMethod: PaymentMethod = method === "PIX" ? "PIX" : cardType;
      await initiatePaymentApi(purchase.id, { method: paymentMethod });

      await refresh();

      setStep("success");
      onSuccess?.(purchase.id);
    } catch (err: unknown) {
      setStep("form");
      if (err && typeof err === "object" && "message" in err) {
        setError(String((err as { message: string }).message));
      } else {
        setError("Ocorreu um erro ao processar o pagamento. Tente novamente.");
      }
      toast.error("Erro ao processar pagamento.");
    }
  }

  if (step === "success" && purchaseId) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <SuccessScreen purchaseId={purchaseId} onClose={onBack} />
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-[3px] border-[#1570EF] border-t-transparent animate-spin" />
        <div className="text-center">
          <p className="font-semibold text-gray-900">Processando pagamento…</p>
          <p className="text-sm text-gray-400 mt-1">Aguarde, isso leva alguns segundos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6 max-h-full overflow-y-auto">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Voltar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Pagamento</h1>
          <p className="text-xs text-gray-400">Total: <span className="font-semibold">{formatCurrency(total)}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-sm">
        {([
          { key: "PIX", label: "PIX" },
          { key: "CARD", label: "Cartão" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMethod(key === "CARD" ? "CREDIT_CARD" : "PIX")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-semibold transition-all duration-150 ${
              (key === "PIX" && method === "PIX") || (key === "CARD" && method !== "PIX")
                ? "bg-white text-[#1570EF] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
           
            {label}
          </button>
        ))}
      </div>

      {method === "PIX" && (
        <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm">
          <PixCode total={total} />
        </div>
      )}

      {method !== "PIX" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["CREDIT_CARD", "DEBIT_CARD"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCardType(t)}
                className={`flex-1 py-2 rounded-sm text-xs font-semibold border transition-all ${
                  cardType === t
                    ? "border-[#1570EF]  text-[#1570EF]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {t === "CREDIT_CARD" ? "Crédito" : "Débito"}
              </button>
            ))}
          </div>

          <CreditCardDisplay card={card} flipped={cvvFocused} />
          
          <div className="bg-white rounded-sm border border-gray-200 p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Número do cartão
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={(e) => updateCard("number", formatCardNumber(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1570EF]/30 focus:border-[#1570EF] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Nome do titular
              </label>
              <input
                type="text"
                placeholder="Como está no cartão"
                value={card.name}
                onChange={(e) => updateCard("name", e.target.value.toUpperCase())}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1570EF]/30 focus:border-[#1570EF] transition-all uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Validade
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  maxLength={5}
                  value={card.expiry}
                  onChange={(e) => updateCard("expiry", formatExpiry(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1570EF]/30 focus:border-[#1570EF] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  CVV
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="•••"
                  maxLength={4}
                  value={card.cvv}
                  onChange={(e) => updateCard("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={() => setCvvFocused(false)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1570EF]/30 focus:border-[#1570EF] transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isCardValid()}
        className="w-full h-12 rounded-xl bg-[#1570EF] hover:bg-[#175CD3] active:scale-[0.98] text-white text-sm font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        {method === "PIX" ? `Confirmar pagamento · ${formatCurrency(total)}` : `Pagar ${formatCurrency(total)}`}
      </button>

      <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        Pagamento seguro com criptografia SSL
      </p>
    </div>
  );
}