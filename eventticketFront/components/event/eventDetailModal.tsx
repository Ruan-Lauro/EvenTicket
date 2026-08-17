"use client";

import { useState } from "react";
import { TicketMasterEvent } from "@/types/ticketmaster";

import Modal from "@/components/modal/modal";
import ModalHeader from "@/components/modal/ModalHeader";
import ModalBody from "@/components/modal/ModalBody";

import EventDetail from "@/components/event/eventDetail";
import EventPublicationForm from "@/components/event/eventPublicationForm";
import EventSuccess from "@/components/event/eventSuccess";

interface EventDetailModalProps {
  event: TicketMasterEvent;
  onClose: () => void;
  userId: number;
}

type Step = "detail" | "form";

export default function EventDetailModal({
  event,
  onClose,
  userId,
}: EventDetailModalProps) {
  const [step, setStep] = useState<Step>("detail");
  const [success, setSuccess] = useState(false);

  const venue = event._embedded?.venues?.[0];

  const image =
    event.images?.find(
      (img) =>
        img.ratio === "16_9" &&
        img.width &&
        img.width > 500
    )?.url ??
    event.images?.[0]?.url ??
    "";

  const genre =
    event.classifications?.[0]?.genre?.name ?? "";

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        image={image}
        imageAlt={event.name}
        badge={
          genre && genre !== "Undefined"
            ? genre
            : undefined
        }
        onClose={onClose}
      >
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-white text-2xl font-bold leading-tight">
            {event.name}
          </h2>

          {venue && (
            <p className="text-white/80 text-sm mt-1">
              {venue.name} — {venue.city?.name},{" "}
              {venue.country?.name}
            </p>
          )}
        </div>
      </ModalHeader>

      <ModalBody>
        {step === "detail" && !success && (
          <EventDetail
            event={event}
            onCreate={() => setStep("form")}
          />
        )}

        {step === "form" && !success && (
          <EventPublicationForm
            event={event}
            userId={userId}
            onBack={() => setStep("detail")}
            onSuccess={() => setSuccess(true)}
          />
        )}

        {success && (
          <EventSuccess onClose={onClose} />
        )}
      </ModalBody>
    </Modal>
  );
}