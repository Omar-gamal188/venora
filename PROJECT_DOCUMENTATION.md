# Venora E-commerce — Developer Documentation

> This document is generated from the repository code currently present in `my-app/` (React/Vite frontend) and `server/` (Express/MongoDB backend).

---

## 1) Project Overview

This project implements a small e-commerce web application with:

- **Frontend (`my-app/`)**
  - React + Vite SPA
  - Product browsing (filtering/search + pagination)
  - Cart stored in `localStorage`
  - Authentication (JWT) stored in `localStorage`
  - Admin-only **dashboard** where the admin can add/update/delete products and toggle stock

- **Backend (`server/`)**
  - Express REST API
  - MongoDB persistence via **Mongoose**
  - User authentication (register/login/me) using **JWT**
  - Product CRUD endpoints
  - Optional one-shot admin seeding scripts

The frontend calls the backend using `VITE_API_URL` (or defaults to `http://localhost:5000`).

---

## 2) Folder Structure

### Repository root

- `my-app/` — React + Vite frontend
- `server/` — Express + MongoDB backend

### Frontend: `my-app/`

- `index.html`
- `vite.config.js`
- `src/`
  - `App.jsx` — routes + top-level layout
  - `main.jsx` — provider wiring
  - `config/api.js` — API base URL resolution
  - `Context/`
    - `AuthContext.jsx` — JWT session + `/api/auth/me`, login/register
    - `DataContext.jsx` — fetches `/api/products` (fallback to FakeStore)
    - `CartContext.jsx` — cart in local state + `localStorage`
    - `OrderContext.jsx` — orders in local state + `localStorage`
  - `Component/` — UI building blocks (nav, filters, product card, etc.)
    - `ProtectedRoute.jsx` — route guards by auth role
  - `pages/` — page-level views
    - `Home.jsx`, `Products.jsx`, `SinglePages.jsx`, `Cart.jsx`, `Login.jsx`
    - `Dashboard.jsx` — admin product management
    - `Order.jsx`, `OrdersForCustomr.jsx`

### Backend: `server/`

- `package.json`
- `src/`
  - `index.js` — Express app bootstrap + route mounting + health endpoint
  - `config/`
    - `db.js` — MongoDB connection
  - `middleware/`
    - `auth.js` — JWT verification middleware
  - `lib/`
    - `authHelpers.js` — helper utilities for admin usernames & user lookup
  - `models/`
    - `User.js` — user schema (username/email/passwordHash/role)
    - `Product.js` — product schema
  - `routes/`
    - `auth.js` — register/login/me
    - `products.js` — product CRUD endpoints
  - One-shot scripts:
    - `seedDashboardAdmin.js`
    - `resetAdminPassword.js`
    - `promoteUser.js`
    - `addAdminTarek.js`

---

## 3) Backend Architecture (Express + Mongoose)

### 3.1 App bootstrap (`server/src/index.js`)

Responsibilities:

- Enables CORS
- Parses JSON/urlencoded bodies (supports large payloads via `JSON_BODY_LIMIT`, default `50mb`)
- Exposes `GET /health` for health checking
- Mounts routers:
  - `app.use('/api/auth', authRouter)`
  - `app.use('/api/products', productsRouter)`
- Connects to MongoDB via `connectDb(MONGODB_URI)`
- Optionally seeds an admin user on startup:
  - `seedDashboardAdminIfEnabled()`
- Starts listening on `PORT` (default `5000`)

### 3.2 Database connection (`server/src/config/db.js`)

- Uses `mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 })`
- Sets `mongoose.set('strictQuery', true)`

### 3.3 Authentication model

- JWT is signed using `JWT_SECRET` (default `dev-only-change-me`).
- `signToken(userId, role)` signs payload:
  - `sub: userId`
  - `role`
- Token expiration:
  - `process.env.JWT_EXPIRES_IN` or `7d`

### 3.4 Authorization middleware (`server/src/middleware/auth.js`)

- Expects header: `Authorization: Bearer <token>`
- Verifies token with `JWT_SECRET`
- On success:
  - sets `req.userId = payload.sub`
  - sets `req.userRole = payload.role || 'user'`

### 3.5 Admin role resolution (`server/src/lib/authHelpers.js`)

Admin determination logic used when preparing `GET /api/auth/me` response:

- If `user.role === 'admin'` → admin
- Else, if the username is included in admin username set from env:
  - `DASHBOARD_ADMIN_USERNAME` (default `venora`)
  - plus `DASHBOARD_ADMIN_USERNAMES` (comma-separated)

### 3.6 Data model

#### `User` (`server/src/models/User.js`)

Fields:

- `username` (unique, required)
- `email` (unique, required, lowercased)
- `fullName` (required)
- `phone` (optional)
- `address` (optional)
- `passwordHash` (required)
- `role`: `"user" | "admin"` (default `user`)

Notes:

- `toJSON` transform removes `_id`, `passwordHash`, and `__v`, and adds `id`.

#### `Product` (`server/src/models/Product.js`)

Fields:

- `title` (required)
- `price` (required, min 0)
- `description` (default `""`)
- `category` (required)
- `image` (required) — stored as string (URL or data URL)
- `inStock` (default `true`)

Notes:

- `toJSON` transform maps `_id` to `id` and removes `__v`.

---

## 4) Backend Workflow

### 4.1 Register

1. `POST /api/auth/register`
2. Validates required fields: `username`, `password`, `email`, `fullName`
3. Requires password length >= 6
4. Enforces uniqueness for username and email
5. Reserves configured admin usernames (403)
6. Hashes password (bcrypt rounds = 10)
7. Creates user with `role: "user"`
8. Returns:
   - `token`
   - `user` (with role resolved)

### 4.2 Login

1. `POST /api/auth/login`
2. Finds user by username (case-insensitive exact match via regex)
3. Verifies password with bcrypt
4. Returns token + user info

### 4.3 Authenticated “me”

1. `GET /api/auth/me` requires Bearer token
2. Loads `User` by `req.userId`
3. Returns normalized user response with computed role

### 4.4 Product CRUD

- `GET /api/products` returns list ordered by `createdAt desc`
- `GET /api/products/:id` returns one product by Mongo `_id`
- `POST /api/products` creates a product
  - validates required: `title`, `price`, `category`, `image`
- `PATCH /api/products/:id` updates allowed fields (`inStock`, `title`, `price`, `category`, `image`, `description`)
- `DELETE /api/products/:id` deletes a product

---

## 5) Backend API Reference

### Base URL

- `http://localhost:5000` by default

### Health

#### `GET /health`

- Response: `{ "ok": true }`

### Auth

#### `POST /api/auth/register`

Request body:

```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string | optional",
  "address": "string | optional"
}
```

Responses:

- `201`:

```json
{
  "message": "registered",
  "token": "JWT",
  "user": {
    "id": "...",
    "username": "...",
    "email": "...",
    "fullName": "...",
    "phone": "...",
    "address": "...",
    "role": "user|admin",
    "createdAt": "..."
  }
}
```

- `400/401/403/409/500` with `{ "message": "..." }`

#### `POST /api/auth/login`

Request body:

```json
{ "username": "string", "password": "string" }
```

Success `200`:

```json
{
  "message": "ok",
  "token": "JWT",
  "user": {
    "id": "...",
    "username": "...",
    "email": "...",
    "fullName": "...",
    "phone": "...",
    "address": "...",
    "role": "user|admin",
    "createdAt": "..."
  }
}
```

#### `GET /api/auth/me`

Headers:

- `Authorization: Bearer <token>`

Success `200`:

```json
{
  "user": {
    "id": "...",
    "username": "...",
    "email": "...",
    "fullName": "...",
    "phone": "...",
    "address": "...",
    "role": "user|admin",
    "createdAt": "..."
  }
}
```

### Products

#### `GET /api/products`

Success `200` (array):

```json
[
  {
    "id": "...",
    "title": "...",
    "price": 99,
    "description": "...",
    "category": "...",
    "image": "...",
    "inStock": true
  }
]
```

#### `GET /api/products/:id`

- `404` if not found

#### `POST /api/products`

Request body:

```json
{
  "title": "string",
  "price": 12.5,
  "category": "string",
  "image": "string (URL or data URL)",
  "description": "string (optional)",
  "inStock": true
}
```

Success `201`: returns created product JSON.

#### `PATCH /api/products/:id`

Request body: any subset of allowed fields.
Success returns updated product with normalized `inStock`.

#### `DELETE /api/products/:id`

- Success `204` (empty body)

---

## 6) Frontend Architecture (React Router + Context)

### 6.1 Routing (`my-app/src/App.jsx`)

Uses `react-router-dom` (HashRouter in `main.jsx`). Routes:

- `/` → `Home`
- `/products` → `Products`
- `/products/:id` → `SinglePages`
- `/about` → `About`
- `/contact` → `Contact`
- `/cart` → `Cart`
- `/login` → `Login`
- `/Order` → `Order`
- `/OrdersForCustomr` → `OrdersForCustomr`
- `/new-user` → `NewUserRoute` guard wraps `NewUser`
- `/dashboard` → `AdminRoute` guard wraps `Dashboard`

Additionally, `App.jsx` requests geolocation on mount, reverse-geocodes with OpenStreetMap Nominatim, and passes `location` into `NavBar`.

### 6.2 Provider wiring (`my-app/src/main.jsx`)

Order of providers:

- `DataProvider`
- `OrderProvider`
- `CartProvider`
- `AuthProvider`
- `HashRouter`

### 6.3 Auth session (`my-app/src/Context/AuthContext.jsx`)

- Stores token in localStorage key: `venora_auth_token`
- On startup:
  - loads token
  - calls `GET ${API_BASE}/api/auth/me`
  - sets `user` and `ready`
- Exposes methods:
  - `login(username, password)` → calls `/api/auth/login`
  - `register(payload)` → calls `/api/auth/register`
  - `logout()`

Admin role correction on client:

- Client checks admin usernames via env vars:
  - `VITE_DASHBOARD_ADMIN_USERNAME` (default `omargamal404`)
  - `VITE_DASHBOARD_ADMIN_USERNAMES` (comma-separated)
- If username matches, it forces role to `admin` in the UI.

### 6.4 Product data (`my-app/src/Context/DataContext.jsx`)

- `FetchingAllProducts()`:
  - `GET ${API_BASE}/api/products`
  - if it fails, falls back to `https://fakestoreapi.com/products`
- Also computes:
  - `categoryOnlyData` (unique categories)

### 6.5 Cart (`my-app/src/Context/CartContext.jsx`)

- Initializes from localStorage key `cartItem`.
- `addToCart(product)`:
  - increments quantity if product already exists
  - else pushes new item with quantity 1
- `updateQuantity(productId, action)` where action is `increase|decrease`
- `clearCart()`

### 6.6 Orders (`my-app/src/Context/OrderContext.jsx`)

- Orders stored in `localStorage` key `orders`
- Exposes:
  - `addOrder(NewOrder)`
  - `delOrder(id)`
  - `UpdateOrderStatus(id, status)`

### 6.7 Route guards (`my-app/src/Component/ProtectedRoute.jsx`)

- `ProtectedRoute`: any signed-in user
- `AdminRoute`: only admin user; redirects non-admin to `/new-user`
- `NewUserRoute`: signed-in non-admin; redirects admin to `/dashboard`

---

## 7) Frontend Workflow

### 7.1 Browse products

1. Open `/products`
2. `Products.jsx` calls `FetchingAllProducts()` on mount
3. UI filters by:
   - search text (title contains)
   - category
   - price range
4. Pagination displays 8 products per page

### 7.2 Authentication

1. Open `/login`
2. Choose login or register
3. On login/register success:
   - token saved to localStorage
   - navigate based on role:
     - admin → `/dashboard`
     - user → `/new-user`

### 7.3 Admin dashboard product management

1. Open `/dashboard` (guarded by `AdminRoute`)
2. Dashboard uses `DataContext` to list products
3. Admin can:
   - add product:
     - supports image upload
     - compresses image client-side to JPEG data URL (`compressImageFile()`)
     - or use an image URL
   - toggle stock via `PATCH /api/products/:id`
   - delete via `DELETE /api/products/:id`

---

## 8) Installation & Setup

### 8.1 Prerequisites

- Node.js (LTS recommended)
- MongoDB (local or remote)

### 8.2 Backend setup (`server/`)

1. Install dependencies:

```bash
cd server
npm install
```

2. Configure environment variables (create `.env` in `server/`), examples:

- `PORT=5000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce`
- `JWT_SECRET=your-secret`
- `JWT_EXPIRES_IN=7d`
- Optional admin seeding:
  - `SEED_DASHBOARD_ADMIN=true`
  - `DASHBOARD_ADMIN_USERNAME=venora` (or your preferred username)
  - `DASHBOARD_ADMIN_PASSWORD=2112`
  - `UPDATE_EXISTING_ADMIN_PASSWORD=true`

3. Run API (development):

```bash
npm run dev
```

Available server scripts:

- `npm run admin:reset`
- `npm run admin:promote -- <username>`
- `npm run admin:add-tarek`

### 8.3 Frontend setup (`my-app/`)

1. Install dependencies:

```bash
cd my-app
npm install
```

2. Configure environment variables (create `.env` in `my-app/`), examples:

- `VITE_API_URL=http://localhost:5000`
- `VITE_DASHBOARD_ADMIN_USERNAME=omargamal404`
- `VITE_DASHBOARD_ADMIN_USERNAMES=comma,separated,admin,usernames`

3. Run frontend:

```bash
npm run dev
```

---

## 9) Dependencies

### Frontend (`my-app/package.json`)

- React 19
- React Router
- Axios
- TailwindCSS
- Lottie React
- react-hot-toast
- react-icons
- react-slick + slick-carousel
- sweetalert2

### Backend (`server/package.json`)

- express
- cors
- dotenv
- jsonwebtoken
- bcryptjs
- mongoose

---

## 10) Usage Examples

### 10.1 Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"john",
    "password":"secret123",
    "email":"john@example.com",
    "fullName":"John Doe",
    "phone":"",
    "address":""
  }'
```

### 10.2 Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "username":"john", "password":"secret123" }'
```

### 10.3 Get current user

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10.4 List products

```bash
curl http://localhost:5000/api/products
```

### 10.5 Admin product creation

Admin restriction is enforced on the **frontend route**; backend product endpoints are not protected by auth middleware in the current code.

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Demo Product",
    "price":25,
    "category":"Books",
    "image":"https://example.com/img.png",
    "description":"A demo product",
    "inStock":true
  }'
```

---

## 11) Notes / Caveats (Derived from Code)

- Backend product endpoints (`/api/products/*`) do not currently require authentication; role checks are implemented at the UI layer.
- Both backend and frontend compute “admin” role using environment-provided usernames, so keeping env values in sync is important.
- The frontend uses HashRouter and reverse geocoding for location display.
- `DataContext` falls back to FakeStore API when the backend is unreachable.

---

## Appendix: Key Files Quick Index

### Frontend

- `src/main.jsx` — provider + router bootstrap
- `src/App.jsx` — top-level routes
- `src/config/api.js` — `API_BASE`
- `src/Context/AuthContext.jsx` — auth/session
- `src/Context/DataContext.jsx` — products fetch
- `src/Context/CartContext.jsx` — cart persistence
- `src/Context/OrderContext.jsx` — orders persistence
- `src/Component/ProtectedRoute.jsx` — guard logic
- `src/pages/Dashboard.jsx` — admin product CRUD

### Backend

- `src/index.js` — app bootstrap
- `src/config/db.js` — Mongo connection
- `src/middleware/auth.js` — JWT middleware
- `src/lib/authHelpers.js` — admin username logic and user lookup
- `src/models/User.js` — user schema
- `src/models/Product.js` — product schema
- `src/routes/auth.js` — register/login/me
- `src/routes/products.js` — products CRUD
- `seedDashboardAdmin.js` and admin scripts — one-shot admin management
