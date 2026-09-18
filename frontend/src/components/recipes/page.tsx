"use client";

import { useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useFavourites } from "@/hooks/useFavourites";
import { useRecipes } from "@/hooks/useRecipes";
import RecipeCard from "@/components/recipe/RecipeCard";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import type { Difficulty } from "@/types/recipe";

type SortOption = "newest" | "popular" | "rating" | "time";

// Client-side-only search/filter over the single GET /api/recipe response —
// the backend has no query-param support for search/category/difficulty/
// pagination (memory.md §2.9 #10). See DESIGN.md "Interactive Filter Chips".
function RecipeList() {
  const { recipes, loading, error } = useRecipes();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const { favouriteIds, toggleFavourite, isAuthenticated } = useFavourites();

  const categories = useMemo(
    () => Array.from(new Set(recipes.map((r) => r.category))).sort(),
    [recipes]
  );

  const filteredRecipes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = recipes.filter((r) => {
      const matchesSearch =
        q === "" ||
        r.name.toLowerCase().includes(q) ||
        r.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesCategory = category === "" || r.category === category;
      const matchesDifficulty = difficulty === "" || r.difficulty === difficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    return result.sort((a, b) => {
      if (sortBy === "popular") {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "time") {
        return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [recipes, search, category, difficulty, sortBy]);

  return (
    <div id="recipes" className="mx-auto max-w-7xl px-6 py-14 sm:px-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-2xl font-semibold text-ink">All Recipes</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-64">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search recipes, tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-linen-border bg-surface-container-lowest py-2.5 pl-9 pr-4 font-body text-sm text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="font-body text-xs font-semibold text-ink-muted whitespace-nowrap">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-linen-border bg-surface-container-lowest py-2.5 px-3 font-body text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="time">Cook Time: Shortest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <FilterChip label="All Recipes" active={category === ""} onClick={() => setCategory("")} />
        {categories.map((c) => (
          <FilterChip
            key={c}
            label={c}
            active={category === c}
            onClick={() => setCategory((prev) => (prev === c ? "" : c))}
          />
        ))}
        <span className="mx-1 hidden h-5 w-px bg-linen-border sm:inline-block" />
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <FilterChip
            key={d}
            label={d.charAt(0).toUpperCase() + d.slice(1)}
            active={difficulty === d}
            onClick={() => setDifficulty((prev) => (prev === d ? "" : d))}
          />
        ))}
      </div>

      {loading ? (
        <Loader label="Loading recipes…" />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : recipes.length === 0 ? (
        <EmptyState title="No recipes yet" description="Be the first to add a recipe!" />
      ) : filteredRecipes.length === 0 ? (
        <EmptyState
          title="No recipes match your search"
          description="Try a different search term or clear the filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              isFavourite={favouriteIds.has(recipe._id)}
              isAuthenticated={isAuthenticated}
              onToggleFavourite={toggleFavourite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-on-primary"
          : "border-linen-border bg-surface-container-lowest text-ink-muted hover:border-primary/40 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

export default RecipeList;
