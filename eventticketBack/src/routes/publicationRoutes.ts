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

router.get("/", authMiddleware, (req, res, next) =>
  publicationController.getPublications(req, res, next),
);

router.get("/search", authMiddleware, (req, res, next) =>
  publicationController.searchPublications(req, res, next),
);

router.get("/categories", authMiddleware, (req, res, next) =>
  publicationController.getPublicationCategories(req, res, next),
);

router.get("/user/:id", authMiddleware, (req, res, next) =>
  publicationController.getPublicationsByUserId(req, res, next),
);

router.get("/seat/:id", (req, res, next) =>
  publicationController.getPublicationBySeatId(req, res, next),
);

router.get("/:id/seats", (req, res, next) =>
  publicationController.getSeatsByPublicationId(req, res, next),
);

router.get("/:id", (req, res, next) =>
  publicationController.getPublicationById(req, res, next),
);

router.put("/:id", authMiddleware, requireRole("ORGANIZER"), (req, res, next) =>
  publicationController.updatePublication(req, res, next),
);

router.post("/", authMiddleware, requireRole("ORGANIZER"), (req, res, next) =>
  publicationController.createPublication(req, res, next),
);

router.delete("/:id", authMiddleware, requireRole("ORGANIZER"), (req, res, next) =>
  publicationController.deletePublication(req, res, next),
);

export default router;
