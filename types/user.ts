export type UserRole =
  | "ADMIN"
  | "CONCIERGE"
  | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}