import { formatCurrency } from "@/utils/formatCurrency";
import { useState } from "react";

export default function PixCode({ total }: { total: number }) {
  const [copied, setCopied] = useState(false);
  const fakeCode =
    "00020126580014BR.GOV.BCB.PIX0136eventicket@pix.com.br5204000053039865802BR5925Eventicket Pagamentos6009SAO PAULO62070503***6304ABCD";

  function copy() {
    navigator.clipboard.writeText(fakeCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-44 h-44 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center p-3 shadow-inner">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900">
          {[[0,0],[70,0],[0,70]].map(([x,y],i) => (
            <g key={i}>
              <rect x={x+2} y={y+2} width={26} height={26} fill="currentColor" rx="3"/>
              <rect x={x+6} y={y+6} width={18} height={18} fill="white" rx="1"/>
              <rect x={x+10} y={y+10} width={10} height={10} fill="currentColor" rx="1"/>
            </g>
          ))}
          {Array.from({length: 80}).map((_,i) => {
            const seed = (i * 137 + 42) % 100;
            const x = 32 + (seed % 38);
            const y = 32 + (Math.floor(seed / 2) % 38);
            return (i % 3 !== 0) ? <rect key={i} x={x} y={y} width={3} height={3} fill="currentColor"/> : null;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-lg bg-[#1570EF] flex items-center justify-center shadow">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-400 mb-1">Valor a pagar</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
      </div>

      <div className="w-full bg-gray-50 rounded-xl border border-gray-200 p-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Código PIX copia e cola</p>
        <p className="text-[10px] font-mono text-gray-600 break-all leading-relaxed line-clamp-2">{fakeCode}</p>
        <button
          onClick={copy}
          className="mt-2.5 w-full h-8 rounded-lg bg-[#1570EF]/8 hover:bg-[#1570EF]/15 text-[#1570EF] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Copiado!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              Copiar código
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Abra o app do seu banco, escolha PIX e escaneie o QR ou cole o código acima.
        <br />O pagamento é confirmado em instantes.
      </p>
    </div>
  );
}