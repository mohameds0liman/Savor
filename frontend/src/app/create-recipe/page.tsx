"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import Navbar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useToast } from "@/components/common/Toast";
import Loader from "@/components/common/Loader";
import RecipeForm, { toCreateRecipeInput, type RecipeFormValues } from "@/components/recipe/RecipeForm";
import apiClient from "@/lib/axios";
import type { Recipe } from "@/types/recipe";
import type { ApiResponse } from "@/types/api";

function CreateRecipe() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: RecipeFormValues) {
    setServerError("");
    setIsSubmitting(true);
    try {
      const res = await apiClient.post<ApiResponse<Recipe>>("/recipe", toCreateRecipeInput(values));
      showToast("Recipe created", "success");
      router.push(`/recipes/${res.data.data._id}`);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setServerError(axiosErr.response?.data?.message ?? "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <div className="pt-24 pb-16">
        {isLoading || !isAuthenticated ? (
          <Loader label="Checking your session…" />
        ) : (
          <div className="mx-auto max-w-4xl px-6 sm:px-10">
            <div className="mb-8 border-b border-linen-border pb-6">
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Publish a Recipe
              </span>
              <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
                Share Your Culinary Creation
              </h1>
            </div>
            <RecipeForm
              onSubmit={handleSubmit}
              submitLabel="Publish Recipe"
              isSubmitting={isSubmitting}
              serverError={serverError}
              onCancel={() => router.push("/my-recipes")}
            />
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

export default CreateRecipe;
