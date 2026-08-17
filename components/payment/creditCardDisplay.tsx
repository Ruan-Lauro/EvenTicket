import { getCardBrand, maskCardNumber } from "@/utils/paymentFunctions";
import { CardData } from "./payment";

export default function CreditCardDisplay({ card, flipped }: { card: CardData; flipped: boolean }) {
  const brand = getCardBrand(card.number);

  return (
    <div className="perspective-1000 w-full max-w-85 mx-auto h-47.5">
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d", transition: "transform 0.5s" }}
      >
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #1570EF 0%, #175CD3 50%, #1d4ed8 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20 rounded-2xl"
            style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.6) 0%, transparent 60%)" }}
          />
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -right-4 top-8 w-28 h-28 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="w-10 h-7 rounded-md bg-linear-to-br from-yellow-300 to-yellow-500 opacity-90" />
            </div>
            {brand === "visa" && (
              <span className="text-white font-black text-xl italic tracking-tight opacity-90">VISA</span>
            )}
            {brand === "mastercard" && (
              <div className="flex">
                <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
                <div className="w-7 h-7 rounded-full bg-yellow-400 opacity-90 -ml-3" />
              </div>
            )}
            {brand === "other" && (
              <div className="w-7 h-7 rounded-full border-2 border-white/40" />
            )}
          </div>

          <div className="relative">
            <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Número</p>
            <p className="text-white font-mono text-lg tracking-[0.18em] font-semibold">
              {card.number ? maskCardNumber(card.number) : "···· ···· ···· ····"}
            </p>
          </div>

          <div className="relative flex items-end justify-between">
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">Titular</p>
              <p className="text-white text-sm font-semibold uppercase tracking-wide truncate max-w-45">
                {card.name || "SEU NOME"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">Validade</p>
              <p className="text-white text-sm font-semibold font-mono">
                {card.expiry || "MM/AA"}
              </p>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #175CD3 0%, #1570EF 100%)",
          }}
        >
          <div className="h-12 bg-gray-900/80 mt-7 w-full" />
          <div className="px-5 mt-4">
            <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1.5">CVV</p>
            <div className="bg-white rounded-md h-9 flex items-center px-3 justify-end">
              <p className="font-mono text-gray-900 font-bold tracking-[0.25em]">
                {card.cvv ? "•".repeat(card.cvv.length) : "•••"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}