import { parseAddress } from "@/utils/parseAddress";
import { useRouter } from "next/navigation";
import { EnrichedItem } from "./cartDraw";
import { formatCurrency } from "@/utils/formatCurrency";


export default function CartItemCard({
  enriched,
  onRemove,
  removing,
}: {
  enriched: EnrichedItem;
  onRemove: (id: number) => void;
  removing: boolean;
}) {
  const router = useRouter();
  const { cartItem, seat, publication } = enriched;

  const seatLabel = seat ? `${seat.row}${seat.number}` : "—";
  const cityData = publication ? parseAddress(publication.local) : null;
  const city = typeof cityData === "string" ? cityData : cityData?.city || cityData?.state || cityData?.country || "";

  return (
    <div
      className={`group relative flex gap-3 p-3 rounded-xl border border-gray-100 bg-white transition-all duration-200 ${
        removing ? "opacity-40 pointer-events-none" : "hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <button
        onClick={() => publication && router.push(`/home/${publication.id}`)}
        className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1570EF]"
        aria-label={`Ver evento ${publication?.name}`}
      >
        {publication?.image ? (
          <img
            src={publication.image}
            alt={publication.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <button
          onClick={() => publication && router.push(`/home/${publication.id}`)}
          className="text-left w-full focus:outline-none"
        >
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight hover:text-[#1570EF] transition-colors">
            {publication?.name ?? "Carregando…"}
          </p>
        </button>
        {city && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{city}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#1570EF]/8 text-[#1570EF] text-[10px] font-semibold">
            Assento {seatLabel}
          </span>
          {publication && (
            <span className="text-xs font-bold text-gray-800">
              {formatCurrency(publication.price)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onRemove(cartItem.id)}
        disabled={removing}
        className="shrink-0 self-start mt-0.5 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
        aria-label="Remover item"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}