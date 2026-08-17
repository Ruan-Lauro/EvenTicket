import { Seat } from "@/types/publication";

type SeatStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "SELECTED";

interface SeatCellProps {
  seat: Seat;
  selected: boolean;
  onToggle: (id: number) => void;
}

export function SeatCell({ seat, selected, onToggle }: SeatCellProps) {
  const base =
    "w-8 h-8 rounded-md text-[10px] font-semibold flex items-center justify-center transition-all duration-150 select-none";

  const statusClass: Record<string, string> = {
    AVAILABLE: "bg-gray-100 border border-gray-300 text-gray-600 hover:bg-[#1570EF]/10 hover:border-[#1570EF] cursor-pointer",
    RESERVED: "bg-amber-100 border border-amber-300 text-amber-700 cursor-not-allowed",
    SOLD: "bg-red-100 border border-red-300 text-red-400 cursor-not-allowed line-through",
    SELECTED: "bg-[#1570EF] border border-[#175CD3] text-white shadow-md cursor-pointer scale-105",
  };

  const status: SeatStatus = selected ? "SELECTED" : seat.status;

  return (
    <button
      className={`${base} ${statusClass[status]}`}
      disabled={seat.status !== "AVAILABLE"}
      onClick={() => seat.status === "AVAILABLE" && onToggle(seat.id)}
      title={`${seat.row}${seat.number} · ${seat.status}`}
      aria-label={`Assento ${seat.row}${seat.number}`}
    >
      {seat.row}{seat.number}
    </button>
  );
}