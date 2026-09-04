// Generic envelope matching the backend's consistent success-response shape
// (see memory.md §2.4): { message: string, data: T }.
// Some endpoints (e.g. logout) omit `data` entirely — callers should treat
// `data` as optional in those cases rather than assuming it's always present.
export type ApiResponse<T> = {
  message: string;
  data: T;
};

// Shape of a generic controller-level error response (memory.md §2.4).
export type ApiErrorResponse = {
  message: string;
  error?: string;
};

// Shape of a Zod validation failure from validate.middleware.ts (memory.md §2.7).
// This is a DIFFERENT shape than ApiErrorResponse — validation failures use
// `errors` (Zod's `.flatten()` output), not `error`.
export type ApiValidationErrorResponse = {
  message: string;
  errors: {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
  };
};
