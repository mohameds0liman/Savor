"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import {
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineEye,
  HiOutlineStar,
  HiHeart,
  HiOutlineHeart,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
} from "react-icons/hi2";
import Navbar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import { useAuth } from "@/context/AuthContext";
import { useFavourites } from "@/hooks/useFavourites";
import { useToast } from "@/components/common/Toast";
import apiClient from "@/lib/axios";
import type { Recipe } from "@/types/recipe";
import type { ApiResponse } from "@/types/api";

function RecipeDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { favouriteIds, toggleFavourite } = useFavourites();
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Interactive ingredient checklist state (client local UI state only)
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<ApiResponse<Recipe>>(`/recipe/${params.id}`)
      .then((res) => {
        if (cancelled) return;
        setRecipe(res.data.data);
      })
      .catch((err: AxiosError) => {
        if (cancelled) return;
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  function handleDelete() {
    if (!recipe) return;
    setIsDeleting(true);
    apiClient
      .delete(`/recipe/${recipe._id}`)
      .then(() => {
        showToast("Recipe deleted", "success");
        router.push("/my-recipes");
      })
      .catch(() => {
        showToast("Failed to delete recipe", "error");
        setIsDeleting(false);
        setDeleteModalOpen(false);
      });
  }

  function toggleIngredient(idx: number) {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  const isOwner = Boolean(recipe && user && recipe.owner === user.id);
  const isFavourite = recipe ? favouriteIds.has(recipe._id) : false;

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <div className="pt-24 pb-16">
        {loading ? (
          <Loader label="Loading recipe details…" />
        ) : notFound || !recipe ? (
          <EmptyState
            title="Recipe not found"
            description="This recipe may have been deleted or never existed."
            action={
              <Link href="/">
                <Button variant="primary">Back to Home</Button>
              </Link>
            }
          />
        ) : (
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            {/* Top metadata header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <DifficultyBadge difficulty={recipe.difficulty} />
                <span className="rounded-full bg-surface-container-high px-3 py-1 font-body text-xs font-semibold text-ink-muted">
                  {recipe.category}
                </span>
              </div>

              {isOwner && (
                <div className="flex items-center gap-2">
                  <Link href={`/my-recipes/${recipe._id}`}>
                    <Button variant="ghost" aria-label="Edit recipe">
                      <HiOutlinePencil /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    aria-label="Delete recipe"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <HiOutlineTrash /> Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Title & brief summary */}
            <h1 className="font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">
              {recipe.name}
            </h1>
            <p className="mt-3 max-w-3xl font-body text-lg leading-relaxed text-ink-muted">
              {recipe.brief}
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-6 flex flex-wrap items-center gap-6 border-y border-linen-border py-4 font-body text-sm text-ink-muted">
              <span className="flex items-center gap-2">
                <HiOutlineClock className="text-primary" />
                <span>
                  Prep <strong>{recipe.prepTime}m</strong> · Cook <strong>{recipe.cookTime}m</strong>
                </span>
              </span>
              <span className="flex items-center gap-2">
                <HiOutlineUserGroup className="text-primary" />
                <span>
                  Yields <strong>{recipe.servings} servings</strong>
                </span>
              </span>
              <span className="flex items-center gap-2">
                <HiOutlineEye className="text-outline" />
                <span>{recipe.views} views</span>
              </span>
              <span className="flex items-center gap-2">
                <HiOutlineStar className="text-secondary" />
                <span>
                  <strong>{recipe.rating.toFixed(1)}</strong> / 5 ({recipe.ratingsCount} reviews)
                </span>
              </span>
            </div>

            {/* Hero Media + Overview Row */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-linen-border bg-surface-container-high shadow-[var(--shadow-card)] lg:col-span-8">
                {!imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl text-outline">
                    🍽️
                  </div>
                )}

                <button
                  type="button"
                  aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                  title={!isAuthenticated ? "Log in to save favourites" : undefined}
                  onClick={() => isAuthenticated && toggleFavourite(recipe._id)}
                  disabled={!isAuthenticated}
                  className="absolute right-4 top-4 rounded-full bg-[rgba(253,251,247,0.9)] p-3 text-xl shadow-[var(--shadow-card-hover)] backdrop-blur-md transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFavourite ? (
                    <HiHeart className="text-primary" />
                  ) : (
                    <HiOutlineHeart className="text-ink" />
                  )}
                </button>
              </div>

              {/* Story / Description card */}
              <div className="lg:col-span-4">
                <Card className="flex h-full flex-col justify-between p-6 sm:p-8">
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">About This Dish</h3>
                    <p className="mt-4 whitespace-pre-line font-body text-sm leading-relaxed text-ink-muted">
                      {recipe.description || recipe.brief}
                    </p>
                  </div>

                  {recipe.tags.length > 0 && (
                    <div className="mt-6 border-t border-linen-border pt-4">
                      <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        Tags
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-tertiary-container/20 px-3 py-1 font-body text-xs font-semibold text-on-tertiary-container"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Ingredients & Method Split */}
            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* Ingredients Column */}
              <div className="lg:col-span-5">
                <Card className="sticky top-24 p-6 sm:p-8">
                  <div className="flex items-center justify-between border-b border-linen-border pb-4">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-ink">Ingredients</h2>
                      <p className="font-body text-xs text-ink-muted">
                        Tap items to check them off as you cook.
                      </p>
                    </div>
                    <span className="rounded-full bg-surface-container-high px-3 py-1 font-mono text-xs font-bold text-ink">
                      {recipe.ingredients.length} items
                    </span>
                  </div>

                  <ul className="mt-6 flex flex-col gap-3">
                    {recipe.ingredients.map((ing, i) => {
                      const isChecked = Boolean(checkedIngredients[i]);
                      return (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => toggleIngredient(i)}
                            className="flex w-full items-center gap-3 text-left transition-opacity hover:opacity-80"
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                                isChecked
                                  ? "border-tertiary bg-tertiary text-on-tertiary"
                                  : "border-linen-border bg-surface-container-lowest text-transparent"
                              }`}
                            >
                              <HiOutlineCheck className="h-3.5 w-3.5" />
                            </span>
                            <span
                              className={`font-body text-sm ${
                                isChecked ? "text-ink-muted line-through" : "text-ink font-medium"
                              }`}
                            >
                              <strong>
                                {ing.quantity} {ing.unit ? `${ing.unit} ` : ""}
                              </strong>
                              {ing.name}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </div>

              {/* Instructions Column */}
              <div className="lg:col-span-7">
                <Card className="p-6 sm:p-8">
                  <div className="border-b border-linen-border pb-4">
                    <h2 className="font-display text-2xl font-bold text-ink">Instructions</h2>
                    <p className="font-body text-xs text-ink-muted">
                      Follow step-by-step for optimal flavor.
                    </p>
                  </div>

                  <ol className="mt-6 flex flex-col gap-6">
                    {recipe.instructions.map((step, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-display text-sm font-bold text-on-primary-fixed">
                          {i + 1}
                        </span>
                        <div className="pt-1">
                          <h4 className="font-display text-base font-semibold text-ink">
                            Step {i + 1}
                          </h4>
                          <p className="mt-1 font-body text-base leading-relaxed text-on-surface-variant">
                            {step}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete recipe?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        This will permanently delete &quot;{recipe?.name}&quot;. This action cannot be undone.
      </Modal>
    </main>
  );
}

export default RecipeDetail;
