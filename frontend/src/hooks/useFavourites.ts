"use client";

import { useCallback, useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import type { Recipe } from "@/types/recipe";
import type { ApiResponse } from "@/types/api";

import { useToast } from "@/components/common/Toast";

const EMPTY_SET: Set<string> = new Set();

// Centralizes the favourite-toggle logic that used to be duplicated across
// components/recipes/page.tsx and app/recipes/[id]/page.tsx (memory.md
// bug-adjacent duplication). GET /user/favourites is fully populated
// (memory.md §2.9 #9), but this hook only needs the ids for membership
// checks, so it maps down to a Set<string>.
export function useFavourites() {
  const { isAuthenticated } = useAuth();
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(EMPTY_SET);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient
      .get<ApiResponse<Recipe[]>>("/user/favourites")
      .then((res) => {
        setFavouriteIds(new Set(res.data.data.map((r) => r._id)));
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const toggleFavourite = useCallback(
    (id: string) => {
      const isFavourite = favouriteIds.has(id);
      const request = isFavourite
        ? apiClient.delete(`/user/favourites/${id}`)
        : apiClient.post(`/user/favourites/${id}`);

      return request
        .then(() => {
          setFavouriteIds((prev) => {
            const next = new Set(prev);
            if (isFavourite) next.delete(id);
            else next.add(id);
            return next;
          });
          showToast(
            isFavourite ? "Removed from favourites" : "Saved to favourites",
            "success"
          );
        })
        .catch(() => {
          showToast("Failed to update favourites", "error");
        });
    },
    [favouriteIds, showToast]
  );

  // Mask stale ids once logged out so unauthenticated views never show a
  // filled heart from a previous session on the same mounted component.
  const effectiveIds = isAuthenticated ? favouriteIds : EMPTY_SET;

  return { favouriteIds: effectiveIds, toggleFavourite, isAuthenticated };
}
