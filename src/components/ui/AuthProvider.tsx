"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import type { Database } from "@/lib/database.types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

interface UserWithCompany extends UserRow {
  company: CompanyRow | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setProfile, setCompany, setLoading, clear } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from("users")
        .select("*, company:companies!company_id(*)")
        .eq("id", userId)
        .single<UserWithCompany>();

      if (data) {
        setProfile(data);
        setCompany(data.company);
      }
    }

    // Initialize from current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await loadProfile(session.user.id);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          clear();
        }
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
