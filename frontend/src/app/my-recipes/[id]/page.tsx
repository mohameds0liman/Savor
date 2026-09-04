"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import Navbar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/common/Toast";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import RecipeForm, {
  toCreateRecipeInput,
  type RecipeFormValues,
} from "@/components/recipe/RecipeForm";
import apiClient from "@/lib/axios";
import type { Recipe } from "@/types/recipe";
import type { ApiResponse } from "@/types/api";

function recipeToFormValues(recipe: Recipe): RecipeFormValues {
  return {
    name: recipe.name,
    brief: recipe.brief,
    description: recipe.description ?? "",
    image: recipe.image,
    category: recipe.category,
    difficulty: recipe.difficulty,
    tags: recipe.tags,
    prepTime: String(recipe.prepTime),
    cookTime: String(recipe.cookTime),
    servings: String(recipe.servings),
    ingredients: recipe.ingredients.map((ing) => ({ ...ing })),
    instructions: [...recipe.instructions],
  };
}

function EditRecipe() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient
      .get<ApiResponse<Recipe>>(`/recipe/${params.id}`)
      .then((res) => setRecipe(res.data.data))
      .catch((err: AxiosError) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [params.id, isAuthenticated]);

  const isOwner = Boolean(recipe && user && recipe.owner === user.id);

  async function handleSubmit(values: RecipeFormValues) {
    if (!recipe) return;
    setServerError("");
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/recipe/${recipe._id}`, toCreateRecipeInput(values));
      showToast("Recipe updated", "success");
      router.push(`/recipes/${recipe._id}`);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setServerError(axiosErr.response?.data?.message ?? "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

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

  let content;
  if (authLoading || !isAuthenticated || loading) {
    content = <Loader label="Loading recipe…" />;
  } else if (notFound || !recipe) {
    content = (
      <EmptyState
        title="Recipe not found"
        description="This recipe may have been deleted or never existed."
        action={
          <Button variant="primary" onClick={() => router.push("/my-recipes")}>
            Back to My Recipes
          </Button>
        }
      />
    );
  } else if (!isOwner) {
    content = (
      <EmptyState
        title="Not authorized"
        description="You can only edit recipes you own."
        action={
          <Button variant="primary" onClick={() => router.push(`/recipes/${recipe._id}`)}>
            View this recipe
          </Button>
        }
      />
    );
  } else {
    content = (
      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        <div className="mb-8 border-b border-linen-border pb-6">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Recipe Editor
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Edit &ldquo;{recipe.name}&rdquo;
          </h1>
        </div>
        <RecipeForm
          initialValues={recipeToFormValues(recipe)}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
          serverError={serverError}
          onCancel={() => router.push(`/recipes/${recipe._id}`)}
          extraFooterActions={
            <Button type="button" variant="danger" onClick={() => setDeleteModalOpen(true)}>
              Delete Recipe
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <div className="pt-24 pb-16">{content}</div>

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
      <Footer />
    </main>
  );
}

export default EditRecipe;
