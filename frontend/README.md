This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




frontend/
│
├── app/                      # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── login/
│   ├── register/
│   ├── recipes/
│   ├── profile/
│   ├── dashboard/
│   └── ...
│
├── components/
│   ├── ui/                   # Generic reusable UI
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   │
│   ├── layout/               # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── recipe/               # Recipe-specific components
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeList.tsx
│   │   ├── RecipeForm.tsx
│   │   └── RecipeDetails.tsx
│   │
│   └── common/
│       ├── Loader.tsx
│       ├── ErrorMessage.tsx
│       └── EmptyState.tsx
│
├── services/                 # Calls your Express API
│   ├── auth.service.ts
│   ├── recipe.service.ts
│   └── user.service.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useRecipes.ts
│   └── useFetch.ts
│
├── context/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── store/                    # Zustand or Redux (optional)
│
├── lib/
│   ├── axios.ts              # Axios instance
│   ├── fetcher.ts
│   └── utils.ts
│
├── types/
│   ├── recipe.ts
│   ├── user.ts
│   ├── auth.ts
│   └── api.ts
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── public/
│   ├── images/
│   ├── logo.svg
│   └── favicon.ico
│
├── styles/
│   └── globals.css
│
├── middleware.ts             # Next.js middleware
│
├── package.json
├── tsconfig.json
└── next.config.ts