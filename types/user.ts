export type UserRole =
  | "ADMIN"
  | "CONCIERGE"
  | "ORGANIZER"   
  | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}