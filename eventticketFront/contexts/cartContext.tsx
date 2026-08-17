"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getShoppingCartByUserIdApi } from "@/services/shoppingCartService";
import { getShoppingCartItemsApi } from "@/services/shoppingCartItemService";
import { ShoppingCart } from "@/types/shoppingCart";
import { ShoppingCartItem } from "@/types/shoppingCartItem";
import { useAuth } from "@/hooks/useAuth";

interface CartContextValue {
  cart: ShoppingCart | null;
  items: ShoppingCartItem[];
  itemCount: number;
  isOpen: boolean;
  loadingN: boolean;
  openCart: () => void;
  closeCart: () => void;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [items, setItems] = useState<ShoppingCartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingN, setLoadingN] = useState(false);
  const { user, loading } = useAuth();

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      setItems([]);
      return;
    }

    setLoadingN(true);

    try {
      const [cartData, itemsData] = await Promise.all([
        getShoppingCartByUserIdApi(user.id),
        getShoppingCartItemsApi(),
      ]);
      setCart(cartData);
      setItems(itemsData);
    } catch {
      setCart(null);
      setItems([]);
    } finally {
      setLoadingN(false);
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;
    refresh();
  }, [loading, refresh]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount: items.length,
        isOpen,
        loadingN,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}