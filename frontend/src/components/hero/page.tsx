"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

type HeroProps = {
  recipeCount?: number;
};

function Hero({ recipeCount }: HeroProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const mounted = useIsMounted();

  function handleAddRecipe(e: React.MouseEvent) {
    e.preventDefault();
    router.push(mounted && isAuthenticated ? "/create-recipe" : "/login");
  }

  return (
    <section className="border-b border-linen-border bg-surface-container-low px-6 pb-14 pt-32 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/40 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wider text-on-secondary-container">
              Spring &amp; Summer Harvest Edit
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              What are we cooking today?
            </h1>
            <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-ink-muted">
              Handcrafted, chef-tested recipes designed for slow weekends and joyful everyday
              meals. Made with vibrant market produce and unhurried culinary joy.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="#recipes">
                <Button variant="primary">Browse Recipes</Button>
              </Link>
              <Link href={mounted && isAuthenticated ? "/create-recipe" : "/login"} onClick={handleAddRecipe}>
                <Button variant="secondary">Add Your Recipe</Button>
              </Link>
            </div>
          </div>

          {typeof recipeCount === "number" && recipeCount > 0 && (
            <div className="flex gap-3">
              <div className="rounded-xl border border-linen-border bg-surface-container-lowest px-5 py-3 text-center shadow-[var(--shadow-card)]">
                <p className="font-display text-2xl font-bold text-primary">{recipeCount}</p>
                <p className="font-body text-xs uppercase tracking-wide text-ink-muted">
                  Curated Recipes
                </p>
              </div>
              <div className="rounded-xl border border-linen-border bg-surface-container-lowest px-5 py-3 text-center shadow-[var(--shadow-card)]">
                <p className="font-display text-2xl font-bold text-tertiary">100%</p>
                <p className="font-body text-xs uppercase tracking-wide text-ink-muted">
                  Tested in Kitchen
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
