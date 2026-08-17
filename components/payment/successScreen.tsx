export default function SuccessScreen({ purchaseId, onClose }: { purchaseId: number; onClose?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="relative w-20 h-20">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-[dash_0.6s_ease-in-out_forwards]"/>
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Pagamento confirmado!</h2>
        <p className="text-sm text-gray-500 mt-1.5">
          Seu pedido <span className="font-semibold text-gray-700">#{purchaseId}</span> foi processado com sucesso.
        </p>
        <p className="text-xs text-gray-400 mt-1">Seus tickets foram gerados e enviados por e-mail.</p>
      </div>

      <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 text-left">
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
          </svg>
          <div>
            <p className="text-xs font-semibold text-green-800">Tickets disponíveis</p>
            <p className="text-xs text-green-600 mt-0.5">Acesse em "Meus ingressos" para ver seus tickets e QR codes.</p>
          </div>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-[#1570EF] hover:bg-[#175CD3] text-white text-sm font-semibold transition-colors"
        >
          Concluir
        </button>
      )}
    </div>
  );
}