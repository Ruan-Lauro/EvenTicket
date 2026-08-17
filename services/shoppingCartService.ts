import { apiFetch } from "@/lib/api";
import {
  ShoppingCart,
  ShoppingCartCreateData,
  ShoppingCartUpdateData,
} from "@/types/shoppingCart";

type ApiError = {
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
};

export async function getShoppingCartByIdApi(id: number) {
  const response = await apiFetch(`/shopCart/${id}`);

  if (!response.ok) {
    throw new Error("Carrinho não encontrado");
  }

  return response.json() as Promise<ShoppingCart>;
}

export async function getShoppingCartByUserIdApi(userId: number) {
  const response = await apiFetch(`/shopCart/user/${userId}`);

  if (!response.ok) {
    throw new Error("Carrinho do usuário não encontrado");
  }

  return response.json() as Promise<ShoppingCart>;
}

export async function createShoppingCartApi(
  data: ShoppingCartCreateData
) {
  const response = await apiFetch("/shopCart", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }

  return response.json() as Promise<ShoppingCart>;
}

export async function updateShoppingCartApi(
  id: number,
  data: ShoppingCartUpdateData
) {
  const response = await apiFetch(`/shopCart/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }

  return response.json() as Promise<ShoppingCart>;
}

export async function deleteShoppingCartApi(id: number) {
  const response = await apiFetch(`/shopCart/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir carrinho");
  }
}