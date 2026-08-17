import { Publication, Seat } from "./publication";
import { Ticket } from "./ticket";

export type ScanMode = "idle" | "camera" | "manual";
export type ValidationState =
  | { phase: "idle" }
  | { phase: "looking"; code: string }
  | { phase: "confirming"; ticket: Ticket; code: string }
  | { phase: "validating"; ticket: Ticket; code: string }
  | { phase: "success"; ticket: Ticket; publication: Publication; seat: Seat }
  | { phase: "error"; kind: ErrorKind; message: string; code?: string };

export type ErrorKind = "not_found" | "already_used" | "cancelled" | "unknown";