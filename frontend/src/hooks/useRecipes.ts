"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import type { Recipe } from "@/types/recipe";
import type { ApiResponse } from "@/types/api";

// Fetches the full public recipe collection once (GET /api/recipe has no
// pagination/query-param support — memory.md §2.9 #10 — so this is always
// the entire collection). Shared by Home's Hero (recipe count stat) and
// RecipeList (search/filter/grid) so the list is only fetched once instead
// of twice on the same page.
export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get<ApiResponse<Recipe[]>>("/recipe")
      .then((res) => setRecipes(res.data.data))
      .catch(() => setError("Failed to load recipes."))
      .finally(() => setLoading(false));
  }, []);

  return { recipes, loading, error };
}
