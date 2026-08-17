"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ButtonExit from "@/components/ButtonExit";
import { createPublicationApi } from "@/services/publicationService";
import { TicketMasterEvent } from "@/types/ticketmaster";

interface EventPublicationFormProps {
  event: TicketMasterEvent;
  userId: number;
  onBack: () => void;
  onSuccess: () => void;
}

interface FormData {
  city: string;
  address: string;
  state: string;
  country: string;
  date: string;
  price: string;
  capacity: string;
}

function formatLocalDateTimeInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventPublicationForm({
  event,
  userId,
  onBack,
  onSuccess,
}: EventPublicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    city: "",
    address: "",
    state: "",
    country: "",
    date: "",
    price: "",
    capacity: "",
  });

  const minDateTime = formatLocalDateTimeInput(
    new Date(Date.now() + 60_000)
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    if (name === "price" || name === "capacity") {
      const sanitizedValue = value
        .replace(/^-/, "")
        .replace(/(\..*)\./g, "$1");

      if (
        value === "" ||
        /^\d*(\.\d{0,2})?$/.test(sanitizedValue)
      ) {
        setForm((prev) => ({
          ...prev,
          [name]: sanitizedValue,
        }));
      }

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const priceValue = Number(form.price);
    const eventDate = new Date(form.date);

    const isDateValid =
      form.date &&
      !Number.isNaN(eventDate.getTime()) &&
      eventDate.getTime() > Date.now();

    if (Number.isNaN(priceValue) || priceValue < 0) {
      setError(
        "O preço do evento deve ser maior ou igual a zero."
      );

      setLoading(false);
      return;
    }

    if (!isDateValid) {
      setError(
        "A data e a hora do evento precisam ser no futuro."
      );

      setLoading(false);
      return;
    }

    try {
      const local = [
        form.address,
        form.city,
        form.state,
        form.country,
      ]
        .filter(Boolean)
        .join(" \\ ");

      await createPublicationApi({
        externalEventId: event.id,
        local,
        date: eventDate,
        price: priceValue,
        capacity: parseInt(form.capacity, 10),
        status: "PUBLISHED",
        userId,
      });

      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao criar evento. Verifique os dados e tente novamente.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col overflow-auto">
      <h3 className="text-lg font-bold text-gray-800 mb-1">
        Publicar evento
      </h3>

      <p className="text-sm text-gray-500 mb-5">
        Preencha os dados da sua publicação para{" "}
        <span className="font-medium text-gray-700">
          {event.name}
        </span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          name="address"
          label="Endereço"
          placeholder="Rua, número..."
          value={form.address}
          onChange={handleChange}
          required
        />

        <Input
          name="city"
          label="Cidade"
          placeholder="São Paulo"
          value={form.city}
          onChange={handleChange}
          required
        />

        <Input
          name="state"
          label="Estado"
          placeholder="SP"
          value={form.state}
          onChange={handleChange}
          required
        />

        <Input
          name="country"
          label="País"
          placeholder="Brasil"
          value={form.country}
          onChange={handleChange}
          required
        />

        <Input
          name="date"
          label="Data do evento"
          type="datetime-local"
          value={form.date}
          onChange={handleChange}
          min={minDateTime}
          required
        />

        <Input
          name="price"
          label="Preço (R$)"
          type="number"
          placeholder="0.00"
          value={form.price}
          onChange={handleChange}
          min={0}
          step="0.01"
          required
        />

        <div className="sm:col-span-2">
          <Input
            name="capacity"
            label="Capacidade (pessoas)"
            type="number"
            placeholder="500"
            value={form.capacity}
            onChange={handleChange}
            min={0}
            required
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-3 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex w-full justify-between mt-6">
        <ButtonExit
          onClick={onBack}
          className="max-w-50"
        >
          Voltar
        </ButtonExit>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="max-w-50"
        >
          {loading ? "Publicando..." : "Publicar evento"}
        </Button>
      </div>
    </div>
  );
}