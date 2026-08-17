import { IoCartOutline } from "react-icons/io5";

export default function EmptyCart() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="w-16 h-16 rounded-sm bg-gray-100 flex items-center justify-center">
        <IoCartOutline className="text-3xl" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">Carrinho vazio</p>
        <p className="text-xs text-gray-400 mt-1">Escolha um evento e selecione seus assentos</p>
      </div>
    </div>
  );
}