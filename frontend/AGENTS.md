# AGENTS.md — Recipe MERN Frontend

This file tells coding agents (Claude Code, Copilot, Cursor, etc.) how to work in this
repository. It is derived from `PRD.md` — read that file for full rationale; this file
is the operational contract for **how to make changes**.

---

## 1. Project Summary

- **Scope of agent work:** `frontend/` only — a Next.js 16 (App Router) + React 19 +
  TypeScript + Tailwind v4 app.
- **Backend:** `backend/` (Express + MongoDB) is a **fixed contract**. Do not modify
  backend code, routes, or schemas unless a task explicitly says so. Treat
  `backend/README.md` and the route files as ground truth for request/response shapes.
- **Goal:** bring the frontend to full feature parity with the backend API, fix known
  bugs, and introduce shared primitives (types, UI kit, auth context) so new code stops
  duplicating logic.

---

## 2. Hard Constraints (do not violate)

These come directly from backend limitations. Do not build UI or code that assumes
otherwise — it will not function against the real API.

1. **No file upload.** `image` on a Recipe is a URL string (`z.string().url()`). Never
   add multipart upload, `<input type="file">` for images, or Cloudinary/S3 code to the
   frontend. Use a plain URL text input.
2. **Profile edit is name-only.** `PATCH /api/user` accepts `{ name }` only. Never wire
   email, image, or role fields into that request, and never render them as editable.
3. **No server-side search/filter/pagination.** `GET /api/recipe` always returns the
   full collection. Any search/filter/sort/pagination must be implemented client-side
   over the fetched array. Leave a comment noting it should move server-side if the
   backend ever adds query params.
4. **No real admin authorization.** `GET /api/user` (list all users) is not actually
   restricted server-side despite being documented as admin-only. Never build admin UI
   that relies on this endpoint being secure. Do not expose it in navigation.
5. **Tokens live in `localStorage`, not cookies.** `accessToken`/`refreshToken` come
   back as JSON body values. True Next.js `middleware.ts` (server-side) route
   protection is not possible without a cookie migration — that's a separate decision,
   out of scope unless a task says otherwise. Use a client-side `useRequireAuth()` guard
   instead.
6. **Non-goals — do not build these:** admin dashboard, image upload/hosting, backend
   changes of any kind, a contact form that POSTs to a nonexistent endpoint.

---

## 3. API Contract (source of truth)

Base path: `/api`. All responses follow `{ message: string; data: T }` — model this as
`ApiResponse<T>` in `types/api.ts` and use it everywhere instead of `any`.

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/signup` | No | Returns `{accessToken, refreshToken, user}` |
| POST | `/api/login` | No | Same shape as signup |
| POST | `/api/refresh` | No | Already handled by `lib/axios.ts` interceptor |
| POST | `/api/logout` | No (refreshToken in body) | Already wired in Navbar |
| GET | `/api/recipe` | No | Full list, no query params |
| GET | `/api/recipe/:id` | No | 404 `{message:"Recipe not found"}` if missing |
| GET | `/api/recipe/my` | Yes | Current user's recipes |
| POST | `/api/recipe` | Yes | `CreateRecipeSchema` |
| PATCH | `/api/recipe/:id` | Yes, owner only | Partial update |
| DELETE | `/api/recipe/:id` | Yes, owner only | |
| GET | `/api/user/me` | Yes | Current profile |
| PATCH | `/api/user` | Yes | `{ name }` **only** |
| PUT | `/api/user/password` | Yes | `{oldPassword, newPassword}`; invalidates all sessions server-side |
| DELETE | `/api/user` | Yes | Delete own account |
| GET | `/api/user` | Yes | Not actually admin-gated — do not build UI on top of this |
| GET | `/api/user/favourites` | Yes | Populated recipe list |
| POST | `/api/user/favourites/:id` | Yes | |
| DELETE | `/api/user/favourites/:id` | Yes | |

**Recipe:** `name, brief, description?, image (URL), ingredients[{name, quantity, unit?}],
instructions[string], prepTime, cookTime, servings, difficulty (easy|medium|hard),
category, tags[]`, plus server-managed `owner, rating, ratingsCount, views, createdAt,
updatedAt`.

**User:** `name, email, image?, role (user|admin), favourites[]`.

**Known field bug to fix:** the home recipe list currently renders `recipe.description`
where it should render `recipe.brief` (short summary). `Favourites` already does this
correctly with a `brief || description` fallback — match that pattern.

---

## 4. Conventions

- **HTTP client:** always use `lib/api.ts` / `apiClient` (from `lib/axios.ts`). Never
  add a new raw `axios` instance or manually read `localStorage` for the auth header —
  `apiClient`'s interceptor already attaches `Bearer <token>` and handles single-flight
  refresh. The Login page currently violates this; fix forward, don't copy that pattern.
- **Auth state:** read/write auth via `context/AuthContext.tsx` (`useAuth()`), not
  direct `localStorage.getItem(...)` calls scattered across components. If the context
  doesn't exist yet, building it is a prerequisite for any auth-touching task.
- **Types:** import from `types/recipe.ts`, `types/user.ts`, `types/auth.ts`,
  `types/api.ts`. Do not declare inline/duplicated `type Recipe = {...}` per file — if a
  type is missing, add it to the shared file instead of redeclaring locally.
- **UI primitives:** reuse `components/ui/{Button,Input,Modal,Card}.tsx` and
  `components/common/{Loader,ErrorMessage,EmptyState}.tsx`. Do not hand-roll new
  Tailwind markup for things these already cover; if a primitive is missing, add it to
  the shared kit rather than inlining a one-off.
- **Route protection:** protected pages (`/create-recipe`, `/my-recipes`,
  `/my-recipes/[id]`, `/favourites`, `/profile`) must call a `useRequireAuth()` guard at
  the top of the page, before any data fetch — not just react to a 401 after the fact.
- **Validation:** client-side validation should mirror the backend's Zod constraints
  (lengths, ranges, required fields) listed in the PRD §4.1–§4.4. Keep error messages
  field-level, not just a single toast.
- **No dead code:** never leave commented-out implementations, empty page files, or
  placeholder markup (`<h1>Register</h1>`) as the final state of a task. Either finish
  the feature or leave the file in its prior working state.
- **Styling:** Tailwind v4 utility classes; keep visual language consistent with
  existing `Navbar`/`Footer`/`Hero`.

---

## 5. Definition of Done (per feature)

Before considering a task complete, verify:

- [ ] Uses `apiClient`, not raw `axios`.
- [ ] Uses shared types from `types/*`, not inline duplicates.
- [ ] Uses shared `ui/`/`common/` components for buttons, inputs, loading, empty, and
      error states.
- [ ] Auth reads/writes go through `useAuth()`, and update state so `Navbar`/other
      consumers re-render without a full navigation.
- [ ] Protected routes are guarded before fetch, not only after a 401.
- [ ] Client-side validation matches the backend schema constraints referenced above.
- [ ] No dead code, empty files, or placeholder text left behind.
- [ ] Does not introduce upload flows, non-name profile fields, server-side
      search/pagination params, or admin-only UI (see §2).

---

## 6. Suggested Build Order (from PRD §6)

1. Foundations: `types/*`, `AuthContext`/`useAuth`, shared `ui/`/`common/` components.
2. Auth flows: Register page (new), Login refactor onto `apiClient` + context.
3. Recipe read paths: public `/recipes/[id]` detail page, fix `brief`/`description`
   bug, client-side search/filter on Home.
4. Recipe write paths: Create Recipe form, `/my-recipes/[id]` edit page, edit/delete
   actions on the My Recipes list.
5. Profile management: edit name, change password (handle forced re-login), delete
   account.
6. Route protection: `useRequireAuth()` applied to all protected pages.
7. Polish: Hero copy, metadata/SEO, Contact page cleanup, toast notifications.

Work roughly in this order — later steps assume the foundations from step 1 exist.

---

## 7. Commands

> Fill in once confirmed against `frontend/package.json` — typical Next.js scripts:

```bash
cd frontend
npm install
npm run dev        # local dev server
npm run build       # production build — run before considering a task "done"
npm run lint         # lint — run before considering a task "done"
```

Always run `build` and `lint` (or the project's equivalents) after non-trivial changes
and fix any errors they surface before finishing a task.