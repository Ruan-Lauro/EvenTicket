import Button from "@/components/Button";
import { FaCheck } from "react-icons/fa6";

interface EventSuccessProps {
  onClose: () => void;
}

export default function EventSuccess({
  onClose,
}: EventSuccessProps) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-blue flex items-center justify-center mx-auto mb-4">
        <FaCheck className="text-3xl text-white" />
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Evento publicado!
      </h3>

      <p className="text-gray-500 text-sm mb-6">
        Seu evento foi criado com sucesso e já está disponível.
      </p>

      <Button
        onClick={onClose}
        className="max-w-50 mx-auto"
      >
        Fechar
      </Button>
    </div>
  );
}