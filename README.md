# 🍽️ Savor — Handcrafted Recipes

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<p align="center">
  <strong>A modern, full-stack culinary platform crafted for passionate home cooks, gastronomic storytellers, and community chefs.</strong>
</p>

[Key Features](#-key-features) •
[Tech Stack](#-tech-stack) •
[Architecture](#-project-architecture) •
[API Reference](#-api-reference) •
[Getting Started](#-getting-started) •
[Docker Deployment](#-docker-deployment)

</div>

---

## ✨ Key Features

### 📖 Recipe Discovery & Exploration
- **Real-Time Filtering & Search:** Search instantly across recipe titles, descriptions, and tags. Filter seamlessly by category (*Breakfast, Lunch, Dinner, Dessert, etc.*) and difficulty (*Easy, Medium, Hard*).
- **Multi-Criteria Sorting:** Sort recipes dynamically by **Newest**, **Most Popular** (views), **Highest Rated**, or **Shortest Cooking Time**.
- **Interactive Cooking Checklist:** Tap-to-check ingredients checklist designed for stress-free kitchen counter meal prep.
- **View Tracking:** Real-time view count tracking incremented on every visit.

### 👨‍🍳 Chef Attribution & Profile Management
- **Recipe Author Attribution:** Populated author profiles with avatars and names on every recipe card and detail page.
- **Custom Chef Profiles:** Update display names and set custom avatar image URLs with real-time propagation across Navbar and profile views.
- **Account Security:** In-app password changes with automatic multi-device session invalidation and account deletion controls.

### ⭐ Community Ratings & Favorites
- **Interactive 5-Star Ratings:** Dedicated rating endpoint allowing logged-in community members to rate recipes with weighted average score updates.
- **Personal Recipe Box (Favourites):** Heart recipes to save them directly to your personal cookbook with instant synchronization.

### 🖨️ Social Sharing & Kitchen Print Mode
- **One-Click Sharing:** Native device Web Share API integration with automatic fallback to clipboard URL copying.
- **Printer-Friendly Mode:** Dedicated print styling to easily generate clean, paper-friendly recipe sheets without UI clutter.

### 🔐 Robust Security & Architecture
- **Dual-Token Authentication:** Short-lived JWT access tokens paired with MongoDB-backed hashed refresh token sessions.
- **Single-Flight Axios Interceptor:** Handles token refresh deduplication transparently in the background on HTTP 401 responses.
- **Layered Validation:** End-to-end data integrity powered by Zod schemas and Mongoose models.
- **API Guardrails:** Rate limiting against brute-force attempts and Helmet HTTP header security.

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Description |
|---|---|
| **[Next.js 16](https://nextjs.org/)** | React Framework using App Router & Turbopack |
| **[React 19](https://react.dev/)** | Modern concurrent UI library with Hooks & Context |
| **[TypeScript](https://www.typescriptlang.org/)** | Strict type safety across components and API models |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Warm Culinary Editorial design token system |
| **[Axios](https://axios-http.com/)** | HTTP client with automatic token-refresh interceptors |
| **[React Icons](https://react-icons.github.io/react-icons/)** | Heroicons v2 iconography suite |

### **Backend**
| Technology | Description |
|---|---|
| **[Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)** | High-performance RESTful API backend |
| **[TypeScript](https://www.typescriptlang.org/)** | Type-safe controllers, services, and middlewares |
| **[MongoDB](https://www.mongodb.com/) & [Mongoose 9](https://mongoosejs.com/)** | Document database with relational population |
| **[Zod](https://zod.dev/)** | Runtime schema validation for requests and DTOs |
| **[JSON Web Tokens (JWT)](https://jwt.io/)** | Stateless authorization with access and refresh tokens |
| **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** | Salted password hashing |
| **[express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)** | Brute-force and DDoS protection middleware |

---

## 📁 Project Architecture

```
Savor/
├── docker-compose.yml          # Multi-container orchestration (frontend + backend)
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection (Atlas DNS & Mongoose)
│   │   ├── controllers/        # Express route controllers
│   │   ├── middlewares/        # Auth, Zod validation, and security middlewares
│   │   ├── models/             # Mongoose schemas (Recipe, User, Session)
│   │   ├── routes/             # Express route declarations (/api/*)
│   │   ├── services/           # Database queries & business logic
│   │   ├── types/              # Express request augmentations
│   │   ├── utils/              # JWT & cryptographic hashing helpers
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server bootstrap & entry point
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── public/                 # Static branding assets & logos
    ├── src/
    │   ├── app/                # Next.js App Router pages
    │   │   ├── create-recipe/  # Recipe creation form
    │   │   ├── favourites/     # User saved recipes
    │   │   ├── login/          # Login authentication
    │   │   ├── my-recipes/     # Author recipe dashboard & edit [id]
    │   │   ├── profile/        # Chef settings & profile picture
    │   │   ├── recipes/[id]/   # Public recipe detail view
    │   │   └── register/       # User sign up
    │   ├── components/         # Shared UI kit, navigation, cards & modals
    │   ├── context/            # AuthContext & ToastContext providers
    │   ├── hooks/              # Custom hooks (useRecipes, useFavourites, etc.)
    │   ├── lib/                # Configured Axios instance with interceptors
    │   └── types/              # TypeScript interfaces (Recipe, User, Auth, API)
    ├── Dockerfile
    └── package.json
```

---

## 📡 API Reference

All backend routes are mounted under `/api`:

### 🔐 Authentication & Session
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/signup` | No | Register a new chef account |
| `POST` | `/api/login` | No | Log in and receive access & refresh tokens |
| `POST` | `/api/refresh` | No | Exchange refresh token for a new access token |
| `POST` | `/api/logout` | No | Invalidate current user session |

### 🍳 Recipes
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/recipe` | No | Retrieve all recipes (populated with owner details) |
| `GET` | `/api/recipe/:id` | No | Get single recipe details & automatically increment views |
| `GET` | `/api/recipe/my` | Yes | Get all recipes created by the authenticated user |
| `POST` | `/api/recipe` | Yes | Publish a new recipe |
| `PATCH` | `/api/recipe/:id` | Yes (Owner) | Update recipe details (title, times, ingredients, etc.) |
| `DELETE` | `/api/recipe/:id` | Yes (Owner) | Delete recipe permanently |
| `POST` | `/api/recipe/:id/rate` | Yes | Submit a 1–5 star rating for a recipe |

### 👤 User & Favorites
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/user/me` | Yes | Fetch authenticated user profile |
| `PATCH` | `/api/user` | Yes | Update profile name and/or avatar image URL |
| `PUT` | `/api/user/password` | Yes | Change password (invalidates all active sessions) |
| `DELETE` | `/api/user` | Yes | Delete account and all associated data |
| `GET` | `/api/user/favourites` | Yes | Get populated list of favorited recipes |
| `POST` | `/api/user/favourites/:id` | Yes | Add a recipe to favorites |
| `DELETE` | `/api/user/favourites/:id` | Yes | Remove a recipe from favorites |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas connection URI)

---

### 1. Clone the Repository
```bash
git clone https://github.com/mohameds0liman/Savor.git
cd Savor
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in `backend/`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_characters
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_characters
   FRONTEND_URL=http://localhost:4000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend will be running at `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in `frontend/`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:4000`.*

---

## 🐳 Docker Deployment

Run the entire full-stack application effortlessly using Docker Compose:

1. Ensure Docker Desktop is installed and running.
2. Verify your backend `.env` configuration file is in `backend/.env`.
3. From the project root, run:
   ```bash
   docker compose up --build
   ```
4. Access the services:
   - **Frontend:** [http://localhost:4000](http://localhost:4000)
   - **Backend API:** [http://localhost:3000](http://localhost:3000)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

<div align="center">
  <sub>Crafted with passion for the culinary arts. © Savor.</sub>
</div>
