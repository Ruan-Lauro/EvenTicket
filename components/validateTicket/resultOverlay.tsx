import { ValidationState } from "@/types/validateTicket";

import {

  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  User,
  Armchair,
} from "lucide-react";

const resultConfig = {
  success: {
    bg: "from-emerald-500 to-emerald-600",
    border: "border-emerald-400",
    icon: <CheckCircle2 size={64} strokeWidth={1.5} className="text-white drop-shadow-lg" />,
    headline: "ENTRADA LIBERADA",
    sub: "Ingresso válido e registrado.",
  },
  already_used: {
    bg: "from-amber-500 to-orange-500",
    border: "border-amber-400",
    icon: <AlertTriangle size={64} strokeWidth={1.5} className="text-white drop-shadow-lg" />,
    headline: "JÁ UTILIZADO",
    sub: "Este ingresso foi lido anteriormente.",
  },
  cancelled: {
    bg: "from-red-600 to-rose-700",
    border: "border-red-500",
    icon: <XCircle size={64} strokeWidth={1.5} className="text-white drop-shadow-lg" />,
    headline: "CANCELADO",
    sub: "Este ingresso foi cancelado e não é válido.",
  },
  not_found: {
    bg: "from-red-600 to-rose-700",
    border: "border-red-500",
    icon: <XCircle size={64} strokeWidth={1.5} className="text-white drop-shadow-lg" />,
    headline: "NÃO ENCONTRADO",
    sub: "Código não localizado no sistema.",
  },
  unknown: {
    bg: "from-red-600 to-rose-700",
    border: "border-red-500",
    icon: <XCircle size={64} strokeWidth={1.5} className="text-white drop-shadow-lg" />,
    headline: "ERRO",
    sub: "Não foi possível validar o ingresso.",
  },
};

export default function ResultOverlay({
  state,
  onReset,
}: {
  state: Extract<ValidationState, { phase: "success" | "error" }>;
  onReset: () => void;
}) {
  const kind =
    state.phase === "success"
      ? "success"
      : (state as Extract<ValidationState, { phase: "error" }>).kind;

  const cfg = resultConfig[kind];

  const personName =
    state.phase === "success" ? state.publication.name : undefined;
  const seat =
    state.phase === "success" ? state.seat : undefined;
  const errorMsg =
    state.phase === "error"
      ? (state as Extract<ValidationState, { phase: "error" }>).message
      : undefined;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-br ${cfg.bg} p-8 text-white`}
      onClick={onReset}
    >
      <div className="flex flex-col items-center gap-5 max-w-sm w-full text-center">
        {cfg.icon}

        <div>
          <p className="text-4xl font-black tracking-tight leading-none">{cfg.headline}</p>
          <p className="mt-2 text-white/80 text-base">{errorMsg ?? cfg.sub}</p>
        </div>

        {state.phase === "success" && (personName || seat) && (
          <div className={`w-full rounded-2xl border ${cfg.border} bg-white/10 backdrop-blur-sm p-4 flex flex-col gap-1.5 text-left`}>
            {personName && (
              <div className="flex items-center gap-2">
                <User size={15} className="opacity-70" />
                <span className="text-sm font-semibold">{personName}</span>
              </div>
            )}
            {seat && (
              <div className="flex items-center gap-2">
                <Armchair size={15} className="opacity-70" />
                <span className="text-sm">
                  Fileira <strong>{seat.row}</strong> · Assento <strong>{seat.number}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-sm font-semibold transition-colors"
        >
          <RotateCcw size={15} />
          Ler próximo ingresso
        </button>

        <p className="text-xs text-white/50">Toque em qualquer lugar para fechar</p>
      </div>
    </div>
  );
}