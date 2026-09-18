# Product Requirements Document — Savor Frontend

**Scope:** Frontend only (Next.js App Router app in `frontend/`). The backend (Express/MongoDB API in `backend/`) is already implemented and is treated here as a fixed contract. This PRD documents what currently exists in the frontend, what is broken/partial, what is completely missing, and what needs to be built to reach full parity with the backend's capabilities.

---

## 1. Current State Assessment

### 1.1 Backend API surface (ground truth, all under base path `/api`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/signup` | No | Register user, returns `{accessToken, refreshToken, user}` |
| POST | `/api/login` | No | Login, returns `{accessToken, refreshToken, user}` |
| POST | `/api/refresh` | No | Exchange refresh token for new access token |
| POST | `/api/logout` | No (needs refreshToken in body) | Invalidate session |
| GET | `/api/recipe` | No | List **all** recipes (no pagination/filter/search support server-side) |
| GET | `/api/recipe/:id` | No | Get single recipe |
| GET | `/api/recipe/my` | Yes | List current user's recipes |
| POST | `/api/recipe` | Yes | Create recipe |
| PATCH | `/api/recipe/:id` | Yes (owner only) | Update recipe |
| DELETE | `/api/recipe/:id` | Yes (owner only) | Delete recipe |
| GET | `/api/user/me` | Yes | Get current user profile |
| PATCH | `/api/user` | Yes | Update current user — **only `name` is accepted** (see §5) |
| PUT | `/api/user/password` | Yes | Change password (`oldPassword`, `newPassword`) |
| DELETE | `/api/user` | Yes | Delete own account |
| GET | `/api/user` | Yes | List all users (no admin check enforced server-side today) |
| GET | `/api/user/favourites` | Yes | List favourite recipes (populated) |
| POST | `/api/user/favourites/:id` | Yes | Add recipe to favourites |
| DELETE | `/api/user/favourites/:id` | Yes | Remove recipe from favourites |

**Recipe fields:** `name, brief, description?, image (URL string), ingredients[{name, quantity, unit?}], instructions[string], prepTime, cookTime, servings, difficulty (easy|medium|hard), category, tags[]`, plus server-managed `owner, rating, ratingsCount, views, createdAt, updatedAt`.

**User fields:** `name, email, image?, role (user|admin), favourites[]`.

Important backend constraints that limit frontend scope:
- **No file upload** — `image` must be a valid URL string (`z.string().url()`). There is no multer/Cloudinary integration, so any "upload photo" UI is out of scope unless the backend adds it.
- **Profile edit is name-only** — `UpdateUserSchema` only accepts `name`. Email, image, and role cannot be edited via the current API.
- **No search/filter/pagination params** on `GET /api/recipe` — it returns the entire collection every time.
- **No server-side admin authorization** — `authorize("admin")` mentioned in `backend/README.md` is not actually implemented in `user.routes.ts`; any authenticated user can currently call `GET /api/user`. Frontend should not build admin-only UI that relies on this being secure, and should not expose it without backend enforcement.

### 1.2 What's already implemented in the frontend

- **App scaffold**: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, `react-icons`, `axios`.
- **`lib/api.ts` / `lib/axios.ts`**: Solid, production-quality Axios client (`apiClient`) with request interceptor (attaches `Bearer` token from `localStorage`) and response interceptor implementing single-flight refresh-token logic, request queuing during refresh, and cleanup/redirect to `/login` on refresh failure. **Done.**
- **`Navbar`** (`components/navbar/page.tsx`): Active-link styling, shows Login button when logged out / username dropdown (Profile, Logout) when logged in, client-side guard that redirects `Favourites`/`My Recipes` clicks to `/login` if no token, calls `POST /api/logout` on logout. **Functional**, but only guards nav clicks, not direct URL navigation.
- **`Footer`**: Static branding footer. **Done** (cosmetic only).
- **`Hero`** (`components/hero/page.tsx`): Purely decorative animated SVG wave, no headline/CTA copy. **Partial** (visual only, no content or call-to-action).
- **Home page** (`app/page.tsx`): Composes `Navbar` + `Hero` + `Recipes` (list) + `Footer`. **Done** as a shell.
- **`Recipes` list** (`components/recipes/page.tsx`): Fetches `GET /api/recipe`, optionally fetches favourites to mark hearts, toggles favourite via `POST`/`DELETE /api/user/favourites/:id`. **Functional**, but: cards are not clickable/linked to any detail page, shows `recipe.description` instead of `brief` (schema mismatch/bug), no search, filter, sort, or pagination UI.
- **Login page** (`app/login/page.tsx`): Working form, calls `POST /api/login`, stores `token`/`refreshToken`/`userName` in `localStorage`, redirects home, shows inline error. **Done**, though it bypasses `apiClient` (uses raw `axios` + `API_URL`, duplicating base URL logic).
- **Favourites page**: Fetches `GET /api/user/favourites`, remove button per card, redirects to `/login` on 401. **Functional**, correctly falls back `brief || description`.
- **My Recipes list** (`app/my-recipes/page.tsx`): Fetches `GET /api/recipe/my`, redirects on 401. **Functional** for listing only — no create/edit/delete affordances on this page.
- **Profile page**: Fetches `GET /api/user/me` and renders name/email/role/image read-only. **Partial** — no edit capability at all.
- **Register page** (`app/register/page.tsx`): Literally `<h1>Register</h1>`. **Not implemented.**
- **Create Recipe page** (`app/create-recipe/page.tsx`): Entire file is commented out. **Not implemented.**
- **My Recipe detail/edit page** (`app/my-recipes/[id]/page.tsx`): File exists but is **completely empty**. **Not implemented.**
- **Public recipe detail page**: Does not exist at all (no `app/recipes/[id]/page.tsx` or similar). There is no way to view a single recipe's full details (ingredients, instructions, times, difficulty, tags, rating) from the UI.
- **Contact page**: Fully static hero + contact-method links (phone/email); imports `useState`/`FormEvent` but never renders or wires an actual form. **Not implemented as a functional contact form** (and no backend endpoint exists for it either).

### 1.3 Summary table

| Area | Status |
|---|---|
| Axios client w/ token refresh | ✅ Done |
| Navbar (auth-aware) | ✅ Done (needs route-level guard, mobile nav) |
| Footer | ✅ Done |
| Hero | 🟡 Visual only, no content |
| Home / public recipe list | 🟡 Functional, missing search/filter/pagination/detail links |
| Login | ✅ Done (minor cleanup) |
| Register | ❌ Not implemented |
| Favourites | ✅ Functional (minor polish) |
| My Recipes (list) | 🟡 Functional list, missing edit/delete actions |
| My Recipes (detail/edit) `[id]` | ❌ Not implemented (empty file) |
| Public recipe detail page | ❌ Does not exist |
| Create Recipe | ❌ Not implemented (commented out) |
| Profile (view) | 🟡 Read-only only |
| Profile (edit name / change password / delete account) | ❌ Not implemented |
| Contact form | ❌ Not implemented (static page only) |
| Auth context/hook (`useAuth`) | ❌ Not implemented — each component reads `localStorage` directly |
| Shared UI kit (Button, Input, Modal, Card, Loader, ErrorMessage, EmptyState, Toast) | ❌ Not implemented — every page hand-rolls its own markup |
| Route protection (`middleware.ts`) | ❌ Not implemented — guard only exists on Navbar link clicks |
| Types (`types/recipe.ts`, `types/user.ts`, `types/auth.ts`) | ❌ Not implemented — ad hoc inline types duplicated per file |
| SEO/metadata | ❌ Still default "Create Next App" title/description |

---

## 2. Goals

1. Reach full frontend feature parity with the existing backend API (every endpoint has a corresponding, usable UI flow).
2. Fix the identified bugs and inconsistencies (field mismatches, duplicated auth-state reads, ad hoc HTTP clients).
3. Introduce a small set of shared primitives (types, UI components, auth context) so new pages stop duplicating logic.
4. Keep scope realistic given backend limitations (no image upload, no server-side search/pagination, no enforced admin role) — call these out rather than building against APIs that don't exist.

## 3. Non-Goals

- Modifying backend code, schemas, or routes (any backend gaps are only noted as context/blockers, not implemented here).
- Building an admin dashboard (blocked on missing server-side `authorize("admin")` enforcement).
- Image upload/hosting (blocked on missing multer/Cloudinary integration in backend).
- Server-side search, filtering, sorting, or pagination of recipes (blocked on backend; frontend may do client-side filtering over the full list as an interim measure — see §4.3).

---

## 4. Feature Requirements

### 4.1 Authentication

#### 4.1.1 Register page (`app/register/page.tsx`) — **new**
- Form fields: `name`, `email`, `password`, `confirmPassword` (client-only, not sent to API).
- Client-side validation mirroring backend `CreateUserSchema`: name 2–50 chars, valid email, password 8–100 chars; show inline field errors.
- Submit → `POST /api/signup`. On success, backend returns `accessToken`/`refreshToken`/`user` — auto-login the user (store tokens the same way `Login` does) and redirect to `/`.
- On failure (e.g., "User already exists"), show the server's `message` inline.
- Link to `/login` for existing users (mirror the "Don't have an account?" pattern already on the Login page).

#### 4.1.2 Login page — polish
- Refactor to use `apiClient`/central auth helper instead of raw `axios` + `API_URL` string concatenation, for consistency with `Register` and the rest of the app.
- After introducing an auth context (§4.8), update `localStorage` writes to also update shared auth state so `Navbar` reflects login immediately without a full navigation/remount.

#### 4.1.3 Logout — done
- Already functional in `Navbar`. Once auth context exists, route logout through it so all consumers re-render.

### 4.2 Recipe Discovery (Home)

- **Hero**: Add real headline/subheading/CTA copy (e.g., "Discover & Share Recipes", CTA buttons "Browse Recipes" / "Add Your Recipe" linking to the recipe list section and `/create-recipe`). Keep existing background animation.
- **Recipe cards**: Each card must link to a recipe detail route (`/recipes/[id]`, new). Fix the field bug — show `recipe.brief` (short summary) on cards instead of `recipe.description` (long text), consistent with the `Favourites` page's fallback pattern.
- **Search/filter (client-side, interim)**: Since the backend returns the full list unfiltered, add a client-side search box (matches `name`/`tags`) and category/difficulty dropdown filters that operate on the already-fetched array. Note in code/comments that this should move server-side once the backend supports query params.
- **Empty/loading/error states**: Use shared `Loader`/`EmptyState`/`ErrorMessage` components (§4.9) instead of ad hoc text.

### 4.3 Public Recipe Detail Page — **new** (`app/recipes/[id]/page.tsx`)
- Fetch `GET /api/recipe/:id` (public, no auth required).
- Display: image, name, brief, full description, category, difficulty badge, prepTime/cookTime/servings, ingredients list (name/quantity/unit), numbered instructions, tags, rating/ratingsCount, views.
- Favourite toggle button (reuses the same add/remove favourite logic as the list), disabled/hidden when logged out or prompts login.
- If the current logged-in user is the owner, show "Edit" / "Delete" actions linking to `/my-recipes/[id]`.
- 404 state when the recipe doesn't exist (backend returns 404 `{message: "Recipe not found"}`).

### 4.4 Create Recipe (`app/create-recipe/page.tsx`) — **new (currently empty/commented out)**
- Full form matching `CreateRecipeSchema`:
  - Text inputs: `name` (3–150), `brief` (10–300), `description` (optional, 10–3000), `image` (URL, validated as a URL — plain text input since there's no upload endpoint), `category` (2–50).
  - Numeric inputs: `prepTime` (≥0), `cookTime` (≥0, default 0), `servings` (≥1).
  - `difficulty` select: easy/medium/hard (default easy).
  - Dynamic **ingredients** list: repeatable rows of `name`, `quantity` (number), `unit` (optional) with add/remove row controls; require at least 1.
  - Dynamic **instructions** list: repeatable ordered text steps with add/remove/reorder; require at least 1.
  - **tags**: free-text chip input (comma-or-enter-to-add), optional, defaults to `[]`.
- Client-side validation mirroring the Zod constraints above before submit; surface field-level errors.
- Submit → `POST /api/recipe` (auth required — protect this route, see §4.10). On success, redirect to the new recipe's detail page or `/my-recipes`. On failure, show server error message.
- Route must require authentication; unauthenticated visitors should be redirected to `/login`.

### 4.5 My Recipes

#### 4.5.1 List (`app/my-recipes/page.tsx`) — enhance existing
- Add per-card **Edit** (link to `/my-recipes/[id]`) and **Delete** actions.
- Delete should show a confirmation (use shared `Modal`, §4.9) before calling `DELETE /api/recipe/:id`, then remove the item from local state on success.
- Add an "Add Recipe" CTA linking to `/create-recipe`.
- Replace manual `Authorization` header (`localStorage.getItem("token")`) with `apiClient`, which already attaches the token — remove the redundant manual header logic.

#### 4.5.2 Detail/Edit (`app/my-recipes/[id]/page.tsx`) — **new (currently empty)**
- Fetch `GET /api/recipe/:id`; verify `recipe.owner` matches the logged-in user (else redirect to `/recipes/[id]` read-only view or show "not authorized").
- Render the same form fields as Create Recipe (§4.4), pre-filled with the fetched recipe, using `UpdateRecipeSchema` (all fields optional/partial) semantics — only send changed fields or the full form, either is acceptable, but validate the same constraints as create.
- Submit → `PATCH /api/recipe/:id`. On success, show confirmation and reflect updated data (or redirect to detail page).
- Include a **Delete** action here too (same confirm-then-`DELETE` flow as the list).

### 4.6 Favourites — polish existing
- Already functional; make cards link to `/recipes/[id]` like the home list.
- Replace bespoke loading/empty text with shared components (§4.9) for visual consistency with the rest of the app.

### 4.7 Profile

- **View** (existing): keep, but move to shared `Card`/layout components.
- **Edit name** — new: inline or modal form calling `PATCH /api/user` with `{ name }` only (backend does not accept other fields — do not build UI implying email/image are editable).
- **Change password** — new: form with `oldPassword`, `newPassword`, `confirmNewPassword` (client-only) calling `PUT /api/user/password`; on success, note the backend invalidates all sessions (`Session.deleteMany`), so the user will need to log in again — handle this gracefully (clear local tokens and redirect to `/login` with a "Password changed, please log in again" message).
- **Delete account** — new: destructive action behind a confirmation modal calling `DELETE /api/user`; on success, clear local auth state and redirect to `/`.

### 4.8 Auth Context / `useAuth` hook — **new**
- Add `context/AuthContext.tsx` (or a lightweight `hooks/useAuth.ts` backed by a small store) that centralizes:
  - Current user info (`id`, `name`, `email`, `role`) and `isAuthenticated` boolean, hydrated from `localStorage` on mount.
  - `login(tokens, user)`, `logout()`, and `updateUser(partial)` actions that write to `localStorage` **and** update React state, so all consumers (Navbar, protected pages) re-render immediately without a full page navigation.
- Refactor `Navbar`, `Login`, `Register`, `Profile`, and protected pages to consume this context instead of directly calling `localStorage.getItem(...)` ad hoc.

### 4.9 Shared UI Kit — **new** (`components/ui/*`, `components/common/*`)
Introduce the minimal set of reusable primitives referenced in the project's intended structure (`frontend/README.md`) but never created:
- `ui/Button.tsx`, `ui/Input.tsx`, `ui/Modal.tsx`, `ui/Card.tsx` — used to de-duplicate the hand-rolled Tailwind markup across Login/Register/Create-Recipe/Profile/etc.
- `common/Loader.tsx`, `common/ErrorMessage.tsx`, `common/EmptyState.tsx` — replace the inline "Loading...", "No favourites yet.", raw error strings scattered across pages today.
- (Optional but recommended) a minimal toast/notification utility for success messages (recipe created/updated/deleted, profile updated, password changed).

### 4.10 Route Protection — **new** (`middleware.ts` or per-page guard pattern)
- Today, protection is only client-side and only on `Navbar` link clicks (`PROTECTED_ROUTES` array) — direct navigation to `/my-recipes`, `/create-recipe`, `/favourites`, `/profile`, or `/my-recipes/[id]` by URL/back-button/refresh is not guarded before the page attempts data fetches (it only redirects reactively after a 401 response, causing a flash of the empty/loading page).
- Add a consistent guard (either Next.js `middleware.ts` checking for a token cookie, or a shared `useRequireAuth()` hook called at the top of each protected page) covering: `/create-recipe`, `/my-recipes`, `/my-recipes/[id]`, `/favourites`, `/profile`.
- Note: since tokens are currently stored in `localStorage` (not cookies), true middleware-based (server-side) protection would require switching to cookie storage — flag this as a design decision. The pragmatic near-term fix is a client-side `useRequireAuth()` hook that redirects before rendering/fetching, run in every protected page/layout.

### 4.11 Contact Page
- No backend endpoint exists for contact submissions. Options (pick one, both are frontend-only):
  1. Keep as a static "reach us via phone/email" page (current state) — acceptable, no further work needed beyond removing the unused `useState`/`FormEvent` imports.
  2. Add a `mailto:` link-based "form" (fills a mailto link from field values) — cosmetic improvement only, still no backend dependency.
- Do **not** build a form that POSTs to a non-existent backend endpoint.

### 4.12 Types (`types/*.ts`) — **new**
Add shared TypeScript types instead of the duplicated inline `type Recipe = {...}` / `type User = {...}` declarations currently repeated (with drifting shapes) across `Favourites`, `RecipeList`, `MyRecipes`, `Profile`:
- `types/recipe.ts`: `Recipe`, `Ingredient`, `CreateRecipeInput`, `UpdateRecipeInput`.
- `types/user.ts`: `User`.
- `types/auth.ts`: `AuthResponse`, `LoginInput`, `RegisterInput`.
- `types/api.ts`: generic `ApiResponse<T> = { message: string; data: T }` matching the backend's consistent envelope.

### 4.13 Metadata / SEO polish
- Update `app/layout.tsx` metadata (`title`, `description`) away from the default "Create Next App" placeholder to something recipe-app appropriate.
- Add per-page `metadata` exports where relevant (recipe detail page title = recipe name, etc.) once pages exist.

---

## 5. Known Backend Constraints (context, not to be "fixed" by this PRD)

- `image` on Recipe must be a URL string — no upload flow possible without backend changes.
- `PATCH /api/user` only accepts `{ name }` — profile edit UI must not offer email/image/role editing.
- `GET /api/recipe` has no query params for search/category/tag/difficulty filtering or pagination — any such UI is client-side only over the full dataset.
- `GET /api/user` (list all users) has no server-side admin check today despite being documented as admin-only — no admin UI should be built against it as if it were secured.
- Tokens are returned as JSON body values, not `httpOnly` cookies — frontend necessarily manages them in `localStorage`, which limits true server-side (Next.js middleware) route protection.

---

## 6. Suggested Implementation Order

1. **Foundations**: `types/*`, `AuthContext`/`useAuth`, shared `ui/`/`common/` components — everything else builds on these.
2. **Auth flows**: Register page, Login refactor to use context + `apiClient`.
3. **Recipe read paths**: Public recipe detail page, fix recipe card field bug/links, client-side search/filter on Home.
4. **Recipe write paths**: Create Recipe form, My Recipe edit/delete (`[id]` page), delete/edit actions on My Recipes list.
5. **Profile management**: edit name, change password, delete account.
6. **Route protection**: `useRequireAuth()` hook applied to all protected pages.
7. **Polish**: Hero content, metadata/SEO, Contact page cleanup, toast notifications.

---

## 7. Acceptance Criteria Summary

The frontend is considered feature-complete against the current backend when:
- A new user can register, is auto-logged-in, and lands on the home page.
- Any visitor can browse, search/filter (client-side), and open a full detail view of any recipe.
- A logged-in user can create, edit, and delete their own recipes end-to-end, with validation matching the backend Zod schemas.
- A logged-in user can view/update their name, change their password, delete their account, and manage favourites — all reflected instantly via shared auth state.
- All protected pages redirect unauthenticated users to `/login` before attempting any data fetch.
- No page contains dead/commented-out code, empty files, or placeholder markup (`<h1>Register</h1>`, empty `[id]/page.tsx`, etc.).
