import { Seat } from "@/types/publication";
import { SeatCell } from "./seatCell";

interface SeatMapProps {
  seats: Seat[];
  selected: number[];
  onToggle: (id: number) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function SeatMap({ seats, selected, onToggle, onRefresh, refreshing }: SeatMapProps) {
  const rows: Record<string, Seat[]> = {};
  for (const seat of seats) {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  }
  const sortedRows = Object.keys(rows).sort();

  return (
    <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Escolha seus assentos</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {selected.length === 0
              ? "Selecione um ou mais assentos disponíveis"
              : `${selected.length} assento${selected.length > 1 ? "s" : ""} selecionado${selected.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-[#1570EF] hover:text-[#175CD3] font-medium transition-colors disabled:opacity-60"
        >
          <svg
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {refreshing ? "Atualizando…" : "Atualizar"}
        </button>
      </div>

      <div className="mb-6 flex flex-col items-center gap-1">
        <div className="w-3/4 h-2 rounded-full bg-linear-to-r from-[#1570EF]/20 via-[#1570EF]/40 to-[#1570EF]/20" />
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Palco / Tela</span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-col gap-2 min-w-max mx-auto w-fit">
          {sortedRows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-5 text-xs font-semibold text-gray-400 text-right">{row}</span>
              <div className="flex gap-1.5">
                {rows[row]
                  .sort((a, b) => a.number - b.number)
                  .map((seat) => (
                    <SeatCell
                      key={seat.id}
                      seat={seat}
                      selected={selected.includes(seat.id)}
                      onToggle={onToggle}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-center border-t border-gray-100 pt-4">
        {[
          { color: "bg-gray-100 border border-gray-300", label: "Disponível" },
          { color: "bg-[#1570EF] border border-[#175CD3]", label: "Selecionado" },
          { color: "bg-amber-100 border border-amber-300", label: "Reservado" },
          { color: "bg-red-100 border border-red-300", label: "Vendido" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded ${color}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}