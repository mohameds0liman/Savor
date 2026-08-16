backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.ts
│   │   └── env.ts
│   │
│   ├── controllers/
│   │   ├── recipe.controller.ts
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── models/
│   │   ├── Recipe.ts
│   │   ├── User.ts
│   │   └── Organization.ts
│   │
│   ├── routes/
│   │   ├── recipe.routes.ts
    │   │   ├── auth.routes.ts
    │   │   └── user.routes.ts
    │   │
    │   ├── services/
    │   │   ├── recipe.service.ts
    │   │   ├── auth.service.ts
    │   │   └── user.service.ts
    │   │
    │   ├── middlewares/
    │   │   ├── auth.ts
    │   │   ├── error.ts
    │   │   └── validation.ts
    │   │
    │   ├── utils/
    │   │   ├── jwt.ts
    │   │   ├── logger.ts
    │   │   └── helpers.ts
    │   │
    │   ├── types/
    │   │
    │   ├── app.ts
    │   │
    │   └── server.ts
    │
    ├── uploads/                  # if users upload images
    │
    ├── .env
    ├── package.json
    ├── tsconfig.json
    └── nodemon.json







## request Life cycle

User opens browser.

`GET /recipes`

↓

Server receives request.

↓

Route

`GET /recipes`

↓

Controller

`getRecipes()`

↓

Service

`recipeService.getRecipes()`

↓

Model

`Recipe.find()`

↓

MongoDB

returns recipes

↓

Service

↓

Controller

↓

Browser