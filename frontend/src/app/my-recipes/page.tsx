"use client";

import Navbar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useFavourites } from "@/hooks/useFavourites";
import { useToast } from "@/components/common/Toast";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import RecipeCard from "@/components/recipe/RecipeCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineBookOpen } from "react-icons/hi2";
import type { Recipe } from "@/types/recipe";
import type { ApiResponse } from "@/types/api";

function MyRecipes() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { favouriteIds, toggleFavourite } = useFavourites();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient
      .get<ApiResponse<Recipe[]>>("/recipe/my")
      .then((response) => setUserRecipes(response.data.data))
      .catch(() => setError("Failed to load your recipes."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    apiClient
      .delete(`/recipe/${deleteTarget._id}`)
      .then(() => {
        setUserRecipes((prev) => prev.filter((r) => r._id !== deleteTarget._id));
        showToast("Recipe deleted", "success");
        setDeleteTarget(null);
      })
      .catch(() => showToast("Failed to delete recipe", "error"))
      .finally(() => setIsDeleting(false));
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mb-8 flex flex-col gap-4 border-b border-linen-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Author Dashboard
              </span>
              <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
                My Published Recipes
              </h1>
            </div>
            <Link href="/create-recipe">
              <Button variant="primary">+ Create Recipe</Button>
            </Link>
          </div>

          {authLoading || loading ? (
            <Loader label="Loading your recipes…" />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : userRecipes.length === 0 ? (
            <EmptyState
              icon={<HiOutlineBookOpen />}
              title="You haven't created any recipes yet"
              description="Share your family classics or secret weekend creations with the world."
              action={
                <Link href="/create-recipe">
                  <Button variant="primary">Create your first recipe</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  isFavourite={favouriteIds.has(recipe._id)}
                  isAuthenticated={isAuthenticated}
                  onToggleFavourite={toggleFavourite}
                  actions={
                    <>
                      <Link href={`/my-recipes/${recipe._id}`}>
                        <Button variant="ghost" aria-label="Edit recipe">
                          <HiOutlinePencil />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="icon"
                        aria-label="Delete recipe"
                        onClick={() => setDeleteTarget(recipe)}
                      >
                        <HiOutlineTrash />
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete recipe?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        This will permanently delete &quot;{deleteTarget?.name}&quot;. This action cannot be
        undone.
      </Modal>
      <Footer />
    </main>
  );
}

export default MyRecipes;
