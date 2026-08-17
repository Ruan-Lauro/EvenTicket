import { apiFetch } from "@/lib/api";
import {
  ShoppingCartItem,
  ShoppingCartItemCreateData,
} from "@/types/shoppingCartItem";

type ApiError = {
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
};

export async function getShoppingCartItemsApi() {
  const response = await apiFetch("/cartItem");

  if (!response.ok) {
    throw new Error("Erro ao buscar itens do carrinho");
  }

  return response.json() as Promise<ShoppingCartItem[]>;
}

export async function addShoppingCartItemApi(
  data: ShoppingCartItemCreateData
) {
  const response = await apiFetch("/cartItem", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }

  return response.json() as Promise<ShoppingCartItem>;
}

export async function removeShoppingCartItemApi(id: number) {
  const response = await apiFetch(`/cartItem/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }
}