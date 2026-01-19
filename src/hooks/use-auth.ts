"use client";

import * as React from "react";
import { authClient } from "@/server/better-auth/client";
import type { Session } from "@/server/better-auth/client";

export function useAuth() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchSession = React.useCallback(async () => {
    try {
      const result = await authClient.getSession();
      if (result.data?.session) {
        setSession(result.data.session);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Get initial session
    void fetchSession();

    // Listen for storage events (cross-tab session sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "better-auth.session") {
        void fetchSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom auth events
    const handleAuthChange = () => {
      void fetchSession();
    };

    window.addEventListener("better-auth:session-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("better-auth:session-change", handleAuthChange);
    };
  }, [fetchSession]);

  const signOut = React.useCallback(async () => {
    try {
      await authClient.signOut();
      setSession(null);
      // Dispatch custom event for other tabs/components
      window.dispatchEvent(new Event("better-auth:session-change"));
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  return {
    session,
    user: session?.user || null,
    isLoading,
    isAuthenticated: !!session?.user,
    signOut,
    refetch: fetchSession,
  };
}

