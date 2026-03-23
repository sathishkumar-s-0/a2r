import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminLoginResponseAdmin } from "@workspace/api-client-react";

interface AdminAuthState {
  token: string | null;
  admin: AdminLoginResponseAdmin | null;
  setAuth: (token: string, admin: AdminLoginResponseAdmin) => void;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      setAuth: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
    }),
    {
      name: "a2r-admin-auth",
    }
  )
);

// Helper to get auth headers for API calls
export const useAuthHeaders = () => {
  const token = useAdminAuth((s) => s.token);
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};
