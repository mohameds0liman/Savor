"use client";

import { useState, type FormEvent } from "react";
import { HiOutlineTrash, HiOutlineXMark, HiOutlinePlus } from "react-icons/hi2";
import { Input, Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ErrorMessage from "@/components/common/ErrorMessage";
import type { CreateRecipeInput, Difficulty, Ingredient } from "@/types/recipe";

export type RecipeFormValues = {
  name: string;
  brief: string;
  description: string;
  image: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: Ingredient[];
  instructions: string[];
};

export const EMPTY_RECIPE_FORM_VALUES: RecipeFormValues = {
  name: "",
  brief: "",
  description: "",
  image: "",
  category: "",
  difficulty: "easy",
  tags: [],
  prepTime: "",
  cookTime: "0",
  servings: "",
  ingredients: [{ name: "", quantity: 0, unit: "" }],
  instructions: [""],
};

type FieldErrors = Partial<Record<
  "name" | "brief" | "description" | "image" | "category" | "prepTime" | "cookTime" | "servings" | "ingredients" | "instructions",
  string
>>;

const URL_REGEX = /^https?:\/\/.+/i;

function validate(values: RecipeFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (values.name.trim().length < 3 || values.name.trim().length > 150) {
    errors.name = "Name must be between 3 and 150 characters.";
  }
  if (values.brief.trim().length < 10 || values.brief.trim().length > 300) {
    errors.brief = "Brief must be between 10 and 300 characters.";
  }
  if (values.description.trim().length > 0) {
    if (values.description.trim().length < 10 || values.description.trim().length > 3000) {
      errors.description = "Description must be between 10 and 3000 characters (or left empty).";
    }
  }
  if (!URL_REGEX.test(values.image.trim())) {
    errors.image = "Enter a valid image URL (starting with http:// or https://).";
  }
  if (values.category.trim().length < 2 || values.category.trim().length > 50) {
    errors.category = "Category must be between 2 and 50 characters.";
  }

  const prepTime = Number(values.prepTime);
  if (values.prepTime === "" || Number.isNaN(prepTime) || prepTime < 0 || !Number.isInteger(prepTime)) {
    errors.prepTime = "Prep time must be a whole number ≥ 0.";
  }
  const cookTime = Number(values.cookTime === "" ? 0 : values.cookTime);
  if (Number.isNaN(cookTime) || cookTime < 0 || !Number.isInteger(cookTime)) {
    errors.cookTime = "Cook time must be a whole number ≥ 0.";
  }
  const servings = Number(values.servings);
  if (values.servings === "" || Number.isNaN(servings) || servings < 1 || !Number.isInteger(servings)) {
    errors.servings = "Servings must be a whole number ≥ 1.";
  }

  if (values.ingredients.length === 0) {
    errors.ingredients = "Add at least one ingredient.";
  } else if (
    values.ingredients.some(
      (ing) => ing.name.trim().length < 1 || ing.name.trim().length > 100 || !(ing.quantity > 0)
    )
  ) {
    errors.ingredients = "Each ingredient needs a name and a quantity greater than 0.";
  }

  if (values.instructions.length === 0) {
    errors.instructions = "Add at least one instruction step.";
  } else if (
    values.instructions.some((step) => step.trim().length < 3 || step.trim().length > 1000)
  ) {
    errors.instructions = "Each instruction step must be between 3 and 1000 characters.";
  }

  return errors;
}

export function toCreateRecipeInput(values: RecipeFormValues): CreateRecipeInput {
  return {
    name: values.name.trim(),
    brief: values.brief.trim(),
    description: values.description.trim() || undefined,
    image: values.image.trim(),
    category: values.category.trim(),
    difficulty: values.difficulty,
    tags: values.tags,
    prepTime: Number(values.prepTime),
    cookTime: Number(values.cookTime === "" ? 0 : values.cookTime),
    servings: Number(values.servings),
    ingredients: values.ingredients.map((ing) => ({
      name: ing.name.trim(),
      quantity: ing.quantity,
      unit: ing.unit?.trim() || undefined,
    })),
    instructions: values.instructions.map((step) => step.trim()),
  };
}

type RecipeFormProps = {
  initialValues?: RecipeFormValues;
  onSubmit: (values: RecipeFormValues) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
  serverError?: string;
  onCancel?: () => void;
  extraFooterActions?: React.ReactNode;
};

function RecipeForm({
  initialValues = EMPTY_RECIPE_FORM_VALUES,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  serverError,
  onCancel,
  extraFooterActions,
}: RecipeFormProps) {
  const [values, setValues] = useState<RecipeFormValues>(initialValues);
  const [tagInput, setTagInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function update<K extends keyof RecipeFormValues>(key: K, value: RecipeFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateIngredient(index: number, patch: Partial<Ingredient>) {
    setValues((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => (i === index ? { ...ing, ...patch } : ing)),
    }));
  }

  function addIngredient() {
    setValues((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: 0, unit: "" }],
    }));
  }

  function removeIngredient(index: number) {
    setValues((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  }

  function updateInstruction(index: number, value: string) {
    setValues((prev) => ({
      ...prev,
      instructions: prev.instructions.map((step, i) => (i === index ? value : step)),
    }));
  }

  function addInstruction() {
    setValues((prev) => ({ ...prev, instructions: [...prev.instructions, ""] }));
  }

  function removeInstruction(index: number) {
    setValues((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && tag.length <= 30 && !values.tags.includes(tag)) {
      update("tags", [...values.tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    update("tags", values.tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Recipe Overview */}
      <Card className="p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold text-ink">Recipe Overview</h3>
        <p className="mt-1 font-body text-xs text-ink-muted">
          Title, short story summary, and dietary tags.
        </p>

        <div className="mt-6 flex flex-col gap-5">
          <Input
            id="name"
            label="Recipe Name"
            placeholder="e.g., Creamy Wild Mushroom Risotto"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            error={fieldErrors.name}
            required
          />
          <Input
            id="brief"
            label="Brief Summary"
            helperText="A short one-line summary displayed on recipe cards."
            placeholder="e.g., A rich, slow-stirred classic with fresh thyme and Parmesan."
            value={values.brief}
            onChange={(e) => update("brief", e.target.value)}
            error={fieldErrors.brief}
            required
          />
          <Textarea
            id="description"
            label="Full Story / Chef Notes (optional)"
            rows={4}
            placeholder="Share the inspiration or serving suggestions for this dish…"
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            error={fieldErrors.description}
          />
          <Input
            id="image"
            label="Cover Image URL"
            placeholder="https://images.unsplash.com/…"
            value={values.image}
            onChange={(e) => update("image", e.target.value)}
            error={fieldErrors.image}
            required
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              id="category"
              label="Category"
              placeholder="e.g., Pasta, Dessert, Soup"
              value={values.category}
              onChange={(e) => update("category", e.target.value)}
              error={fieldErrors.category}
              required
            />
            <Select
              id="difficulty"
              label="Difficulty Tier"
              value={values.difficulty}
              onChange={(e) => update("difficulty", e.target.value as Difficulty)}
            >
              <option value="easy">Easy (Under 30m)</option>
              <option value="medium">Medium (Standard)</option>
              <option value="hard">Hard (Advanced)</option>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-semibold text-ink">Dietary Tags</label>
            <input
              type="text"
              placeholder="Type a tag (e.g. Vegetarian, Gluten-Free) and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              className="w-full rounded-lg border border-linen-border bg-surface-container-lowest px-4 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
            {values.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {values.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-container/20 px-3 py-1 font-body text-xs font-semibold text-on-tertiary-container"
                  >
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove tag ${tag}`}
                      onClick={() => removeTag(tag)}
                      className="text-tertiary hover:text-ink"
                    >
                      <HiOutlineXMark />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Timing & Yield */}
      <Card className="p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold text-ink">Timing &amp; Servings</h3>
        <p className="mt-1 font-body text-xs text-ink-muted">
          Specify preparation time, active cooking time, and serving size.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Input
            id="prepTime"
            label="Prep Time (minutes)"
            type="number"
            min={0}
            value={values.prepTime}
            onChange={(e) => update("prepTime", e.target.value)}
            error={fieldErrors.prepTime}
            required
          />
          <Input
            id="cookTime"
            label="Cook Time (minutes)"
            type="number"
            min={0}
            value={values.cookTime}
            onChange={(e) => update("cookTime", e.target.value)}
            error={fieldErrors.cookTime}
          />
          <Input
            id="servings"
            label="Servings"
            type="number"
            min={1}
            value={values.servings}
            onChange={(e) => update("servings", e.target.value)}
            error={fieldErrors.servings}
            required
          />
        </div>
      </Card>

      {/* Ingredients */}
      <Card className="p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold text-ink">Ingredients</h3>
        <p className="mt-1 font-body text-xs text-ink-muted">
          List each ingredient with quantity and optional unit of measure.
        </p>

        {fieldErrors.ingredients && <ErrorMessage message={fieldErrors.ingredients} className="mt-4" />}

        <div className="mt-6 flex flex-col gap-3">
          {values.ingredients.map((ing, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Ingredient name (e.g. Arborio Rice)"
                value={ing.name}
                onChange={(e) => updateIngredient(i, { name: e.target.value })}
                className="w-full flex-1 rounded-lg border border-linen-border bg-surface-container-lowest px-4 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20"
              />
              <input
                type="number"
                placeholder="Qty"
                value={ing.quantity || ""}
                onChange={(e) => updateIngredient(i, { quantity: Number(e.target.value) })}
                className="w-full rounded-lg border border-linen-border bg-surface-container-lowest px-4 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20 sm:w-28"
              />
              <input
                type="text"
                placeholder="Unit (cups, g, tbsp)"
                value={ing.unit ?? ""}
                onChange={(e) => updateIngredient(i, { unit: e.target.value })}
                className="w-full rounded-lg border border-linen-border bg-surface-container-lowest px-4 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20 sm:w-36"
              />
              <button
                type="button"
                aria-label="Remove ingredient"
                onClick={() => removeIngredient(i)}
                className="rounded-lg p-2.5 text-ink-muted hover:bg-error-container/50 hover:text-error"
              >
                <HiOutlineTrash className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={addIngredient}
          className="mt-4 self-start text-primary"
        >
          <HiOutlinePlus /> Add Ingredient
        </Button>
      </Card>

      {/* Instructions */}
      <Card className="p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold text-ink">Cooking Method</h3>
        <p className="mt-1 font-body text-xs text-ink-muted">
          Detail clear step-by-step instructions.
        </p>

        {fieldErrors.instructions && <ErrorMessage message={fieldErrors.instructions} className="mt-4" />}

        <div className="mt-6 flex flex-col gap-4">
          {values.instructions.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-display text-sm font-bold text-on-primary-fixed">
                {i + 1}
              </span>
              <textarea
                placeholder={`Step ${i + 1} instructions…`}
                value={step}
                onChange={(e) => updateInstruction(i, e.target.value)}
                rows={2}
                className="w-full flex-1 rounded-lg border border-linen-border bg-surface-container-lowest px-4 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20"
              />
              <button
                type="button"
                aria-label="Remove step"
                onClick={() => removeInstruction(i)}
                className="mt-2 rounded-lg p-2.5 text-ink-muted hover:bg-error-container/50 hover:text-error"
              >
                <HiOutlineTrash className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={addInstruction}
          className="mt-4 self-start text-primary"
        >
          <HiOutlinePlus /> Add Step
        </Button>
      </Card>

      {serverError && <ErrorMessage message={serverError} />}

      {/* Sticky action footer */}
      <div className="sticky bottom-0 z-40 flex items-center justify-end gap-3 rounded-2xl border border-linen-border bg-surface-container-lowest/90 px-6 py-4 shadow-[var(--shadow-card-hover)] backdrop-blur-md">
        {extraFooterActions}
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default RecipeForm;
