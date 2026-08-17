import { useCart } from "@/contexts/cartContext";

export function CartFab() {
  const { itemCount, openCart, isOpen } = useCart();

  return (
    <button
      onClick={openCart}
      aria-label={`Abrir carrinho${itemCount > 0 ? ` — ${itemCount} ${itemCount === 1 ? "item" : "itens"}` : ""}`}
      className={`
        fixed bottom-6 right-6 z-30
        w-14 h-14 rounded-2xl shadow-lg
        flex items-center justify-center
        bg-[#1570EF] hover:bg-[#175CD3]
        active:scale-95
        transition-all duration-200
        focus:outline-none focus:ring-4 focus:ring-[#1570EF]/30
        ${isOpen ? "scale-90 opacity-0 pointer-events-none" : "scale-100 opacity-100"}
      `}
    >
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>

      {/* Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-white text-[#1570EF] text-[10px] font-bold flex items-center justify-center shadow-sm border border-[#1570EF]/10 tabular-nums">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}