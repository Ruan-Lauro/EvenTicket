import { describe, it, expect, vi, beforeEach } from "vitest";
import { PublicationService } from "../../../src/services/publicationService.ts";
import { AppError } from "../../../src/errors/appError.ts";
import type { IPublicationRepository } from "../../../src/interfaces/publicationRepositoryInterface.ts";
import type { SeatService } from "../../../src/services/seatService.ts";
import { Decimal } from "@prisma/client/runtime/client";

const makePublication = (overrides = {}) => ({
  id: 1,
  userId: 10,
  externalEventId: "TM-001",
  name: "Show de Rock",
  local: "Arena",
  capacity: 100,
  description: null,
  type: "Music",
  image: null,
  status: "PUBLISHED" as const,
  price: new Decimal(150),
  date: new Date("2025-12-01"),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeTicketMasterEvent = (overrides = {}) => ({
  name: "Show de Rock",
  info: "Informações do evento",
  classifications: [{ segment: { name: "Music" } }],
  images: [{ url: "https://img.example.com/show.jpg" }],
  _embedded: { venues: [{ name: "Arena" }] },
  ...overrides,
});

const makePublicationRepo = (): IPublicationRepository => ({
  getPublications: vi.fn(),
  getPublicationById: vi.fn(),
  getPublicationByExternalEventId: vi.fn(),
  createPublication: vi.fn(),
  updatePublication: vi.fn(),
  deletePublication: vi.fn(),
  searchPublications: vi.fn(),
  getPublicationCategories: vi.fn(),
  getPublicationsByUserId: vi.fn(),
});

const makeSeatService = (): SeatService =>
  ({
    generateSeatsForPublication: vi.fn().mockResolvedValue(undefined),
  }) as unknown as SeatService;

describe("PublicationService", () => {
  let publicationRepo: IPublicationRepository;
  let seatService: SeatService;
  let publicationService: PublicationService;

  beforeEach(() => {
    vi.clearAllMocks();
    publicationRepo = makePublicationRepo();
    seatService = makeSeatService();
    publicationService = new PublicationService(publicationRepo, seatService);
  });

  describe("getPublications", () => {
    it("deve retornar todas as publicações", async () => {
      const pubs = [makePublication(), makePublication({ id: 2 })];
      vi.mocked(publicationRepo.getPublications).mockResolvedValue(pubs);

      const result = await publicationService.getPublications();

      expect(result).toEqual(pubs);
      expect(publicationRepo.getPublications).toHaveBeenCalledOnce();
    });
  });

  describe("getPublicationById", () => {
    it("deve retornar a publicação quando existe", async () => {
      const pub = makePublication();
      vi.mocked(publicationRepo.getPublicationById).mockResolvedValue(pub);

      const result = await publicationService.getPublicationById(1);

      expect(result).toEqual(pub);
    });

    it("deve lançar AppError 404 quando não existe", async () => {
      vi.mocked(publicationRepo.getPublicationById).mockResolvedValue(null);

      await expect(publicationService.getPublicationById(99)).rejects.toThrow(
        new AppError("Publicação não encontrada", 404),
      );
    });
  });

  describe("searchPublications", () => {
    it("deve delegar a busca paginada com filtros", async () => {
      const result = {
        data: [makePublication()],
        totalItems: 1,
        totalPages: 1,
        page: 1,
        total: 10,
      };
      vi.mocked(publicationRepo.searchPublications).mockResolvedValue(result);

      const response = await publicationService.searchPublications({
        search: "rock",
        gender: "Music",
        recent: true,
        page: 1,
        total: 10,
      });

      expect(response).toEqual(result);
      expect(publicationRepo.searchPublications).toHaveBeenCalledWith({
        search: "rock",
        gender: "Music",
        recent: true,
        page: 1,
        total: 10,
      });
    });
  });

  describe("getPublicationCategories", () => {
    it("deve retornar categorias únicas das publicações", async () => {
      const categories = ["Music", "Sport"];
      vi.mocked(publicationRepo.getPublicationCategories).mockResolvedValue(categories);

      const result = await publicationService.getPublicationCategories();

      expect(result).toEqual(categories);
    });
  });

  describe("getSeatsByPublicationId", () => {
    it("deve retornar assentos da publicação usando o serviço de assentos", async () => {
      const seats = [{ id: 1, publicationId: 1, row: "A", number: 1, status: "AVAILABLE" }];
      vi.spyOn(seatService, "getSeatsByPublicationId").mockResolvedValue(seats as any);

      const result = await publicationService.getSeatsByPublicationId(1);

      expect(result).toEqual(seats);
      expect(seatService.getSeatsByPublicationId).toHaveBeenCalledWith(1);
    });
  });

  describe("getPublicationsByUserId", () => {
    it("deve retornar as publicações de um organizador", async () => {
      const pubs = [makePublication({ userId: 42 }), makePublication({ id: 2, userId: 42 })];
      vi.mocked(publicationRepo.getPublicationsByUserId).mockResolvedValue(pubs);

      const result = await publicationService.getPublicationsByUserId(42);

      expect(result).toEqual(pubs);
      expect(publicationRepo.getPublicationsByUserId).toHaveBeenCalledWith(42);
    });
  });

  describe("getPublicationBySeatId", () => {
    it("deve retornar a publicação vinculada ao assento informado", async () => {
      const pub = makePublication({ id: 9 });
      vi.spyOn(seatService, "getSeatById").mockResolvedValue({
        id: 12,
        publicationId: 9,
        row: "A",
        number: 1,
        status: "AVAILABLE",
      } as any);
      vi.mocked(publicationRepo.getPublicationById).mockResolvedValue(pub);

      const result = await publicationService.getPublicationBySeatId(12);

      expect(result).toEqual(pub);
      expect(seatService.getSeatById).toHaveBeenCalledWith(12);
      expect(publicationRepo.getPublicationById).toHaveBeenCalledWith(9);
    });

    it("deve lançar AppError 404 quando o assento não existe", async () => {
      vi.spyOn(seatService, "getSeatById").mockRejectedValue(new AppError("Assento não encontrado", 404));

      await expect(publicationService.getPublicationBySeatId(999)).rejects.toThrow(
        new AppError("Assento não encontrado", 404),
      );
    });
  });

  describe("createPublication", () => {
    const validInput = {
      userId: 10,
      externalEventId: "TM-001",
      local: "Arena",
      capacity: 100,
      price: 150,
      date: new Date("2025-12-01"),
      status: "PUBLISHED" as const,
    };

    it("deve criar publicação e gerar assentos com sucesso", async () => {
      const tmEvent = makeTicketMasterEvent();
      vi.spyOn(publicationService, "findByIdTicketMaster").mockResolvedValue(tmEvent);
      vi.mocked(publicationRepo.getPublicationByExternalEventId).mockResolvedValue(null);
      const created = makePublication();
      vi.mocked(publicationRepo.createPublication).mockResolvedValue(created);

      const result = await publicationService.createPublication(validInput);

      expect(publicationRepo.createPublication).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: validInput.userId,
          externalEventId: validInput.externalEventId,
          name: tmEvent.name,
          local: tmEvent._embedded.venues[0].name,
          capacity: validInput.capacity,
          price: new Decimal(validInput.price),
        }),
      );
      expect(seatService.generateSeatsForPublication).toHaveBeenCalledWith(
        created.id,
        validInput.capacity,
      );
      expect(result).toEqual(created);
    });

    it("deve lançar AppError 404 quando evento não existe no TicketMaster", async () => {
      vi.spyOn(publicationService, "findByIdTicketMaster").mockResolvedValue(null);

      await expect(publicationService.createPublication(validInput)).rejects.toThrow(
        new AppError("Evento não encontrado na TicketMaster", 404),
      );

      expect(publicationRepo.createPublication).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 400 quando publicação já existe para o evento", async () => {
      vi.spyOn(publicationService, "findByIdTicketMaster").mockResolvedValue(
        makeTicketMasterEvent(),
      );
      vi.mocked(publicationRepo.getPublicationByExternalEventId).mockResolvedValue(
        makePublication(),
      );

      await expect(publicationService.createPublication(validInput)).rejects.toThrow(
        new AppError("Publicação já existe para este evento", 400),
      );

      expect(publicationRepo.createPublication).not.toHaveBeenCalled();
      expect(seatService.generateSeatsForPublication).not.toHaveBeenCalled();
    });

    it("deve usar info como description quando disponível no evento", async () => {
      const tmEvent = makeTicketMasterEvent({ info: "Detalhes do show" });
      vi.spyOn(publicationService, "findByIdTicketMaster").mockResolvedValue(tmEvent);
      vi.mocked(publicationRepo.getPublicationByExternalEventId).mockResolvedValue(null);
      vi.mocked(publicationRepo.createPublication).mockResolvedValue(makePublication());

      await publicationService.createPublication(validInput);

      expect(publicationRepo.createPublication).toHaveBeenCalledWith(
        expect.objectContaining({ description: "Detalhes do show" }),
      );
    });
  });

  describe("updatePublication", () => {
    it("deve atualizar a publicação com os dados fornecidos", async () => {
      const existing = makePublication();
      vi.mocked(publicationRepo.getPublicationById).mockResolvedValue(existing);
      vi.mocked(publicationRepo.updatePublication).mockResolvedValue({
        ...existing,
        name: "Novo Nome",
      });

      const result = await publicationService.updatePublication(1, {
        externalEventId: "TM-001",
        userId: 10,
        local: "Nova Arena",
        capacity: 200,
        price: 200,
        date: new Date(),
        status: "DRAFT",
      });

      expect(publicationRepo.updatePublication).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ price: new Decimal(200) }),
      );
    });

    it("deve lançar AppError 404 quando publicação não existe", async () => {
      vi.mocked(publicationRepo.getPublicationById).mockResolvedValue(null);

      await expect(
        publicationService.updatePublication(99, {}),
      ).rejects.toThrow(new AppError("Publicação não encontrada", 404));
    });

    it("deve passar price como undefined quando não fornecido", async () => {
      vi.mocked(publicationRepo.getPublicationById).mockResolvedValue(makePublication());
      vi.mocked(publicationRepo.updatePublication).mockResolvedValue(makePublication());

      await publicationService.updatePublication(1, { capacity: 50 });

      expect(publicationRepo.updatePublication).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ price: undefined }),
      );
    });
  });

  describe("deletePublication", () => {
    it("deve deletar a publicação quando existe", async () => {
      vi.mocked(publicationRepo.getPublicationById).mockResolvedValue(makePublication());
      vi.mocked(publicationRepo.deletePublication).mockResolvedValue();

      await publicationService.deletePublication(1);

      expect(publicationRepo.deletePublication).toHaveBeenCalledWith(1);
    });

    it("deve lançar AppError 404 quando não existe", async () => {
      vi.mocked(publicationRepo.getPublicationById).mockResolvedValue(null);

      await expect(publicationService.deletePublication(99)).rejects.toThrow(
        new AppError("Publicação não encontrada", 404),
      );
    });
  });

  describe("findByIdTicketMaster", () => {
    it("deve retornar null quando a API retorna status não-ok", async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
      process.env.TICKETMASTER_API_KEY = "test_key";

      const result = await publicationService.findByIdTicketMaster("TM-INVALID");

      expect(result).toBeNull();
    });

    it("deve retornar o JSON do evento quando a API responde com sucesso", async () => {
      const event = makeTicketMasterEvent();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(event) }));
      process.env.TICKETMASTER_API_KEY = "test_key";

      const result = await publicationService.findByIdTicketMaster("TM-001");

      expect(result).toEqual(event);
    });
  });
});