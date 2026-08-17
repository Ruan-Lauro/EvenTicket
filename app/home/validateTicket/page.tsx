"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MainPage from "@/components/main";
import { getTicketByCodeApi, validateTicketApi } from "@/services/ticketService";
import {
  ScanLine,
  KeyboardIcon,
  Loader2,
  ShieldCheck,
  Camera,
} from "lucide-react";
import { ScanMode, ValidationState } from "@/types/validateTicket";
import ResultOverlay from "@/components/validateTicket/resultOverlay";
import ModeButton from "@/components/validateTicket/modeButton";
import QRScanner from "@/components/validateTicket/qRScanner";
import { classifyError } from "@/utils/validateTicketFunctions";
import { getPublicationBySeatIdApi, getSeatPublicationByIdApi } from "@/services/publicationService";

export default function ValidarTicketPage() {
  const [mode, setMode] = useState<ScanMode>("idle");
  const [state, setState] = useState<ValidationState>({ phase: "idle" });
  const [manualCode, setManualCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setState({ phase: "idle" });
    setManualCode("");
    setMode("idle");
  }, []);

  const fetchTicket = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setState({ phase: "looking", code: trimmed });

    try {
      const ticket = await getTicketByCodeApi(trimmed);

      const s = ticket.type?.toLowerCase();
      if (s === "used") {
        setState({
          phase: "error",
          kind: "already_used",
          message: "Este ingresso já foi utilizado.",
          code: trimmed,
        });
        return;
      }
      if (s === "cancelled") {
        setState({
          phase: "error",
          kind: "cancelled",
          message: "Este ingresso foi cancelado.",
          code: trimmed,
        });
        return;
      }

      setState({ phase: "confirming", ticket, code: trimmed });
    } catch (err) {
      const { kind, message } = classifyError(err);
      setState({ phase: "error", kind, message, code: trimmed });
    }
  }, []);

  const confirmValidate = useCallback(async () => {
    if (state.phase !== "confirming") return;
    const { ticket, code } = state;
    setState({ phase: "validating", ticket, code });

    try {
      const validated = await validateTicketApi(code);
      const pub = await getPublicationBySeatIdApi(ticket.seatId);
      const seat = (await getSeatPublicationByIdApi(pub.id)).filter(v=> v.id === ticket.seatId)[0];
      setState({ phase: "success", ticket: validated ?? ticket, publication: pub, seat });
    } catch (err) {
      const { kind, message } = classifyError(err, ticket);
      setState({ phase: "error", kind, message, code });
    }
  }, [state]);

  const handleQrDetect = useCallback(
    (code: string) => {
      setMode("idle"); 
      fetchTicket(code);
    },
    [fetchTicket]
  );

  const handleManualSubmit = () => {
    fetchTicket(manualCode);
  };

  useEffect(() => {
    if (mode === "manual") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode]);

  const isLoading =
    state.phase === "looking" || state.phase === "validating";
  const showResult =
    state.phase === "success" || state.phase === "error";

  return (
    <MainPage page={4}>
      {showResult && (
        <ResultOverlay
          state={state as Extract<ValidationState, { phase: "success" | "error" }>}
          onReset={reset}
        />
      )}

      <div className="h-screen bg-slate-900 w-full flex flex-col items-center pt-20">

        <div className=" text-white px-6 py-5 flex items-center gap-3">
          <ShieldCheck size={22} className="text-[#1570EF]" />
          <div>
            <h1 className="font-bold text-lg leading-tight">Controle de entrada</h1>
            <p className="text-white/50 text-xs">Valide ingressos por QR Code ou código</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-4 py-8 gap-6 max-w-lg mx-auto w-full">

          {state.phase === "idle" && (
            <div className="w-full flex gap-3">
              <ModeButton
                active={mode === "camera"}
                icon={<Camera size={18} />}
                label="Câmera / QR"
                onClick={() => setMode(mode === "camera" ? "idle" : "camera")}
              />
              <ModeButton
                active={mode === "manual"}
                icon={<KeyboardIcon size={18} />}
                label="Digitar código"
                onClick={() => setMode(mode === "manual" ? "idle" : "manual")}
              />
            </div>
          )}

          {mode === "camera" && state.phase === "idle" && (
            <div className="w-full flex flex-col gap-3">
              <QRScanner onDetect={handleQrDetect} />
              <button
                onClick={() => setMode("idle")}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
              >
                Cancelar câmera
              </button>
            </div>
          )}

          {mode === "manual" && state.phase === "idle" && (
            <div className="w-full flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Código do ingresso
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                  placeholder="ex: TK-ABC123"
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl font-mono text-sm text-slate-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1570EF]/30 focus:border-[#1570EF] transition"
                />
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim()}
                  className="px-5 py-3 bg-[#1570EF] text-white text-sm font-semibold rounded-xl hover:bg-[#175CD3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="w-full flex flex-col items-center gap-3 py-10">
              <Loader2 size={36} className="animate-spin text-[#1570EF]" />
              <p className="text-sm text-gray-500">
                {state.phase === "looking"
                  ? "Buscando ingresso…"
                  : "Validando entrada…"}
              </p>
            </div>
          )}

          {state.phase === "confirming" && (
            <div className="w-full flex flex-col gap-4">
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmValidate}
                  className="flex-1 px-4 py-3 bg-[#1570EF] text-white text-sm font-semibold rounded-xl hover:bg-[#175CD3] transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  Confirmar entrada
                </button>
              </div>
            </div>
          )}

          {state.phase === "idle" && mode === "idle" && (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400 select-none">
              <ScanLine size={48} className="opacity-30" />
              <p className="text-sm">
                Escolha como deseja ler o ingresso acima.
              </p>
            </div>
          )}
        </div>

        <div className="px-4 pb-8 text-center">
          <p className="text-xs text-gray-300">
            Eventicket · Controle de acesso
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0%   { top: 0%; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0%; }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
      `}</style>
    </MainPage>
  );
}


