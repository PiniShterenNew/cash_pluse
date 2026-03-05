"use client";

import { create } from "zustand";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { User, Company } from "@/lib/database.types";

interface AuthState {
  user: SupabaseUser | null;
  profile: User | null;
  company: Company | null;
  session: Session | null;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setProfile: (profile: User | null) => void;
  setCompany: (company: Company | null) => void;
  setLoading: (isLoading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  company: null,
  session: null,
  isLoading: true,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  setProfile: (profile) => set({ profile }),

  setCompany: (company) => set({ company }),

  setLoading: (isLoading) => set({ isLoading }),

  clear: () =>
    set({
      user: null,
      profile: null,
      company: null,
      session: null,
      isLoading: false,
    }),
}));
