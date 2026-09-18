"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { HiHeart, HiOutlineHeart, HiOutlineClock } from "react-icons/hi2";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import type { Recipe } from "@/types/recipe";

type RecipeCardProps = {
  recipe: Recipe;
  isFavourite: boolean;
  isAuthenticated: boolean;
  onToggleFavourite: (id: string) => void;
  // Optional owner actions (Edit/Delete) rendered below the card body —
  // used by My Recipes, omitted on Home/Favourites.
  actions?: ReactNode;
};

// Matches DESIGN.md "Recipe Grid & Cards" + image-home.png reference:
// 4:3 media, floating difficulty badge (top-left) + favourite heart
// (top-right), serif title, prep/cook time + category meta row.
function RecipeCard({ recipe, isFavourite, isAuthenticated, onToggleFavourite, actions }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-linen-border bg-surface-container-lowest shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <Link href={`/recipes/${recipe._id}`} className="relative block aspect-[4/3] overflow-hidden">
        {!imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image}
            alt={recipe.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-container-high text-4xl text-outline">
            🍽️
          </div>
        )}

        <span className="absolute left-2.5 top-2.5">
          <DifficultyBadge difficulty={recipe.difficulty} />
        </span>

        <button
          type="button"
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
          title={!isAuthenticated ? "Log in to save favourites" : undefined}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isAuthenticated) return;
            onToggleFavourite(recipe._id);
          }}
          className="absolute right-2.5 top-2.5 rounded-full bg-[rgba(253,251,247,0.85)] p-2 text-lg shadow transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isAuthenticated}
        >
          {isFavourite ? (
            <HiHeart className="text-primary" />
          ) : (
            <HiOutlineHeart className="text-ink" />
          )}
        </button>
      </Link>

      <Link href={`/recipes/${recipe._id}`} className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-display text-lg font-semibold leading-snug text-ink line-clamp-1">
          {recipe.name}
        </h2>
        <p className="font-body text-sm text-ink-muted line-clamp-2">{recipe.brief}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 font-body text-xs text-ink-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono tabular-nums">
              <HiOutlineClock className="text-outline" />
              {recipe.prepTime + recipe.cookTime}m
            </span>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-ink-muted">
              {recipe.category}
            </span>
          </div>
          {typeof recipe.owner === "object" && recipe.owner?.name && (
            <span className="max-w-[110px] truncate text-[11px] text-ink-muted/80" title={`by ${recipe.owner.name}`}>
              by {recipe.owner.name}
            </span>
          )}
        </div>
      </Link>
      {actions && (
        <div className="flex items-center justify-end gap-2 border-t border-linen-border p-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
