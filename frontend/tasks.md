# Frontend Implementation Tasks & Milestones

Derived from `PRD.md`. Each milestone lists implementation tasks, its own testing/validation tasks, and a Definition of Done (DoD). Work through milestones in order — later milestones assume earlier ones are complete, since M0 provides the types/context/UI primitives everything else depends on.

Checklist legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## M0 — Foundations (types, auth context, shared UI kit)

**Goal:** Establish the shared building blocks (types, auth state, reusable components) so every later milestone can consume them instead of duplicating logic.

### Implementation
- [ ] `types/api.ts` — generic `ApiResponse<T> = { message: string; data: T }`
- [ ] `types/recipe.ts` — `Ingredient`, `Recipe`, `CreateRecipeInput`, `UpdateRecipeInput` (mirroring `CreateRecipeSchema`/`UpdateRecipeSchema`)
- [ ] `types/user.ts` — `User` (`id`, `name`, `email`, `role`, `image?`)
- [ ] `types/auth.ts` — `AuthResponse`, `LoginInput`, `RegisterInput`
- [ ] `context/AuthContext.tsx` with `useAuth()` hook: exposes `user`, `isAuthenticated`, `login()`, `logout()`, `updateUser()`; hydrates from `localStorage` on mount; wraps app in `app/layout.tsx`
- [ ] `hooks/useRequireAuth.ts` — redirects to `/login` when not authenticated (used by M5, built now so later milestones can adopt it immediately)
- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/Input.tsx`
- [ ] `components/ui/Modal.tsx`
- [ ] `components/ui/Card.tsx`
- [ ] `components/common/Loader.tsx`
- [ ] `components/common/ErrorMessage.tsx`
- [ ] `components/common/EmptyState.tsx`
- [ ] (Optional) minimal toast utility (`components/common/Toast.tsx` + context/hook) for success/error notifications used across later milestones

### Testing
- [ ] Type-check passes (`npm run build` or `tsc --noEmit`) with new types in place and no `any` regressions
- [ ] `AuthContext`: manually verify hydration — log in, refresh page, confirm `user`/`isAuthenticated` survive reload
- [ ] `AuthContext`: unit-test or manually verify `login()`/`logout()` update state synchronously (no need to navigate for Navbar to reflect change)
- [ ] Each new `ui/`/`common/` component renders with basic props in isolation (Storybook not required — a throwaway test page or manual render in an existing page is sufficient)
- [ ] ESLint/diagnostics clean on all new files

### Definition of Done
All shared primitives exist, compile cleanly, and `AuthContext` correctly reflects login/logout state without a full page reload.

---

## M1 — Authentication Flows

**Goal:** Users can register, log in, and log out through fully wired, validated forms using the shared context/client.

### Implementation
- [ ] Build `app/register/page.tsx` form (`name`, `email`, `password`, `confirmPassword`)
- [ ] Client-side validation matching `CreateUserSchema` (name 2–50, valid email, password 8–100) + confirm-password match check
- [ ] Wire submit → `POST /api/signup` via `apiClient`; on success call `useAuth().login(...)` and redirect to `/`
- [ ] Show inline server error message on failure (e.g. "User already exists")
- [ ] Add "Already have an account? Login" link to `/login`
- [ ] Refactor `app/login/page.tsx` to use `apiClient` instead of raw `axios` + `API_URL`
- [ ] Refactor `Login` submit success path to call `useAuth().login(...)` instead of writing `localStorage` directly
- [ ] Refactor `Navbar` logout handler to call `useAuth().logout()` instead of manual `localStorage.removeItem` calls
- [ ] Refactor `Navbar` username/auth display to read from `useAuth()` instead of local `useState` + `localStorage.getItem`

### Testing
- [ ] Register with valid data → account created, auto-logged-in, redirected to `/`, Navbar shows username
- [ ] Register with existing email → inline "User already exists" error shown, no redirect
- [ ] Register with invalid email / short password / mismatched confirm-password → client-side validation blocks submit with field errors, no network call made
- [ ] Login with valid credentials → redirected to `/`, Navbar reflects logged-in state immediately
- [ ] Login with wrong credentials → inline error shown, no redirect
- [ ] Logout from Navbar → tokens cleared from `localStorage`, Navbar reverts to "Login" button, `POST /api/logout` fired with refresh token
- [ ] Confirm no component still reads `localStorage` directly for auth display (only `AuthContext` should)

### Definition of Done
A brand-new user can go from landing page → register → browse while authenticated → logout, entirely through the UI, with no console errors.

---

## M2 — Recipe Discovery & Detail (Read Paths)

**Goal:** Any visitor (logged in or not) can browse, search/filter client-side, and view full recipe details.

### Implementation
- [ ] Fix `components/recipes/page.tsx` bug: display `recipe.brief` instead of `recipe.description` on cards
- [ ] Make each recipe card a `Link` to `/recipes/[id]`
- [ ] Add client-side search input (matches `name`/`tags`) filtering the already-fetched recipe array
- [ ] Add client-side category/difficulty filter dropdowns (derived from fetched data)
- [ ] Replace ad hoc loading/empty text in recipe list with `Loader`/`EmptyState`
- [ ] Build `app/recipes/[id]/page.tsx`: fetch `GET /api/recipe/:id`, render image, name, brief, description, category, difficulty badge, prepTime/cookTime/servings, ingredients, numbered instructions, tags, rating/ratingsCount, views
- [ ] Add favourite toggle button on detail page (reuse existing add/remove favourite logic); prompt/disable when logged out
- [ ] Show "Edit"/"Delete" actions on detail page when `recipe.owner === currentUser.id`, linking to `/my-recipes/[id]`
- [ ] Handle 404 (`Recipe not found`) with a friendly not-found state
- [ ] Update `Hero` with real headline/subheading/CTA buttons ("Browse Recipes", "Add Your Recipe")
- [ ] Update `Favourites` page cards to link to `/recipes/[id]`

### Testing
- [ ] Home page cards show `brief` text, not `description`
- [ ] Clicking a card navigates to the correct `/recipes/[id]` detail page
- [ ] Search box filters visible recipes by name/tag in real time, clearing search restores full list
- [ ] Category/difficulty filters narrow the list correctly and can be combined with search
- [ ] Recipe detail page renders all fields correctly for a recipe with full data (all optional fields present) and one with minimal data (no `description`/`tags`)
- [ ] Visiting `/recipes/<invalid-id>` shows a not-found state instead of a crash or blank page
- [ ] Favourite toggle on detail page updates immediately and persists after reload
- [ ] Owner sees Edit/Delete on their own recipe's detail page; non-owner (or logged-out visitor) does not
- [ ] Favourites page cards link correctly to detail pages

### Definition of Done
Every recipe in the system is discoverable, searchable/filterable client-side, and fully viewable with correct data and correct owner-gated actions.

---

## M3 — Recipe Write Paths (Create / Edit / Delete)

**Goal:** Authenticated users can fully manage their own recipes end-to-end.

### Implementation
- [ ] Build `app/create-recipe/page.tsx` form with all fields from `CreateRecipeSchema`: `name`, `brief`, `description`, `image` (URL text input), `category`, `prepTime`, `cookTime`, `servings`, `difficulty` select, dynamic ingredients rows (name/quantity/unit, add/remove, min 1), dynamic instructions list (add/remove/reorder, min 1), tags chip input
- [ ] Client-side validation mirroring `CreateRecipeSchema` constraints (lengths, min values, URL format, min 1 ingredient/instruction)
- [ ] Wire submit → `POST /api/recipe`; redirect to new recipe's detail page (or `/my-recipes`) on success; show server error on failure
- [ ] Protect `/create-recipe` with `useRequireAuth()`
- [ ] Build `app/my-recipes/[id]/page.tsx`: fetch `GET /api/recipe/:id`, verify ownership (redirect/read-only if not owner), pre-fill the same form component used for Create (extract a shared `RecipeForm` component to avoid duplicating Create/Edit markup)
- [ ] Wire edit submit → `PATCH /api/recipe/:id`; show success feedback and refresh/redirect
- [ ] Add Delete action on edit page with confirmation `Modal` → `DELETE /api/recipe/:id` → redirect to `/my-recipes`
- [ ] Enhance `app/my-recipes/page.tsx`: add per-card Edit link (`/my-recipes/[id]`) and Delete button (confirmation modal → `DELETE /api/recipe/:id` → remove from local state)
- [ ] Add "Add Recipe" CTA on `/my-recipes` linking to `/create-recipe`
- [ ] Remove manual `Authorization` header logic in `/my-recipes` fetch (rely on `apiClient` interceptor)
- [ ] Protect `/my-recipes` and `/my-recipes/[id]` with `useRequireAuth()`

### Testing
- [ ] Create a recipe with valid data → appears in `/my-recipes` and public list, redirects correctly
- [ ] Create form rejects: name < 3 chars, brief < 10 chars, invalid image URL, prepTime negative, servings 0, zero ingredients, zero instructions — with inline field errors, no request sent
- [ ] Add/remove ingredient rows and instruction steps works correctly and preserves other rows' data
- [ ] Tags chip input adds tags on comma/enter and allows removal
- [ ] Edit page pre-fills all fields correctly from an existing recipe
- [ ] Submitting an edit updates the recipe and reflects changes on the detail page and lists
- [ ] Attempting to open `/my-recipes/[id]` for a recipe **not** owned by the current user is blocked/redirected (verify against backend's 403 response)
- [ ] Delete from `/my-recipes` list: confirmation modal appears, cancel does nothing, confirm removes the card and calls the API
- [ ] Delete from edit page: same confirmation flow, redirects to `/my-recipes` after success
- [ ] Unauthenticated visit to `/create-recipe` or `/my-recipes/[id]` redirects to `/login`

### Definition of Done
A logged-in user can create, view, edit, and delete their own recipes entirely through the UI, with validation and error handling matching backend constraints.

---

## M4 — Profile Management

**Goal:** Users can manage their account within the constraints of the current backend API.

### Implementation
- [ ] Refactor Profile view to use shared `Card`/`Loader` components
- [ ] Add "Edit name" UI (inline form or modal) → `PATCH /api/user` with `{ name }` only; update `AuthContext` user on success
- [ ] Add "Change password" form (`oldPassword`, `newPassword`, `confirmNewPassword`) → `PUT /api/user/password`
- [ ] On password-change success: clear local auth state and redirect to `/login` with a message (backend invalidates all sessions)
- [ ] Add "Delete account" destructive action behind confirmation `Modal` → `DELETE /api/user` → clear auth state → redirect to `/`
- [ ] Ensure no UI implies email/image/role are editable (backend only accepts `name`)

### Testing
- [ ] Edit name with valid input updates profile display and Navbar username immediately
- [ ] Edit name with invalid input (empty/too long) is blocked client-side
- [ ] Change password with wrong old password shows server error ("Old password is incorrect")
- [ ] Change password success → user is logged out and redirected to `/login` with an explanatory message
- [ ] Attempting to log in with the old password after a successful change fails; new password succeeds
- [ ] Delete account → confirmation required, account removed, redirected to `/`, subsequent protected page visits require re-registration/login
- [ ] Profile page never renders editable email/image fields

### Definition of Done
Users can update their name, change their password (with correct session invalidation handling), and delete their account, all via the UI.

---

## M5 — Route Protection

**Goal:** Protected pages never flash content or attempt fetches before confirming authentication.

### Implementation
- [ ] Apply `useRequireAuth()` (built in M0) at the top of: `/create-recipe`, `/my-recipes`, `/my-recipes/[id]`, `/favourites`, `/profile`
- [ ] Ensure guarded pages show a loading state (not the empty/error state) while the auth check resolves
- [ ] Keep/clean up `Navbar`'s `PROTECTED_ROUTES` click-guard as a secondary UX nicety (prevents an unnecessary render flash before the hook redirects)
- [ ] Document (code comment or README note) that true server-side middleware protection is blocked by `localStorage`-based token storage, per PRD §5

### Testing
- [ ] Direct URL navigation (typing the URL, not clicking a nav link) to each protected route while logged out redirects to `/login` before any API call fires (verify via network tab — no 401 requests)
- [ ] Refreshing a protected page while logged in keeps the user on the page (no false redirect)
- [ ] Refreshing a protected page while logged out redirects correctly
- [ ] Browser back-button navigation into a protected route after logout redirects correctly

### Definition of Done
No protected page is reachable or briefly visible without a valid session, verified by direct URL entry, refresh, and back-navigation.

---

## M6 — Polish

**Goal:** Address remaining cosmetic/content gaps and dead code called out in the PRD.

### Implementation
- [ ] Update `app/layout.tsx` metadata (`title`, `description`) away from default "Create Next App" placeholder
- [ ] Add per-page `metadata` where relevant (e.g. recipe detail page title = recipe name)
- [ ] Clean up `app/contact/page.tsx`: remove unused `useState`/`FormEvent` imports; decide and implement either "static contact info" (already done) or a `mailto:`-based form — do not wire to a nonexistent backend endpoint
- [ ] Wire up success/error toasts (if built in M0) for: recipe created/updated/deleted, profile name updated, password changed, favourite added/removed
- [ ] Sweep the codebase for remaining dead/commented-out code (e.g. old commented blocks in `create-recipe`, `recipes/page.tsx`) and remove it
- [ ] Verify responsive layout (mobile nav menu) for `Navbar` — add a mobile hamburger menu if currently missing

### Testing
- [ ] Browser tab title reflects the app/page context, not "Create Next App"
- [ ] Contact page has no unused imports/diagnostics warnings
- [ ] Toasts appear and auto-dismiss for each listed action
- [ ] No commented-out component/page code remains in the shipped files
- [ ] Navbar usable on a mobile viewport (< 640px) without overlapping/broken layout

### Definition of Done
No placeholder metadata, dead code, or unhandled small UX gaps remain per the PRD's "known issues" list.

---

## M7 — Final Regression Pass

**Goal:** Confirm the whole frontend works together end-to-end against the live backend.

### Testing (full regression checklist)
- [ ] Fresh registration → browse → search/filter → view detail → favourite → create recipe → edit recipe → delete recipe → edit profile name → change password (re-login) → delete account — full user journey works with no console errors
- [ ] All protected routes verified unreachable while logged out (direct URL + refresh + back-button)
- [ ] `npm run build` completes with no TypeScript errors
- [ ] `npm run lint` passes with no new warnings/errors introduced
- [ ] Manually verify token refresh flow: let an access token expire (or simulate 401) and confirm `apiClient`'s refresh logic transparently retries the original request
- [ ] Cross-check every backend endpoint listed in PRD §1.1 has at least one corresponding UI entry point (final parity check against the PRD table)
- [ ] Confirm no frontend code assumes unimplemented backend features (image upload, server-side search/pagination, enforced admin role) per PRD §5

### Definition of Done
All PRD acceptance criteria (PRD §7) are met, verified by manual end-to-end walkthrough plus clean build/lint output.
