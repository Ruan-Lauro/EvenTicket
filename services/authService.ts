import { apiFetch } from "@/lib/api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

type ApiError = {
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
};

export async function loginApi(data: LoginData) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Email ou senha inválidos");
  }

  return response.json();
}

export async function logout() {
  const response = await apiFetch("/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Erro ao sair");
  }
}

export async function getMe() {
  const response = await apiFetch("/auth/me");

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function RegisterApi(data: RegisterData) {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();

    throw error;
  }

  return response.json();
}