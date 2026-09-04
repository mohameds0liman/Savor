// Mirrors backend/src/models/User.ts's returned shape (see memory.md §2.5 / §2.6).
// The JWT payload itself only carries `{ id }` — this richer shape is what's
// returned in login/signup/`GET /api/user/me` response bodies.
export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  image?: string | null;
};
