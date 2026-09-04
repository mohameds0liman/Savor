# memory.md — Complete Project Knowledge Base

**Purpose:** This file is a complete substitute for re-reading the project. Any agent picking up work here should be able to read only this file (plus `PRD.md`, `Design.md`, `tasks.md` in this same folder) and have full context — no need to re-explore `backend/` or `frontend/` from scratch. It documents exact file paths, exact schemas, exact bugs, exact quirks, and exact current implementation state as of the last full audit.

**Project root:** `recipe_mern/` (a MERN stack app: MongoDB + Express + React/Next.js), with two independent sub-projects:
- `recipe_mern/backend/` — Express + TypeScript + Mongoose API (fully implemented)
- `recipe_mern/frontend/` — Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 (partially implemented)

**Companion docs (already written, in `recipe_mern/frontend/`):**
- `PRD.md` — frontend requirements: what's done/partial/missing, feature specs, backend constraints, acceptance criteria
- `Design.md` — full design system: tokens, components, page-by-page layout specs, backend-driven constraints, explicit out-of-scope list
- `tasks.md` — milestone plan (M0–M7) implementing the PRD with a testing checklist per milestone

This `memory.md` is the **factual ground-truth reference** underlying all three — if any of the above docs seem to disagree with this file, trust this file (it reflects the actual code, not aspirational descriptions).

---

## 1. Repository Layout

```
recipe_mern/
├── .gitignore
├── .vscode/
├── node_modules/               (root-level, likely unused/legacy)
├── backend/
│   ├── .gitignore
│   ├── README.md               (contains intended architecture + route list notes, partially aspirational)
│   ├── backend-flow.html       (a visual/HTML diagram of backend flow, not authoritative)
│   ├── package.json / package-lock.json
│   ├── node_modules/
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── db.ts
│       │   └── env.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── recipe.controller.ts
│       │   └── user.controller.ts
│       ├── models/
│       │   ├── Recipe.ts
│       │   ├── Session.ts
│       │   └── User.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── recipe.routes.ts
│       │   └── user.routes.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── recipe.service.ts
│       │   └── user.service.ts
│       ├── middlewares/
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts        (STUB — entirely commented out, unused)
│       │   ├── validate.middleware.ts
│       │   └── validation/
│       │       ├── auth.validation.ts
│       │       ├── recipe.validation.ts
│       │       └── user.validation.ts
│       ├── types/
│       │   └── express.d.ts
│       └── utils/
│           ├── hash.ts
│           ├── helpers.ts              (STUB — entirely commented out, unused)
│           └── jwt.ts
└── frontend/
    ├── .gitignore
    ├── AGENTS.md                    (contains only "@AGENTS.md" — points to CLAUDE.md-style rules)
    ├── CLAUDE.md                    (Next.js 16 warning: "not the Next.js you know", read node_modules/next/dist/docs before writing code)
    ├── README.md                    (contains intended folder structure, partially aspirational — see §5)
    ├── PRD.md                       (written by a previous agent session — frontend requirements)
    ├── Design.md                    (written by a previous agent session — design system)
    ├── tasks.md                     (written by a previous agent session — milestone plan)
    ├── package.json / package-lock.json
    ├── eslint.config.mjs / next.config.ts / postcss.config.mjs / tsconfig.json / tsconfig.tsbuildinfo / next-env.d.ts
    ├── .next/, node_modules/
    ├── public/
    │   └── file.svg, globe.svg, next.svg, vercel.svg, window.svg   (default Next.js starter assets, unused/decorative)
    └── src/
        ├── app/
        │   ├── favicon.ico
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── page.tsx                        (Home)
        │   ├── contact/page.tsx
        │   ├── create-recipe/page.tsx          (EMPTY — all commented out)
        │   ├── favourites/page.tsx
        │   ├── login/page.tsx
        │   ├── my-recipes/
        │   │   ├── page.tsx
        │   │   └── [id]/page.tsx               (COMPLETELY EMPTY FILE — zero content)
        │   ├── profile/page.tsx
        │   └── register/page.tsx               (STUB — only `<h1>Register</h1>`)
        ├── assets/                              (EMPTY directory)
        ├── components/
        │   ├── footer/page.tsx
        │   ├── hero/page.tsx
        │   ├── navbar/page.tsx
        │   └── recipes/page.tsx                (the "RecipeList" component, default export name `RecipeList`, file path components/recipes/page.tsx)
        └── lib/
            ├── api.ts                           (exports `API_URL`)
            └── axios.ts                          (exports `apiClient` — the shared Axios instance with refresh logic)
```

**Naming quirk to remember:** Frontend components live at `components/<name>/page.tsx` (not `components/<Name>.tsx`), and are imported like `import Navbar from "@/components/navbar/page"`. This pattern is used consistently for `navbar`, `footer`, `hero`, `recipes`. Any new shared component folders introduced later (per PRD's `ui/`, `common/` proposal) do **not** need to follow this `page.tsx` convention — those are new conventions to be introduced, not yet established ones.

---

## 2. Backend — Complete Contract (Ground Truth)

### 2.1 Runtime / Config

- Express 5, TypeScript, run via `tsx` (`npm run dev` = `nodemon --exec tsx src/server.ts`; `npm start` = `tsx src/server.ts`).
- `backend/src/server.ts`: loads `.env` via `dotenv`, calls `connectDB()` then `app.listen(PORT)`. `PORT` defaults to `5000` if unset (`process.env.PORT || 5000`).
- `backend/src/app.ts` global middleware order: `helmet()` → global rate limiter (`windowMs: 15 * 60 * 1000, max: 100`) → `express.json()` → `cors({ origin: process.env.FRONTEND_URL || "http://localhost:4000", methods: ["GET","POST","PATCH","DELETE"] })` → mount `authRoutes`, `recipeRoutes`, `userRoutes` all under `/api`.
  - **Note:** CORS `methods` array does **not** include `PUT`, but `PUT /api/user/password` exists as a route. This could cause CORS preflight failures for that specific endpoint in a real cross-origin browser call — worth verifying/fixing if password-change requests fail with a CORS error in practice.
  - Default frontend origin assumed by backend CORS is port `4000`, and indeed `frontend/package.json`'s `dev` script runs `next dev -p 4000` — these are consistent.
- `backend/src/config/env.ts`: validates required env vars at import time: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MONGODB_URI`, `PORT`, `NODE_ENV`, `FRONTEND_URL` (throws if any missing, throws if either JWT secret < 32 chars). **However**, this `env.ts` module's exported `env` object is not actually imported/used anywhere else that was found — `jwt.ts` reads `process.env.JWT_ACCESS_SECRET`/`process.env.JWT_REFRESH_SECRET` directly instead (see §2.6), a **naming mismatch**: `env.ts` expects `JWT_SECRET`, but `jwt.ts` reads `JWT_ACCESS_SECRET`. This is a latent inconsistency in the backend env-var naming (not a frontend concern, but worth knowing if debugging auth failures — check which var name is actually set in the real `.env`).
- `backend/src/config/db.ts` — `connectDB()` calls `dns.setServers(["8.8.8.8","1.1.1.1"])` (forces Google/Cloudflare DNS, presumably to work around a flaky local resolver for MongoDB Atlas SRV lookups) then `mongoose.connect(process.env.MONGO_URI!)`. **Critical naming mismatch confirmed:** this reads `process.env.MONGO_URI`, but `config/env.ts`'s required-vars list checks for `MONGODB_URI` (with the extra "DB"). This is a second, independently-confirmed instance of `env.ts` not matching the variable names actually read by live code (see also §2.6's `JWT_SECRET` vs `JWT_ACCESS_SECRET` mismatch) — strong evidence that `config/env.ts`'s validation module is dead/unused code that no longer reflects what the app actually reads. On connection failure, logs the error and calls `process.exit(1)` (hard crash, no retry).

### 2.2 API Base Path

All routes are mounted under `/api` (no versioning, e.g. no `/api/v1`). Full base URL in dev: `http://localhost:<PORT>/api` where `PORT` defaults to 5000 unless overridden.

Frontend's `API_URL` (in `frontend/src/lib/api.ts`) = `process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"` — **note this default (3000) does not match the backend's actual default port (5000)**. In practice `NEXT_PUBLIC_API_URL` must be set correctly in `.env.local` for the frontend to reach the backend; the fallback is unreliable unless the backend explicitly runs on port 3000.

### 2.3 Complete Route Table (verified from route files directly)

**`backend/src/routes/auth.routes.ts`** (no base prefix beyond `/api`):
```
POST /api/login     — authLimiter, validate(LoginSchema), loginUser
POST /api/refresh   — authLimiter, validate(RefreshSchema), refreshAccessToken
POST /api/logout    — logoutUser  (no rate limiter, no validation middleware)
```
Note: signup is registered in `user.routes.ts`, not `auth.routes.ts` (see below) — despite the backend README's aspirational doc showing `POST /api/auth/signup`. The **actual** live path is `POST /api/signup` (no `/auth` prefix at all — none of the routes have an `/auth`, `/recipe`s-plural, or `/user`s-plural prefix beyond what's shown).

**`backend/src/routes/recipe.routes.ts`**:
```
POST   /api/recipe        — authLimiter, auth, validate(CreateRecipeSchema), createRecipe
PATCH  /api/recipe/:id     — authLimiter, auth, validate(UpdateRecipeSchema), updateRecipe
GET    /api/recipe         — getRecipes            (PUBLIC, no auth)
GET    /api/recipe/my      — authLimiter, auth, getUserRecipes
GET    /api/recipe/:id     — getRecipe              (PUBLIC, no auth)
DELETE /api/recipe/:id     — authLimiter, auth, deleteRecipe
```
**Route-order caveat:** `GET /api/recipe/my` is declared AFTER `GET /api/recipe` but BEFORE `GET /api/recipe/:id` in the file — this ordering is correct (Express matches `/my` literally before falling through to the `:id` param route), so `/api/recipe/my` will NOT be incorrectly captured as `id="my"`. No bug here, just noting the order matters and is currently correct.

**`backend/src/routes/user.routes.ts`**:
```
POST   /api/signup                     — validate(CreateUserSchema), createUser        (PUBLIC — this IS the registration endpoint)
PATCH  /api/user                       — authLimiter, auth, validate(UpdateUserSchema), updateUser
GET    /api/user/me                    — authLimiter, auth, getUserById
GET    /api/user                        — authLimiter, auth, getUsers    (⚠ no admin check enforced despite README claiming authorize("admin"))
DELETE /api/user                        — authLimiter, auth, deleteUser
PUT    /api/user/password               — authLimiter, auth, validate(ChangePasswordSchema), changePassword
GET    /api/user/favourites             — authLimiter, auth, getFavourites
POST   /api/user/favourites/:id         — authLimiter, auth, addFavourite
DELETE /api/user/favourites/:id         — authLimiter, auth, removeFavourite
```
There is a commented-out line `// router.patch("/users/:id",...)` — dead code, ignore.

**Full flat endpoint list (24 total distinct method+path combos across the 3 route files — actually 3 + 6 + 9 = 18 routes):**
| # | Method | Path | Auth? | Rate-limited? | Validated body? |
|---|---|---|---|---|---|
| 1 | POST | `/api/login` | No | Yes (10/30s) | `LoginSchema` |
| 2 | POST | `/api/refresh` | No | Yes (10/30s) | `RefreshSchema` |
| 3 | POST | `/api/logout` | No¹ | No | No |
| 4 | POST | `/api/recipe` | Yes | Yes | `CreateRecipeSchema` |
| 5 | PATCH | `/api/recipe/:id` | Yes (owner) | Yes | `UpdateRecipeSchema` |
| 6 | GET | `/api/recipe` | No | No | — |
| 7 | GET | `/api/recipe/my` | Yes | Yes | — |
| 8 | GET | `/api/recipe/:id` | No | No | — |
| 9 | DELETE | `/api/recipe/:id` | Yes (owner) | Yes | — |
| 10 | POST | `/api/signup` | No | No | `CreateUserSchema` |
| 11 | PATCH | `/api/user` | Yes | Yes | `UpdateUserSchema` |
| 12 | GET | `/api/user/me` | Yes | Yes | — |
| 13 | GET | `/api/user` | Yes | Yes | — |
| 14 | DELETE | `/api/user` | Yes | Yes | — |
| 15 | PUT | `/api/user/password` | Yes | Yes | `ChangePasswordSchema` |
| 16 | GET | `/api/user/favourites` | Yes | Yes | — |
| 17 | POST | `/api/user/favourites/:id` | Yes | Yes | — |
| 18 | DELETE | `/api/user/favourites/:id` | Yes | Yes | — |

¹ `/api/logout` doesn't run the `auth` middleware, but functionally requires a valid `refreshToken` in the body to do anything meaningful (it invalidates the session matching that hashed token).

"authLimiter" everywhere = `rateLimit({ windowMs: 0.5 * 60 * 1000, max: 10 })` i.e. **max 10 requests per 30 seconds** per limiter instance (each route file creates its own separate limiter instance — they don't share a counter across files, only within calls to that same file's limiter application, effectively per-router).

Global limiter (`app.ts`) = `max: 100` per `15 minutes`, applied to ALL requests regardless of route, stacked on top of the per-route limiters.

### 2.4 Request/Response Envelope Convention

Every controller response follows this shape (verified across all controllers):
```ts
// success
{ message: string, data: <payload> }
// or for logout/simple actions:
{ message: string }

// error
{ message: string, error: string }   // error = `error: ${err.name}: ${err.message}`
```
Status codes used: `200` (success/read), `201` (creation), `400` (bad input / login failure / missing fields), `401` (missing/invalid/expired access token, from `auth.middleware.ts`), `403` (authorization failure — not the resource owner, or missing `req.user`), `404` (recipe not found), `500` (unhandled/internal errors, which is the default `catch` fallback in nearly every controller).

There is **no centralized error-handling middleware** — `error.middleware.ts` is entirely commented out/unused. Every controller has its own inline `try/catch` with a duplicated 500-response pattern. This means error responses are consistent in *shape* by convention/copy-paste, not by shared code.

### 2.5 Models (exact Mongoose schemas)

**`User` (`backend/src/models/User.ts`):**
```
name: String, required, trim, minlength 2, maxlength 50
email: String, required, unique, lowercase, trim
passwordHash: String, required, select:false (never returned by default queries)
image: String, default null
role: enum ["user","admin"], default "user"
favourites: [ObjectId ref "Recipe"]
timestamps: true (createdAt, updatedAt)
```

**`Recipe` (`backend/src/models/Recipe.ts`):**
```
name: String, required, trim, minlength 3, maxlength 150
brief: String, required, trim, maxlength 300           (no minlength at schema level, though CreateRecipeSchema Zod validation requires min 10)
description: String, trim, maxlength 3000 (optional at schema level)
instructions: [String], required                        (array of strings — NOT a single block of text)
image: String, required                                  (any string — Mongoose schema itself doesn't enforce URL format, only the Zod validator does)
ingredients: [{ name: String required trim, quantity: Number required, unit: String trim (optional) }]
prepTime: Number, required, min 0
cookTime: Number, default 0, min 0
servings: Number, required, min 1
difficulty: enum ["easy","medium","hard"], default "easy"
category: String, required, trim                         (no maxlength at schema level, though Zod requires 2-50)
tags: [String], default []
owner: ObjectId ref "User", required
rating: Number, default 0, min 0, max 5
ratingsCount: Number, default 0, min 0
views: Number, default 0
timestamps: true
```
**Critical facts:** No mongoose method or service function anywhere increments `rating`, `ratingsCount`, or `views`. They exist purely as static/default fields today. No endpoint lets a client set them either — `CreateRecipeSchema`/`UpdateRecipeSchema` don't include these fields, and **confirmed** (see `validate.middleware.ts` breakdown below): `req.body` is reassigned to `result.data` (the parsed Zod output), and Zod's default (non-`.strict()`) `.object()` behavior strips unrecognized keys during parsing — so even if a malicious/buggy client sent `rating`/`ratingsCount`/`views`/`owner` in a create/update request body, those keys would be silently dropped before the controller/service ever sees them. This is a real, confirmed guarantee, not a guess.

**`Session` (`backend/src/models/Session.ts`):**
```
user: ObjectId ref "User", required
refreshToken: String, required, select:false             (stores a SHA-256 hash of the refresh token, not the raw token)
userAgent: String, default null
ip: String, default null
isValid: Boolean, default true                            (set false on logout, not deleted)
expiresAt: Date, required
timestamps: true
TTL index on expiresAt (expireAfterSeconds: 0)             — Mongo auto-deletes expired session docs
```

### 2.6 Auth/Token Mechanics (exact flow)

- **Access token:** JWT signed with `process.env.JWT_ACCESS_SECRET`, expires in `1h` (hardcoded `ACCESS_EXPIRES_IN = "1h"` in `jwt.ts`, NOT the `15m` mentioned in the unused `env.ts` — `jwt.ts`'s hardcoded constant is what's actually used).
- **Refresh token:** JWT signed with `process.env.JWT_REFRESH_SECRET`, expires in `30d` (hardcoded `REFRESH_EXPIRES_IN = "30d"` — again NOT the `7d` in the unused `env.ts`).
- Both tokens carry payload `{ id: string }` only (the user's Mongo `_id` as a string) — no `role`, `name`, or `email` embedded in the JWT itself.
- **Login flow (`auth.service.ts` → `loginUser`):**
  1. Find user by email, `.select("+passwordHash")` to include the normally-hidden hash.
  2. `bcrypt.compare` the password.
  3. Generate both tokens.
  4. **Delete any existing session for that user** (`Session.deleteOne({user: user._id})`) before creating a new one — i.e. **only one active session per user at a time**; logging in from a second device/browser invalidates the first device's refresh token's session record.
  5. Create a new `Session` doc storing `hashRefreshToken(refreshToken)` (SHA-256 hex digest, not bcrypt — see `hash.ts`), `userAgent`, `ip`, `expiresAt` (derived from decoding the refresh JWT's `exp` claim).
  6. Returns `{ message, accessToken, refreshToken, user: { id, name, email, role } }` (passwordHash never included).
- **Signup flow (`user.service.ts` → `createUser`):** hashes password with bcrypt (cost factor 10), creates the `User`, generates both tokens, creates a `Session` (note: signup's session creation does **not** pass `userAgent`/`ip` — those default to `null` here since `createUser` only receives `data`, not request `meta` like login does), returns the same `{ message, accessToken, refreshToken, user }` shape — meaning **signup already returns everything needed for the frontend to auto-login the user immediately** (matches PRD's plan).
  - **Confirmed live (M1) via direct `curl` against `POST /api/signup`:** the actual wire response is `{ message: "User Created Successfully", data: { message: "User Created Successfully", accessToken, refreshToken, user: {id,name,email,role} } }` — i.e. `user.controller.ts`'s `createUser` wraps the *entire* service-layer return object (which itself already has its own `message` key) as `data`. This means `data` has a redundant/duplicate inner `message` field alongside `accessToken`/`refreshToken`/`user` — harmless for the frontend since `AuthResponse`/`login()` only reads `accessToken`/`refreshToken`/`user` off of `res.data.data`, but worth knowing if a future agent is confused by seeing `message` twice in a signup response. `POST /api/login`'s response does NOT have this double-`message` quirk (its controller returns `{message, data: {accessToken, refreshToken, user}}` cleanly) — this nested-message quirk is unique to signup.
- **Refresh flow (`refreshAccessToken`):** verifies the refresh JWT signature/expiry, looks up a `Session` matching `{ user: payload.id, refreshToken: hashRefreshToken(refreshToken), isValid: true }`, and if found, issues ONLY a new access token — **the same refresh token is returned back to the client unchanged** (no refresh token rotation). Returns `{ message, accessToken, refreshToken }` (the refreshToken field is just an echo of the input).
- **Logout flow (`logoutUser`):** finds session by hashed refresh token, sets `isValid: false` (never deletes the doc — kept for audit/activity tracking per code comments). If no session matches, throws (controller returns 400).
- **`auth.middleware.ts`:** expects `Authorization: Bearer <accessToken>` header. Verifies via `verifyAccessToken`. On success sets `(req as any).user = decoded` (i.e. `req.user = { id: string }` — only `id`, nothing else, so any code expecting `req.user.role` or `req.user.name` would get `undefined`; confirmed no controller relies on `req.user.role`). Returns 401 on missing header or invalid/expired token — does NOT attempt to auto-refresh; that responsibility is entirely on the frontend (which is exactly what `frontend/src/lib/axios.ts`'s interceptor implements). **Confirmed via `backend/src/types/express.d.ts`:** the global Express `Request` type augmentation is declared as exactly `interface Request { user?: { id: string } }` — this is the authoritative, type-checked shape of `req.user` everywhere in the backend; there is no `role`/`name`/`email` on it anywhere in the type system, not just by convention.
- **Password change (`user.service.ts` → `changePassword`):** verifies `oldPassword` via bcrypt compare, hashes and saves `newPassword`, then **`Session.deleteMany({user:userId})`** — this destroys ALL sessions for that user (not just the current one), forcing a full logout. There is no re-issuing of new tokens after password change — the frontend must treat this as "always redirect to login after password change," as already captured in PRD/tasks.md.
- **Change password validation quirk:** the controller checks `!changes.oldPassword || !changes.newPassword` for a 400 *before* calling the service — this check happens even though `validate(ChangePasswordSchema)` middleware already ran first and would have already 400'd if those fields were missing/invalid. Redundant but harmless.

### 2.7 Validation Schemas (exact Zod constraints — use these verbatim for frontend client-side validation)

**`auth.validation.ts`:**
```ts
LoginSchema: { email: valid email, password: string 8–100 chars }
RefreshSchema: { refreshToken: string min 1 }
```

**`user.validation.ts`:**
```ts
CreateUserSchema: {
  name: string 2–50 chars,
  email: valid email (Zod's `.email()` top-level function form, lowercased via `.toLowerCase()`),
  password: string 8–100 chars
}
ChangePasswordSchema: {
  oldPassword: string 8–100 chars,
  newPassword: string 8–100 chars
}
UpdateUserSchema = CreateUserSchema.partial().pick({ name: true })
  → i.e. ONLY { name?: string } is a valid update payload. Sending email/password here does nothing (silently stripped by Zod's non-strict parsing).
```

**`recipe.validation.ts`:**
```ts
IngredientSchema (shared): {
  name: string 1–100 chars,
  quantity: number, positive (> 0),
  unit: string max 30 chars, optional
}

CreateRecipeSchema: {
  name: string 3–150,
  brief: string 10–300,
  description: string 10–3000, optional,
  image: string, must be a valid URL (`.url()`),
  ingredients: array of IngredientSchema, min length 1,
  instructions: array of strings each 3–1000 chars, min length 1 array item,
  prepTime: integer >= 0,
  cookTime: integer >= 0, default 0,
  servings: integer >= 1,
  difficulty: enum ["easy","medium","hard"], default "easy",
  category: string 2–50,
  tags: array of strings each 1–30 chars, default []
}

UpdateRecipeSchema = CreateRecipeSchema.partial()
  → every field above becomes optional for PATCH, but if present, same per-field constraints apply.
```

**Confirmed exact behavior of `validate.middleware.ts`** (`backend/src/middlewares/validate.middleware.ts`, fully read):
```ts
export function validate(schema: ZodSchema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Validation failed", errors: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };
}
```
So: validation failures return **exactly** `{ message: "Validation failed", errors: <Zod flatten() shape> }` (this is a DIFFERENT error shape than the generic `{message, error}` controller-level pattern in §2.4 — validation errors have an `errors` key with `{formErrors: string[], fieldErrors: {[field]: string[]}}` structure from Zod's `.flatten()`, not a flat `error` string). On success, `req.body` is **replaced** with `result.data` (the parsed/coerced/defaulted output) — meaning defaults like `cookTime: 0`, `difficulty: "easy"`, `tags: []` are already applied by the time the controller/service sees the body. Downstream code receives data matching the DTO types exported alongside each schema (`CreateUserDTO`, `UpdateUserDTO`, `ChangePasswordDTO`, `CreateRecipeDTO`, `UpdateRecipeDTO`, `LoginUserDTO`, `RefreshTokenDTO`). **Frontend implication:** when displaying a 400 validation error from these endpoints, check for `response.data.errors` (Zod flatten shape) rather than assuming `response.data.error` (string) is always present — the two error shapes coexist across different failure paths in the same API.

### 2.8 Utils

- **`hash.ts`:** `hashRefreshToken` = SHA-256 hex digest (via Node `crypto`, NOT bcrypt) — used only for refresh tokens stored in `Session`. `hashPassword`/`comparePassword` = bcrypt with cost factor 10 — used only for user passwords in `User.passwordHash`.
- **`jwt.ts`:** see §2.6 for exact expiry constants and env var names (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — NOT `JWT_SECRET` as `env.ts` expects).
- **`helpers.ts`:** entirely commented out (a dead `slug()` function stub) — no live helper functions exist here.

### 2.9 Known Backend Bugs/Inconsistencies (for awareness, NOT to be fixed by frontend work)

1. `env.ts` expects `JWT_SECRET` but `jwt.ts` actually reads `JWT_ACCESS_SECRET` — naming mismatch between the (unused) validated env config and the actually-used raw `process.env` reads.
1b. `env.ts` expects `MONGODB_URI` but `config/db.ts`'s `connectDB()` actually reads `process.env.MONGO_URI` (no "DB") — a second, independently confirmed instance of the same pattern as bug #1, reinforcing that `env.ts` is dead/aspirational code not reflecting what's actually read at runtime.
2. `env.ts`'s documented token expiries (`15m`/`7d`) don't match `jwt.ts`'s actual hardcoded values (`1h`/`30d`).
3. CORS `methods` whitelist in `app.ts` omits `PUT`, but `PUT /api/user/password` is a real route — potential CORS failure for password-change requests from a browser.
4. `backend/README.md`'s documented route list (`/api/auth/signup`, `authorize("admin")` on `GET /api/users`, `/api/users/me/favourites/:recipeId`) does **not** match the actual live routes (`/api/signup` with no `/auth` prefix, no admin check enforced, `/api/user/favourites/:id` not nested under `/me`). **Always trust the route files (§2.3) over the README.**
5. `error.middleware.ts` and `utils/helpers.ts` are both fully-commented-out dead stub files.
6. Only one active session per user at a time (login deletes prior sessions) — logging in on a second device silently logs out the first device's ability to refresh (the old access token still works until it expires within 1h, but refresh will fail after that since the session was deleted).
7. Refresh tokens are never rotated — the same refresh token lives for its full 30-day life regardless of how many times it's used to refresh an access token.
8. `recipe.service.ts` never populates `owner` on any read (`getRecipes`, `getRecipe`, `getUserRecipes` all return raw ObjectId refs) — no author name/avatar can ever be shown for a recipe on any page (own or others').
9. `getFavourites` DOES populate (`User.findById(userId).populate("favourites")`), so favourite recipe cards get full data directly; `getRecipes`/`getUserRecipes` do NOT need extra population since they return full `Recipe` documents already (just with an unpopulated `owner` field, which is only needed for the string-equality owner check, not for display).
10. No pagination, search, sort, or filter query-param support on `GET /api/recipe` — always returns the entire collection.
11. No file upload capability anywhere (no multer, no Cloudinary/S3 integration) — `image` is purely a URL string field.
12. `GET /api/user` (list all users) has zero authorization check beyond "is logged in" — despite `backend/README.md` claiming it's admin-gated. Do not build frontend admin UI trusting this is secured.

---

## 3. Frontend — Complete Current-State Audit

### 3.1 Config & Tooling

- `package.json` scripts: `dev` = `next dev -p 4000` (frontend always runs on port 4000 in dev), `build` = `next build`, `start` = `next start`, `lint` = `eslint`.
- Dependencies: `axios ^1.19.0`, `next ^16.3.1`, `react`/`react-dom` `19.2.4`, `react-icons ^5.7.0`. Dev deps: Tailwind v4 (`@tailwindcss/postcss`), TypeScript 5, ESLint 9 + `eslint-config-next`.
- **No** state-management library (no Redux/Zustand), **no** form library (no react-hook-form/Formik), **no** query library (no TanStack Query/SWR) — all data fetching today is raw `useEffect` + `axios`/`apiClient` calls with local `useState`.
- `CLAUDE.md`/`AGENTS.md` in `frontend/` root: contains a warning that this Next.js version has breaking changes vs. training data, and instructs reading `node_modules/next/dist/docs/` before writing new Next.js code. **Any agent writing new Next.js-specific code (routing, metadata API, middleware, server components/actions) in this frontend should check those local docs first** rather than relying purely on general Next.js knowledge, since conventions may differ from what's expected for "Next.js 16."
- `globals.css`: Tailwind v4 import, CSS custom properties for `--background`/`--foreground` with a `prefers-color-scheme: dark` media query already set up (light/dark tokens exist but no explicit dark-mode toggle UI). Body font falls back to `Arial, Helvetica, sans-serif` after Geist variables.
- `app/layout.tsx`: still has default Next.js starter `metadata` (`title: "Create Next App"`, generic description) — never customized. Wraps `<html>`/`<body>` with Geist font variables; no `AuthProvider`/context wrapper exists yet (would need to be added here in M0 of `tasks.md`).

### 3.2 `lib/api.ts` and `lib/axios.ts` (the most solid/production-ready code in the frontend)

- `api.ts`: `export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"`. **Default mismatch warning:** backend defaults to port `5000`, not `3000` — this fallback only works if `NEXT_PUBLIC_API_URL` env var is properly set, or if the backend happens to be run with `PORT=3000`.
- `axios.ts`: exports default `apiClient`, an Axios instance with `baseURL: \`${API_URL}/api\`` (so callers use paths like `/user/me`, `/recipe`, not `/api/user/me`).
  - Request interceptor: reads `localStorage.getItem("token")`, sets `Authorization: Bearer <token>` header if present.
  - Response interceptor: on any `401` response (except when the failing request itself was to `/refresh`, or already retried once via a `_retry` flag), triggers a **single-flight refresh** — concurrent 401s all queue behind one in-flight `POST /refresh` call (dedup via a module-level `refreshPromise` + `pendingQueue` array), then either retries all queued requests with the new token or rejects them all and calls `cleanupAuth()`.
  - `cleanupAuth()`: removes `token`, `refreshToken`, `userName` from `localStorage`, and does a **hard redirect** (`window.location.href = "/login"`) — not a Next.js router push, a full page reload. This is intentional/acceptable but means any in-flight React state is lost on forced logout (acceptable since it's a security boundary event).
  - This entire file is already well-built and matches what PRD/tasks.md call for. **Do not rewrite this file** — only ever add new consumers of `apiClient`, and when introducing `AuthContext` (tasks.md M0), have `login()`/`logout()` in the context wrap (not replace) these same `localStorage` keys so `apiClient`'s interceptors keep working unchanged.
  - **Key localStorage keys currently used app-wide:** `"token"` (access token), `"refreshToken"`, `"userName"` (display name only — NOT the full user object; no `"userId"`, `"userRole"`, or `"userEmail"` key exists anywhere in localStorage today). Any future `AuthContext` implementation should decide whether to keep using these three specific keys (for backward compatibility with `axios.ts`'s interceptor, which is hardcoded to read `"token"`/`"refreshToken"`) or expand what's stored — but `axios.ts`'s reads of `"token"`/`"refreshToken"` specifically must not be renamed without updating `axios.ts` too.

### 3.3 Page-by-Page Current Implementation State

#### `app/page.tsx` (Home) — **functional shell**
Composes `Navbar` + `Hero` + `Recipes` (imported from `@/components/recipes/page`, default-exported as `RecipeList` internally but imported under the local name `Recipes`) + `Footer`, wrapped in `<main className="min-h-screen bg-white text-black">`. No props passed to any child. No search/filter UI at this level (that logic would live inside the `Recipes`/`RecipeList` component per PRD/Design plans).

#### `app/login/page.tsx` — **functional, but bypasses shared client**
- `"use client"`. Local `useState` for `email`, `password`, `error`.
- On submit: `axios.post(\`${API_URL}/api/login\`, {email, password})` — uses **raw `axios`**, not `apiClient`, and manually reconstructs the `/api/login` path (duplicating what `apiClient`'s `baseURL` already does). This is the inconsistency PRD/tasks.md flag for refactoring.
- On success: writes `localStorage.token = res.data.data.accessToken`, `localStorage.refreshToken = res.data.data.refreshToken`, `localStorage.userName = res.data.data.user.name`, then `router.push("/")`.
- On failure: `setError(err.response?.data?.message || "Something went wrong")`.
- Renders a simple centered `max-w-sm` form: email input, password input, inline error paragraph, submit button, and a `Link` to `/register` ("Don't have an account? Register").
- **No client-side validation at all** before submit (relies entirely on backend's Zod validation + HTML5 `required`/`type="email"` attributes).

#### `app/register/page.tsx` — **STUB, not implemented**
Entire file:
```tsx
function Register(){
    return(
        <h1>Register</h1>
    )
}
export default Register
```
No `"use client"`, no form, no imports, nothing. This is the single largest gap alongside `create-recipe` and `my-recipes/[id]`.

#### `app/create-recipe/page.tsx` — **EMPTY (100% commented out)**
The entire file content is a commented-out sketch of a component (`Create_Recipe`) that would fetch `GET /recipe/${id}` (note: `id` isn't even defined/imported in that dead code — it's a broken sketch, not working code) and render `<h1>create_recipe</h1>`. Nothing is live. Effectively this route currently renders **nothing at all** (an empty module with no default export would actually be a Next.js build error if it weren't for the fact the entire file is comments — need to double check whether an entirely-commented-out `page.tsx` with no default export causes a build failure. **This is worth verifying** — a `.tsx` page file under App Router with zero exports will fail the Next.js build/type-check for that route). Treat this as **must be written from scratch** per PRD §4.4 / tasks.md M3.

#### `app/my-recipes/page.tsx` — **functional list, no mutate actions**
- `"use client"`. Local `useState<Recipe[]>` for `userRecipes` (note: the local state variable name `userRecipes` and the component's own function name `userRecipes()` (lowercase!) collide/shadow-ish stylistically — the component function itself is literally named `userRecipes` (not `UserRecipes`), which is a lint/convention smell (React component functions should be PascalCase) but not a runtime bug since it's still a valid function used as JSX in `export default`.
- On mount: manually reads `localStorage.getItem("token")` and passes it as an explicit `Authorization` header on `apiClient.get("/recipe/my", {headers: {...}})` — **redundant**, since `apiClient`'s own request interceptor already attaches this header automatically from the same localStorage key. This manual header-passing is harmless (same value, just duplicated) but should be removed per PRD/tasks.md cleanup.
- On 401 error: clears `token`/`userName` from localStorage and redirects to `/` via `router.push("/")` (note: redirects to home `/`, NOT to `/login` — inconsistent with `Favourites` page's same pattern which also redirects to `/`, so at least those two are internally consistent with each other, just inconsistent with the PRD's stated intent of redirecting to `/login` on auth failure).
- Renders a 3-column grid (hard-coded `grid-cols-3`, not responsive) of cards showing image (via inline `backgroundImage` style, not an `<img>` tag), name, description. **No** Edit/Delete buttons, **no** "Add Recipe" CTA, **no** empty-state message when the array is empty (unlike `Favourites`, which does have an empty-state message) — my-recipes page will just render an empty grid silently with zero recipes.

#### `app/my-recipes/[id]/page.tsx` — **COMPLETELY EMPTY FILE**
Confirmed via direct read: the tool returned an empty string. Zero bytes/content, not even a stub component. This route will hard-fail Next.js's build (a page file with no default export is invalid). **Must be written from scratch** per PRD §4.5.2 / tasks.md M3.

#### `app/favourites/page.tsx` — **functional, most polished of the CRUD-adjacent pages**
- `"use client"`. Fetches `GET /user/favourites` via `apiClient` (no manual header needed — correctly relies on the interceptor, unlike `my-recipes/page.tsx`).
- On 401: clears `token`/`userName`, redirects to `/` (same "redirects home not to login" pattern noted above).
- Local `Recipe` type here includes `brief?` AND `description?` and correctly renders `fav.brief || fav.description` — this is the **correct** pattern that `components/recipes/page.tsx`'s `RecipeList` does NOT follow (that one only shows `description`, which is the bug called out in PRD §4.2/Design §6.6).
- `removeFavourite(id)`: `apiClient.delete(\`/user/favourites/${id}\`)`, updates local state by filtering out the removed id, logs errors to console only (no user-facing error feedback on failed removal).
- Renders: `Navbar`, an empty decorative orange hero-strip `<section>` (no content inside it — just a colored bar, seemingly a leftover/placeholder), then conditionally Loader text / EmptyState text / the grid. Grid: same non-responsive `grid-cols-3`, each card has a heart icon button (always filled `HiHeart` since everything shown is, by definition, a favourite) that calls `removeFavourite`.

#### `app/profile/page.tsx` — **read-only view only**
- `"use client"`. Fetches `GET /user/me` via `apiClient` (no explicit 401 handling/redirect here — unlike other protected pages, a 401 here would just leave `user` as `null` and show "User not found," not redirect anywhere).
- Renders (if user loaded): optional `<img>` avatar (only if `user.image` truthy — correctly handles the nullable field), name, email, uppercase role tag. **No edit affordances of any kind** — no edit-name button, no change-password form, no delete-account button. Entirely read-only today.
- Local `User` type: `{ _id, name, email, role, image?: string | null }`.

#### `app/contact/page.tsx` — **fully static, no backend interaction (correctly, since no endpoint exists)**
- `"use client"` but imports `FormEvent`, `useState` and **never uses them** (dead imports — confirmed no `useState(...)` call or `FormEvent` type usage anywhere in the actual render, just the two unused imports at the top). No `<form>` element exists in the JSX at all.
- Purely presentational: orange hero section with an icon, heading "We'd Love to Hear From You!", subtext; a contact-methods row with a `tel:` link (phone: 01004435342) and what's supposed to be a `mailto:` link but the `href` is literally just the bare email address string `"moahmedsoliman12571@gmail.com"` **without the `mailto:` prefix** — clicking it will attempt to navigate the browser to that as a URL/search query, not open a mail client. This is a small real bug (missing `mailto:` scheme).

### 3.4 Component-by-Component Current Implementation State

#### `components/navbar/page.tsx` — **functional, most complex component**
- `"use client"`. Reads `pathname` via `usePathname()` for active-link styling (border+color pill on the matching link).
- `useState<string|null>` for `userName`, hydrated in a `useEffect` from `localStorage.getItem("userName")` on mount (client-only, avoids SSR mismatch).
- `handleLogout()`: fires `axios.post(\`${API_URL}/api/logout\`, {refreshToken: localStorage.getItem("refreshToken")})` (raw axios again, not `apiClient` — consistent with Login's pattern of bypassing the shared client for auth-adjacent calls) with a `.catch(()=>{})` swallowing any error (logout always "succeeds" client-side regardless of server response), then clears `token`/`refreshToken`/`userName` from localStorage, resets local `userName` state to `null`, and `router.push("/")`.
- `PROTECTED_ROUTES = ["/favourites", "/my-recipes"]` — note `/profile` and `/create-recipe` are **NOT** in this list, so clicking those nav links currently does **not** pre-emptively redirect unauthenticated users the way Favourites/My-Recipes links do (inconsistent coverage; Profile and Create-Recipe aren't even in the main nav's rendered links today anyway — only Home/Favourites/My Recipes/Contact are rendered as top-level `Link`s, with Profile only reachable via the user dropdown when already logged in, and Create-Recipe not linked from the Navbar at all currently).
- `handleNavClick(e, href)`: for links in `PROTECTED_ROUTES`, if no `token` in localStorage, `preventDefault()` and `router.push("/login")` instead of navigating — this is the **only** existing route-protection mechanism in the entire frontend, and it only fires on a Navbar link click, not on direct URL entry/refresh/back-button (exactly the gap tasks.md M5 addresses).
- Renders: logo image (external URL from pngtree, not a local asset), then a flex row of `Link`s (Home, Favourites, My Recipes, Contact — always rendered regardless of auth state, relying solely on the click-guard for protection), then conditionally: if `userName` truthy, a button toggling a dropdown (`menuOpen` state) with "Profile" link and "Logout" button; else a "Login" `Link` styled as a solid button.
- **No mobile/responsive menu** — the flex row of links has no hamburger/collapse behavior at any breakpoint; on narrow viewports this will overflow/wrap awkwardly.

#### `components/footer/page.tsx` — **static, done**
Two-part layout: top row with logo image + "Recipe" wordmark (a commented-out nav-links block exists but is dead/unused), bottom bar with a dynamic copyright year (`{new Date().getFullYear()}`). No functional gaps — purely cosmetic component, matches Design.md §6.2 exactly already.

#### `components/hero/page.tsx` — **purely decorative, no content**
A `<section>` containing only a full-viewport-height (`h-screen`) `<div>` with an inline animated SVG (two overlapping wave paths in orange tones with `transition` classes suggesting some intended hover/scroll interaction, though no JS drives any state change — the transition classes are inert without a state trigger). **Zero text content** — no headline, no subheading, no CTA buttons, nothing. This is the gap Design.md §7.1/PRD §4.2 call out for adding real hero copy + CTAs.

#### `components/recipes/page.tsx` — **the public recipe list (`RecipeList` component), functional but has the field bug**
- Top half of the file (~54 lines) is a **fully commented-out earlier version** of the same component — dead code, safe to delete entirely.
- Live component `RecipeList` (default export): `"use client"`.
  - Fetches `GET /api/recipe` via **raw `axios`** + `API_URL` (not `apiClient` — though this endpoint is public/no-auth so it doesn't strictly need the interceptor, using `apiClient` would still be more consistent).
  - If `localStorage.getItem("token")` exists, additionally fetches `GET /user/favourites` via `apiClient` to build a `Set<string>` of favourited recipe IDs (silently swallows errors with empty `.catch(() => {})`).
  - `toggleFavourite(id)`: checks membership in `favouriteIds` set, calls `apiClient.delete` or `apiClient.post` on `/user/favourites/${id}` accordingly, updates the local Set on success, `console.error`s on failure (no user-facing feedback).
  - Local `Recipe` type here is `{ _id, name, description, image }` — **missing `brief` entirely** from the type, which is why the render shows `recipe?.description` on the card instead of `recipe?.brief` — this is the concrete bug referenced throughout PRD/Design (§4.2, §6.6, §13). Fixing it requires both adding `brief` to this local type AND changing the JSX to prefer it.
  - Grid: same non-responsive hard-coded `grid-cols-3` pattern as My-Recipes/Favourites. Each card: `div` with inline `backgroundImage` (not `<img>`, so no `alt` text / accessibility fallback / `onError` handling possible in its current form), name (H2), description-shown-instead-of-brief (P), and a heart-icon toggle button (filled/outline based on `favouriteIds.has(...)`). **Cards are not wrapped in a `Link`** — clicking a card does nothing (no navigation to any detail page), since no recipe detail route/page exists yet at all in the frontend.

### 3.5 Confirmed Cross-Cutting Bugs/Gaps (deduplicated, exact locations)

**Status note (post-M2/M3/M4):** items 1, 2, 4, 5, 8, 9, 11 (for `RecipeList`/`Favourites`/`MyRecipes` specifically), 16, and 17 below are now **fixed** — see the "Built in M2/M3/M4" subsection of §6 for exactly what replaced each one. Item 6 (Profile edit capability) is also now fixed. Items left as-is (3, 7, 10, 12, 13 partially, 14 partially, 15, 18, 19, 20) remain accurate and are explicitly M1/M5/M6 scope or already resolved in M1 — check each line below for its current status.

1. ~~**Field bug:** `components/recipes/page.tsx` shows `description` instead of `brief`~~ — **FIXED (M2).** Now shows `recipe.brief` via the shared `RecipeCard` component.
2. ~~**No recipe detail route exists**~~ — **FIXED (M2).** `app/recipes/[id]/page.tsx` now exists and is fully functional.
3. **`app/register/page.tsx`** — **FIXED (M1)**, see §6 M1 notes above (this line predates the M1 pass and was already stale before this session).
4. ~~**`app/create-recipe/page.tsx`** is 100% commented out~~ — **FIXED (M3).** Full form now exists.
5. ~~**`app/my-recipes/[id]/page.tsx`** is a literally empty file~~ — **FIXED (M3).** Full edit page now exists.
6. ~~**`app/profile/page.tsx`** has zero edit capability~~ — **FIXED (M4).** Edit name, change password, delete account all implemented.
7. **Login and Navbar's logout use raw `axios`** — **FIXED (M1)**, see §6 M1 notes above (this line predates the M1 pass).
8. ~~**`app/my-recipes/page.tsx`** manually re-attaches an `Authorization` header~~ — **FIXED (M3).** Removed; now relies solely on `apiClient`'s interceptor via `useRequireAuth()`.
9. ~~**`app/my-recipes/page.tsx`** and **`app/favourites/page.tsx`** redirect to `/` (not `/login`) on a 401~~ — **FIXED (M2/M3).** Both pages now use `useRequireAuth()`, which redirects to `/login` before any fetch is attempted (rather than reactively after a 401).
10. **No page has direct-URL/refresh/back-button route protection** — **STILL OPEN, explicitly M5 scope.** `useRequireAuth()` is now called from `/create-recipe`, `/my-recipes`, `/my-recipes/[id]`, and `/favourites` (added incrementally in M2/M3 as those pages were rewritten) — `/profile` still does **not** call `useRequireAuth()` as of the end of M4 (its testing checklist didn't require it — M4 was scoped to the account-management features, not protecting the route itself). Applying `useRequireAuth()` to `/profile` (and double-checking all five target pages together) remains M5's job.
11. **No responsive grid** — **PARTIALLY FIXED.** `RecipeCard`'s consuming grids (`components/recipes/page.tsx`, `app/favourites/page.tsx`, `app/my-recipes/page.tsx`) now use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (M2/M3). Not audited further outside these three grids.
12. **`app/contact/page.tsx`**: dead unused imports; missing `mailto:` scheme — **STILL OPEN, explicitly M6 scope.** Not touched in M2/M3/M4 (out of scope).
13. **No shared TypeScript types** — **FIXED for M0's original scope** (see M0 notes) and now also true for every M2/M3/M4-touched file: `RecipeCard`, `RecipeForm`, `app/recipes/[id]/page.tsx`, `app/my-recipes/[id]/page.tsx`, `app/create-recipe/page.tsx`, `app/profile/page.tsx` all import `Recipe`/`User`/`ApiResponse` from `types/*.ts` rather than redeclaring local types.
14. **No `AuthContext`/shared auth state** — **FIXED for all M1/M2/M3/M4-touched files.** `app/profile/page.tsx` still does its own local `useState<User|null>` fetch of `GET /user/me` (rather than reading `AuthContext.user`) because it needs the freshest server copy for display, but correctly also calls `useAuth().updateUser()` on name changes and `useAuth().logout()` on password-change/delete-account so `Navbar`/other consumers stay in sync.
15. **`app/layout.tsx`** still has the default "Create Next App" metadata title/description — **STILL OPEN, explicitly M6 scope.** Not touched in M2/M3/M4.
16. ~~**`components/hero/page.tsx`** has zero textual content~~ — **FIXED (M2).** Real headline/subhead/CTAs added.
17. ~~**`components/recipes/page.tsx`** has ~54 lines of dead commented-out code~~ — **FIXED (M2).** File was fully rewritten; no dead code remains.
18. **`app/my-recipes/page.tsx`**'s component function naming — **FIXED (M3)** incidentally: the rewritten file's component is now named `MyRecipes` (PascalCase).
19. **`components/navbar/page.tsx`**: no mobile/responsive collapse menu; `PROTECTED_ROUTES` list is incomplete — **STILL OPEN, explicitly M6 (mobile menu) and M5 (protected-routes list correctness alongside `useRequireAuth()` rollout) scope.** Not touched in M2/M3/M4.
20. **`frontend/src/lib/api.ts`**'s fallback `API_URL` default mismatch — **STILL OPEN**, low-priority, not in any milestone's explicit scope; relies on `.env`/`.env.local` being set correctly in practice (confirmed both are set correctly in this project's actual `.env` files as of this session).

---

## 4. Relationship Between the Companion Docs and This File

- **This file (`memory.md`)** = pure factual record of exact current code state, exact API contracts, exact bugs. Update this file's relevant section whenever a bug listed in §3.5 or §2.9 is fixed, or when new code is added that changes any documented behavior.
- **`PRD.md`** = requirements derived from comparing this factual state against desired end-state; organized by feature area with acceptance criteria. Written before `Design.md`/`tasks.md`; still accurate.
- **`Design.md`** = the visual/UX specification for implementing the PRD, strictly bounded by the same backend constraints documented in §2 here (see its own §11 "Backend-Driven Constraints" and §12 "Explicitly Out of Scope," which are consistent with §2.9/§3.5 of this file).
- **`tasks.md`** = the milestone-by-milestone execution plan (M0–M7) turning `PRD.md` + `Design.md` into checklists with paired testing tasks.

**Recommended reading order for a new agent:** this file (`memory.md`) first for ground truth → `PRD.md` for what needs to change and why → `Design.md` for how it should look/behave → `tasks.md` for the concrete step-by-step execution checklist to follow.

---

## 5. Environment Variables Reference

**Backend `.env` requires (actual variable names read by LIVE code — trust this list, not `config/env.ts`'s aspirational/likely-dead validation list):**
- `MONGO_URI` (read by `config/db.ts`'s `connectDB()`. **Not** `MONGODB_URI` — `env.ts` checks for `MONGODB_URI` but that module appears unused/dead; the live `mongoose.connect()` call reads `MONGO_URI`.)
- `PORT` (backend falls back to `5000` in `server.ts` if unset)
- `NODE_ENV` (not observed being read by any live code path other than the likely-dead `env.ts`; harmless to set anyway, e.g. `development`)
- `FRONTEND_URL` (used for CORS origin in `app.ts`, defaults to `http://localhost:4000` if unset — matches frontend's actual dev port)
- `JWT_ACCESS_SECRET` (read by `jwt.ts` for access tokens — NOT `JWT_SECRET`, which is only what the likely-dead `env.ts` checks for)
- `JWT_REFRESH_SECRET` (read by both `jwt.ts` and `env.ts` — this is the one name that's actually consistent between the two)

**Note on `config/env.ts`:** this module's exported `env` object was not found imported anywhere else in the codebase during this audit. Combined with two independently confirmed name mismatches against live code (`MONGODB_URI` vs. actual `MONGO_URI`; `JWT_SECRET` vs. actual `JWT_ACCESS_SECRET`), treat `env.ts` as effectively dead/aspirational documentation of intent, not a reliable source of truth for required env var names. If `env.ts` genuinely is imported somewhere (e.g. via a side-effecting `import "./config/env"` not caught in this audit), its startup validation would throw on a `.env` file missing `MONGODB_URI`/`JWT_SECRET` even though the app doesn't actually need those exact names to function — worth a live runtime check if backend startup ever fails with a "Missing required environment variable" error despite the DB/JWT vars being set under their other names.

**Frontend `.env.local` requires:**
- `NEXT_PUBLIC_API_URL` — should be set to the backend's actual base URL (e.g. `http://localhost:5000`) since the frontend code's fallback default (`http://localhost:3000`) does not match the backend's actual default port (`5000`).

---

## 6. Quick-Reference: What To Build vs. What Already Works

**Already working, don't rebuild from scratch (extend/refactor only):**
- `lib/axios.ts` (apiClient + refresh logic) — do not rewrite, only wrap its localStorage keys inside a future AuthContext.
- `components/navbar/page.tsx` — **refactored in M1**: now reads `user`/`isAuthenticated` from `useAuth()` instead of local `useState` + `localStorage.getItem("userName")`; `handleLogout` now just calls `useAuth().logout()` (which itself fires `POST /api/logout`) + closes the dropdown + navigates home. `PROTECTED_ROUTES` click-guard kept (now checks `isAuthenticated` from context instead of `localStorage.getItem("token")`) as the secondary UX nicety M5 calls for. Still needs: mobile menu (M6), and M5's `useRequireAuth()` adoption on the *target pages* (Navbar's click-guard alone was never sufficient for direct URL entry).
- `components/footer/page.tsx` — done, leave as-is.
- `app/login/page.tsx` — **refactored in M1**: now uses `apiClient.post("/login", ...)` instead of raw `axios` + `API_URL` string concat, calls `useAuth().login(res.data.data)` on success instead of writing `localStorage` directly, uses the shared `Input`/`Button`/`ErrorMessage` components. No client-side validation added here (backend already validates; PRD/tasks.md M1 didn't ask for it on Login, only Register).
- `app/register/page.tsx` — **written from scratch in M1** (previously a 1-line stub). Full form (`name`/`email`/`password`/`confirmPassword`), client-side validation mirroring `CreateUserSchema` (name 2–50, email regex, password 8–100) + confirm-password match, submits via `apiClient.post("/signup", ...)`, calls `useAuth().login(...)` on success (signup returns the same `AuthResponse`-shaped `data` as login — see §2.6's confirmed-live note on the double-`message` quirk), surfaces server errors (e.g. "User already exists") via `ErrorMessage`.
- `app/favourites/page.tsx` — functional, needs minor polish (link cards to detail page, redirect-to-login fix, shared EmptyState/Loader components, M2/M5 scope — NOT touched in M1).
- `app/my-recipes/page.tsx` — functional list, needs Edit/Delete actions + Add-Recipe CTA + redirect fix + remove redundant header (M3/M5 scope — NOT touched in M1; still has its own pre-existing `tsc`/lint errors unrelated to M1, see §6 build-breaking note below).
- `app/profile/page.tsx` — functional view, needs edit-name/change-password/delete-account features added (M4 scope — NOT touched in M1).
- `components/recipes/page.tsx` — functional, needs the brief/description bug fix + card links + search/filter UI + dead-code cleanup (M2 scope — NOT touched in M1).
- `context/AuthContext.tsx` — **extended in M1**: `logout()` now also fires a best-effort `POST /api/logout` with the stored refresh token (fire-and-forget, `.catch(() => {})`) before clearing local state — this was previously only done ad hoc inside `Navbar`'s `handleLogout`; centralizing it here means every future caller of `useAuth().logout()` (M4's delete-account/password-change flows, etc.) gets correct server-side session invalidation for free.

**Must be written from scratch (currently empty/stub/nonexistent):**
- `app/create-recipe/page.tsx` (currently 100% commented out, no live code) — **confirmed via `tsc --noEmit`/`npm run build`: this literally breaks the project-wide type-check today** (`error TS2306: File '.../create-recipe/page.tsx' is not a module`), since a `.tsx` page file under App Router with zero exports isn't a valid module. `npm run build` fails at the type-check step because of this (Turbopack compilation itself still succeeds). This is pre-existing (confirmed via `git stash` before any M0 change, and re-confirmed still present and unchanged after M1), not introduced by M0 or M1, and is explicitly M3 scope to fix.
- `app/my-recipes/[id]/page.tsx` (currently a literally empty file) — **same confirmed build-breaking issue as above** (`error TS2306: ... is not a module`), also pre-existing, also M3 scope.
- `app/recipes/[id]/page.tsx` (does not exist yet — new route/file needed)
- Profile's edit-name/change-password/delete-account forms — don't exist in any form

**Built in M0 (done, ready for later milestones to consume):**
- `types/api.ts`, `types/recipe.ts`, `types/user.ts`, `types/auth.ts` — all created, mirroring the exact backend schemas documented in §2.5/§2.7 above. `Recipe.owner` and `User.role` are typed as plain strings/unions (no populated author objects — see bug #8).
- `context/AuthContext.tsx` — exports `AuthProvider` (mounted in `app/layout.tsx`, wrapping the whole app) and `useAuth()`. Hydrates synchronously from `localStorage` via a lazy `useState` initializer (not a `useEffect`, to avoid an extra render and satisfy `react-hooks/set-state-in-effect` lint rule). Continues to write/read the same `"token"`/`"refreshToken"`/`"userName"` keys `lib/axios.ts` depends on (does not rename them), plus one new key `"user"` (JSON-stringified full `User` object) that only this context reads/writes — needed because `"userName"` alone can't reconstruct `id`/`email`/`role` on reload. `login(auth: AuthResponse)`, `logout()`, `updateUser(partial)` all update React state synchronously (verified manually — see tasks.md M0 testing notes). **Not yet consumed by any existing page/component** — that consumption (refactoring `Navbar`/`Login`/`Register`/`Profile` to call `useAuth()` instead of raw `localStorage`) is M1/M4/M5 work, intentionally deferred.
- `hooks/useRequireAuth.ts` — exports `useRequireAuth()`, redirects to `/login` via `next/navigation`'s `useRouter` when `useAuth().isAuthenticated` is false. Not yet called from any page (that's M3/M5's job — `/create-recipe`, `/my-recipes`, `/my-recipes/[id]`, `/favourites`, `/profile`).
- `components/ui/Button.tsx`, `Input.tsx` (exports `Input`, `Textarea`, `Select`), `Modal.tsx`, `Card.tsx` — all built per Design.md §6.4/§6.5/§6.8/Card token spec. Not yet adopted by any existing page (existing pages still hand-roll their own Tailwind markup) — adoption happens incrementally as each page is touched in later milestones.
- `components/common/Loader.tsx`, `ErrorMessage.tsx`, `EmptyState.tsx`, `Toast.tsx` (exports `ToastProvider` + `useToast()`, mounted in `app/layout.tsx` inside `AuthProvider`) — all built per Design.md §6.9/§6.10/§6.11/§6.12. Not yet adopted by any existing page.
- All M0 files verified lint-clean and introduce zero new `tsc` errors (see tasks.md M0 testing notes for exact verification method — a throwaway `app/m0-preview/page.tsx` was used to manually render every new component and was deleted afterward).

**Built in M5/M6/M7 (done, final project state):**
- `hooks/useRequireAuth.ts` — applied to all 5 protected routes (`/create-recipe`, `/my-recipes`, `/my-recipes/[id]`, `/favourites`, `/profile`), protecting them from unauthorized renders and enforcing redirects to `/login`.
- `components/navbar/page.tsx` — updated `PROTECTED_ROUTES` list to include `/create-recipe` and `/profile` alongside `/favourites` and `/my-recipes`. Added mobile hamburger toggle button (`HiBars3`/`HiXMark`) and responsive slide-down mobile drawer.
- `hooks/useFavourites.ts` — integrated `useToast` to surface success toasts ("Saved to favourites" / "Removed from favourites") and error toasts on toggle.
- `app/layout.tsx` — configured global brand metadata (`title: "Savor — Handcrafted Recipes"` and custom description) and loaded Google Fonts `Playfair_Display` & `Plus_Jakarta_Sans`.
- `app/contact/page.tsx` — cleaned up unused imports (`useState`, `FormEvent`) and added working `tel:` and `mailto:` links.
- `npm run build` & `npm run lint` — verified 100% clean build and zero ESLint errors/warnings.
