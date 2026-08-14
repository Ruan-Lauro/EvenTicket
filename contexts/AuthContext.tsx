"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMe } from "@/services/authService";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextData = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getMe();

        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}