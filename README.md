# FoodHub Frontend

A complete Next.js (App Router) frontend for the FoodHub meal-ordering platform. Customers browse and order homemade meals, providers manage their menus and orders, and admins oversee the whole platform.

Built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS**, **Better Auth** for authentication, and **Zod** for form validation.

## Features

| Area               | What is included                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Homepage           | Hero, Browse by category, Featured meals, How it works, Why FoodHub, Provider CTA + Navbar & Footer                          |
| Auth               | Register (Customer / Provider role picker), Login, session handling via Better Auth cookies                                  |
| Meals              | Meal listing with search, category filter and sorting; meal detail with reviews & ratings                                    |
| Cart & Checkout    | LocalStorage cart, quantity controls, checkout with address & contact validation                                             |
| Customer dashboard | Profile overview, order stats, order history                                                                                 |
| Provider dashboard | Overview stats, meal CRUD (create / edit / delete), incoming orders with status updates, profile editing                     |
| Admin dashboard    | Platform stats, user management (block / activate), category management (create / rename), all orders                        |
| Error handling     | Zod-validated forms with field errors, API error surfaces, loading skeletons/spinners, empty states, retry buttons, 404 page |
| UX                 | Fully responsive (mobile menu, responsive grids/tables), consistent design system, toast notifications                       |

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   The defaults already work out of the box:

   ```
   NEXT_PUBLIC_API_URL=/backend-api
   BACKEND_URL=https://foodhub-backend-5.onrender.com
   ```

   API calls are sent to the same-origin path `/backend-api`, which the
   Next.js server proxies to `BACKEND_URL` (see `next.config.mjs`). This
   keeps the Better Auth session cookie first-party so login persists in
   modern browsers that block cross-site cookies.

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Production build**

   ```bash
   npm run build && npm start
   ```

> Note: the backend is hosted on Render's free tier — the first request after a period of inactivity can take up to a minute while the server wakes up.

## Roles & routes

| Role                  | Routes                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Guest                 | `/`, `/meals`, `/meals/[id]`, `/cart`, `/login`, `/register`                                                                |
| Customer (`USER`)     | `/checkout`, `/dashboard`, `/dashboard/orders`                                                                              |
| Provider (`PROVIDER`) | `/provider`, `/provider/meals`, `/provider/meals/new`, `/provider/meals/[id]/edit`, `/provider/orders`, `/provider/profile` |
| Admin (`ADMIN`)       | `/admin`, `/admin/users`, `/admin/categories`, `/admin/orders`                                                              |

Route access is enforced client-side with a `RequireAuth` guard (session check, login redirect, and role-based access denial).

## Project structure

```
src/
  app/            # App Router pages (public, dashboard, provider, admin)
  components/     # Reusable UI (navbar, footer, cards, forms, guards, shell)
  lib/            # API client, auth client/context, cart context, toasts,
                  # zod validators, shared types & utils
```

## API integration

All requests go to `NEXT_PUBLIC_API_URL` (a same-origin proxy path rewritten to the backend by Next.js) with `credentials: "include"`, so Better Auth session cookies are first-party and sent automatically.

Endpoints used: Better Auth sign-up/sign-in, `/me`, `/meals` (list/detail/create/update/delete), `/reviews`, `/orders` (create/list), `/provider` (info, order status updates, profile), and `/admin` (stats, users, categories, orders).

## Tech decisions

- **Better Auth** (`better-auth/react` client) for email/password auth with custom `role` and `phone` fields.
- **Zod** schemas for every form (register, login, checkout, meal create/edit, review, category, profile) with inline field errors.
- **Tailwind CSS** design system with a warm brand palette, consistent cards, badges, buttons, and accessible touch targets.
- **Resilient API layer** that unwraps varying response envelopes (`data`, `result`, etc.) and surfaces readable error messages.
