"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import MainPage from "@/components/main";
import Hero from "@/components/hero";
import Breadcrumb from "@/components/breadcrumb";
import ShowEvent from "@/components/event/showEvent";
import Modal from "@/components/modal/modal";
import ModalHeader from "@/components/modal/ModalHeader";
import ModalBody from "@/components/modal/ModalBody";
import Button from "@/components/Button";
import ButtonExit from "@/components/ButtonExit";
import Input from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import {
  deletePublicationApi,
  getPublicationsByUserIdApi,
  updatePublicationApi,
} from "@/services/publicationService";
import type { Publication } from "@/types/publication";
import heroImage from "@/assets/hero.webp";

function splitLocal(local: string) {
  const parts = local
    .split(/\\/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    address: parts[0] ?? "",
    city: parts[1] ?? "",
    state: parts[2] ?? "",
    country: parts[3] ?? parts[parts.length - 1] ?? "Brasil",
  };
}

function formatLocalDateTimeInput(date: Date | string) {
  const parsedDate = new Date(date);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
    parsedDate.getDate(),
  )}T${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}

function normalizeImage(image?: string | null) {
  return image || heroImage.src;
}

export default function MyEvents() {
  const { user } = useAuth();
  const router = useRouter();

  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    date: "",
    price: "",
    capacity: "",
  });

  const loadPublications = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const data = await getPublicationsByUserIdApi(Number(user.id));
      setPublications(Array.isArray(data) ? data : [data]);
    } catch {
      setPublications([]);
      toast.error("Não foi possível carregar seus eventos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    if (user.role !== "ORGANIZER") {
      toast.error("Você não tem acesso a essa página");
      router.push("/home");
      return;
    }

    loadPublications();
  }, [user, router]);

  function openEditModal(publication: Publication) {
    const local = splitLocal(publication.local);

    setSelectedPublication(publication);
    setForm({
      address: local.address,
      city: local.city,
      state: local.state,
      country: local.country,
      date: formatLocalDateTimeInput(publication.date),
      price: String(publication.price),
      capacity: String(publication.capacity),
    });
  }

  function handleFormChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;

    if (name === "price" || name === "capacity") {
      const sanitized = value.replace(/^-/, "").replace(/(\..*)\./g, "$1");

      if (value === "" || /^\d*(\.\d{0,2})?$/.test(sanitized)) {
        setForm((prev) => ({
          ...prev,
          [name]: sanitized,
        }));
      }

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave() {
    if (!selectedPublication || !user?.id) return;

    const dateValue = new Date(form.date);
    const priceValue = Number(form.price);
    const capacityValue = Number(form.capacity);

    if (!form.address || !form.city || !form.state || !form.country) {
      toast.error("Preencha todos os campos do endereço.");
      return;
    }

    if (Number.isNaN(priceValue) || priceValue < 0) {
      toast.error("O preço deve ser maior ou igual a zero.");
      return;
    }

    if (!form.date || Number.isNaN(dateValue.getTime()) || dateValue.getTime() <= Date.now()) {
      toast.error("A data do evento precisa ser no futuro.");
      return;
    }

    if (!Number.isFinite(capacityValue) || capacityValue <= 0) {
      toast.error("A capacidade precisa ser maior que zero.");
      return;
    }

    setSaving(true);

    try {
      const local = [form.address, form.city, form.state, form.country]
        .filter(Boolean)
        .join(" \\ ");

      await updatePublicationApi(selectedPublication.id, {
        externalEventId: selectedPublication.externalEventId,
        local,
        date: dateValue,
        price: priceValue,
        capacity: capacityValue,
        status: selectedPublication.status,
        userId: Number(user.id),
      });

      toast.success("Evento atualizado com sucesso.");
      setSelectedPublication(null);
      await loadPublications();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o evento.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(publication: Publication) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o evento "${publication.name}"?`,
    );

    if (!confirmed) return;

    try {
      await deletePublicationApi(publication.id);
      toast.success("Evento removido com sucesso.");
      setPublications((current) => current.filter((item) => item.id !== publication.id));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o evento.",
      );
    }
  }

  return (
    <MainPage page={2}>
      <Hero img={heroImage} keyword="Eventos" text="Meus" />

      <main className="w-full flex flex-col items-center px-4 pb-12">
        <div className="w-full max-w-6xl flex flex-col gap-4 mb-6 pt-2">
          <Breadcrumb />
        </div>

        {selectedPublication && (
          <Modal onClose={() => setSelectedPublication(null)}>
            <ModalHeader
              image={normalizeImage(selectedPublication.image)}
              imageAlt={selectedPublication.name}
              badge={selectedPublication.type || "Evento"}
              onClose={() => setSelectedPublication(null)}
            >
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-white text-2xl font-bold leading-tight">
                  {selectedPublication.name}
                </h2>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  name="address"
                  label="Endereço"
                  placeholder="Rua, número..."
                  value={form.address}
                  onChange={handleFormChange}
                  required
                />

                <Input
                  name="city"
                  label="Cidade"
                  placeholder="São Paulo"
                  value={form.city}
                  onChange={handleFormChange}
                  required
                />

                <Input
                  name="state"
                  label="Estado"
                  placeholder="SP"
                  value={form.state}
                  onChange={handleFormChange}
                  required
                />

                <Input
                  name="country"
                  label="País"
                  placeholder="Brasil"
                  value={form.country}
                  onChange={handleFormChange}
                  required
                />

                <Input
                  name="date"
                  label="Data do evento"
                  type="datetime-local"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                />

                <Input
                  name="price"
                  label="Preço (R$)"
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={handleFormChange}
                  min={0}
                  step="0.01"
                  required
                />

                <div className="sm:col-span-2">
                  <Input
                    name="capacity"
                    label="Capacidade"
                    type="number"
                    placeholder="500"
                    value={form.capacity}
                    onChange={handleFormChange}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="flex w-full justify-between mt-6 gap-3">
                <ButtonExit
                  onClick={() => setSelectedPublication(null)}
                  className="max-w-50"
                >
                  Cancelar
                </ButtonExit>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="max-w-50"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </ModalBody>
          </Modal>
        )}

        {loading ? (
          <div className="w-full max-w-6xl">
            <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 animate-pulse rounded-md bg-gray-200"
                />
              ))}
            </div>
          </div>
        ) : publications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500 font-medium">Você ainda não possui eventos publicados.</p>
            <p className="text-sm text-gray-400 mt-1">Crie seu primeiro evento para começar.</p>
          </div>
        ) : (
          <div className="w-full max-w-6xl grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
            {publications.map((publication) => {
              const localInfo = splitLocal(publication.local);

              return (
                <div key={publication.id} className="flex flex-col gap-3">
                  <div
                    onClick={() => openEditModal(publication)}
                    className="cursor-pointer"
                  >
                    <ShowEvent
                      title={publication.name}
                      city={localInfo.city || "Local"}
                      country={localInfo.country || "Brasil"}
                      gender={publication.type || "Evento"}
                      img={normalizeImage(publication.image)}
                      onClick={() => openEditModal(publication)}
                    />
                  </div>

                  <div className="flex w-full gap-2">
                    <Button
                      onClick={() => openEditModal(publication)}
                      className="max-w-none"
                    >
                      Editar
                    </Button>

                    <ButtonExit
                      onClick={() => handleDelete(publication)}
                      className="max-w-none"
                    >
                      Excluir
                    </ButtonExit>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </MainPage>
  );
}
