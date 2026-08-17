import Button from "@/components/Button";
import { TicketMasterEvent } from "@/types/ticketmaster";

interface EventDetailProps {
  event: TicketMasterEvent;
  onCreate: () => void;
}

export default function EventDetail({
  event,
  onCreate,
}: EventDetailProps) {
  const info = event.info;
  const pleaseNote = event.pleaseNote;

  return (
    <>
      {(info || pleaseNote) && (
        <div className="mb-5">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            Sobre o evento
          </h3>

          {info && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {info}
            </p>
          )}

          {pleaseNote && (
            <p className="text-sm text-gray-500 mt-2 italic">
              {pleaseNote}
            </p>
          )}
        </div>
      )}

      <Button onClick={onCreate}>
        Criar
      </Button>
    </>
  );
}