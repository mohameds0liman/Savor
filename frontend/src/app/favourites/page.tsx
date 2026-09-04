"use client";

import Navbar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { HiOutlineHeart } from "react-icons/hi2";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import RecipeCard from "@/components/recipe/RecipeCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import type { Recipe } from "@/types/recipe";
import type { ApiResponse } from "@/types/api";

function Favourites() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [favourites, setFavourites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient
      .get<ApiResponse<Recipe[]>>("/user/favourites")
      .then((response) => setFavourites(response.data.data))
      .catch(() => setError("Failed to load favourites."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const removeFavourite = (id: string) => {
    apiClient
      .delete(`/user/favourites/${id}`)
      .then(() => {
        setFavourites((prev) => prev.filter((fav) => fav._id !== id));
      })
      .catch((err) => console.error("Failed to remove favourite", err));
  };

  const favouriteIds = new Set(favourites.map((f) => f._id));

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mb-8 border-b border-linen-border pb-6">
            <span className="font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Personal Recipe Box
            </span>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
              Saved Favourites
            </h1>
          </div>

          {authLoading || loading ? (
            <Loader label="Loading favourites…" />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : favourites.length === 0 ? (
            <EmptyState
              icon={<HiOutlineHeart />}
              title="No favourites yet"
              description="Recipes you save will show up here in your personal recipe box."
              action={
                <Link href="/">
                  <Button variant="primary">Browse Recipes</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favourites.map((fav) => (
                <RecipeCard
                  key={fav._id}
                  recipe={fav}
                  isFavourite={favouriteIds.has(fav._id)}
                  isAuthenticated={true}
                  onToggleFavourite={removeFavourite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default Favourites;
