export interface IUser {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN" | "ORGANIZER" | "CONCIERGE";
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserGet {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "ORGANIZER" | "CONCIERGE";
  emailVerified: boolean;
  createdAt: Date;
}
 
export interface IUserCreate {
  name: string;
  email: string;
  passwordHash: string;
}

export interface IUserCreateWithRole {
  name: string;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN" | "ORGANIZER" | "CONCIERGE";
}
 
export interface IUserPublic {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
}
