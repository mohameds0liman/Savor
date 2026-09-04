"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Redirects to /login when the current user isn't authenticated.
// Used by protected pages (M3/M4/M5) so route protection can be adopted
// consistently without each page re-implementing the same check.
//
// NOTE: this is a client-side-only guard. True server-side middleware
// protection is not possible today because auth tokens live in
// localStorage, not cookies (see PRD.md §5 / Design.md §11) — middleware
// runs on the server and cannot read localStorage. This hook only prevents
// a *rendered* flash of protected content; it cannot prevent the page
// component itself from being requested from the server.
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return { isAuthenticated, isLoading };
}
