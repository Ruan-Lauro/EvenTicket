import { apiFetch } from "@/lib/api";
import { ApiError } from "next/dist/server/api-utils";

export interface userWithRole {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
}

export async function CreateUserWithRole(data: userWithRole) {
  const response = await apiFetch("/user/createwithrole", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();

    throw error;
  }

  return response.json();
}