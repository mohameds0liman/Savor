"use client";

import Navbar from "@/components/navbar/page";
import Hero from "@/components/hero/page";
import Recipes from "@/components/recipes/page";
import Footer from "@/components/footer/page";
import { useRecipes } from "@/hooks/useRecipes";

function Home() {
  // Fetched separately from RecipeList's own fetch below — there's no
  // shared query cache in this project (memory.md §3.1: no TanStack
  // Query/SWR), so Hero's stat chip and the grid each fetch independently.
  const { recipes } = useRecipes();

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Hero recipeCount={recipes.length} />
      <Recipes />
      <Footer />
    </main>
  );
}

export default Home;
