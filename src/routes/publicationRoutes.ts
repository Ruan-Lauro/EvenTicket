import { Router } from "express";
import { PublicationController } from "../controllers/publicationController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { requireRole } from "../middlewares/roleMiddleware.ts";
import {PublicationRepository } from "../repositories/publicationRepository.ts";
import {PublicationService } from "../services/publicationService.ts";
import { SeatRepository } from "../repositories/seatRepository.ts";
import { SeatService } from "../services/seatService.ts";

const router = Router();

const seatRepository = new SeatRepository();
const seatService = new SeatService(seatRepository);
const publicationRepository = new PublicationRepository();
const publicationService = new PublicationService(publicationRepository, seatService);
const publicationController = new PublicationController(publicationService);

router.get("/", authMiddleware, (req, res) =>
  publicationController.getPublications(req, res),
);

router.get("/:id", authMiddleware, (req, res) =>
  publicationController.getPublicationById(req, res),
);

router.put("/:id", authMiddleware, requireRole("ORGANIZER"), (req, res) =>
  publicationController.updatePublication(req, res),
);

router.post("/", authMiddleware, requireRole("ORGANIZER"), (req, res) =>
  publicationController.createPublication(req, res),
);

router.delete("/:id", authMiddleware, requireRole("ORGANIZER"), (req, res) =>
  publicationController.deletePublication(req, res),
);

export default router;
