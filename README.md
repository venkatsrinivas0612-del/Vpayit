# Vpayit — Bill Management Dashboard for UK SMEs

Open Banking bill detection, savings opportunities, and spend analytics.

---

## Stack

| Layer    | Tech                                              |
|----------|---------------------------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts         |
| Backend  | Node.js + Express + Helmet + Rate-limiting        |
| Auth     | Supabase Auth (JWT)                               |
| Database | Supabase PostgreSQL (with RLS)                    |
| Banking  | TrueLayer Open Banking (Sandbox)                  |
| Crypto   | AES-256-GCM for token encryption                  |

---

## Project structure

```
/vpayit
  /backend
    server.js
    /src
      /config         supabase.js
      /middleware     authMiddleware.js  errorHandler.js
      /services       billClassifier.js  truelayerService.js  encryptionService.js
      /routes         auth  banks  bills  savings  transactions
      /controllers    (matching routes)
  /frontend
    /src
      /pages          Dashboard  Bills  Payments  Savings  Reports  Settings
      /pages/auth     Login  Register  ForgotPassword
      /components     Sidebar  Layout  ProtectedRoute
      /context        AuthContext.jsx
      /lib            supabaseClient.js  api.js
  /database
    schema.sql        — run first
    seed.sql          — run second (41 UK suppliers)
```

---

## Quick start

### 1. Database (Supabase)

In your Supabase SQL editor, run in order:

```sql
-- 1. schema
\i database/schema.sql

-- 2. seed
\i database/seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env     # fill in your values
npm install
npm run dev              # starts on :3001
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env     # fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm install
npm run dev              # starts on :5173
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable                 | Description                                 |
|--------------------------|---------------------------------------------|
| `SUPABASE_URL`           | Your Supabase project URL                   |
| `SUPABASE_ANON_KEY`      | Supabase anon/public key                    |
| `SUPABASE_SERVICE_KEY`   | Supabase service-role key (keep secret)     |
| `TRUELAYER_CLIENT_ID`    | TrueLayer sandbox client ID                 |
| `TRUELAYER_CLIENT_SECRET`| TrueLayer sandbox client secret             |
| `TRUELAYER_REDIRECT_URI` | `http://localhost:3001/api/v1/banks/callback`|
| `ENCRYPTION_KEY`         | 64 hex chars (`openssl rand -hex 32`)       |
| `JWT_SECRET`             | ≥ 32 char random string                     |
| `PORT`                   | Default `3001`                              |

### Frontend (`frontend/.env`)

| Variable                | Description                  |
|-------------------------|------------------------------|
| `VITE_SUPABASE_URL`     | Same Supabase project URL    |
| `VITE_SUPABASE_ANON_KEY`| Supabase anon/public key     |
| `VITE_API_BASE_URL`     | `http://localhost:3001/api/v1`|

---

## API reference

```
GET  /health

POST   /api/v1/auth/profile          Upsert business profile
GET    /api/v1/auth/me               Get profile
PATCH  /api/v1/auth/me               Update profile

GET    /api/v1/banks                 List connections
GET    /api/v1/banks/auth-url        Get TrueLayer OAuth URL
POST   /api/v1/banks/callback        Exchange code → tokens
POST   /api/v1/banks/:id/sync        Fetch + classify transactions
DELETE /api/v1/banks/:id             Remove connection

GET    /api/v1/bills                 List bills (?status= &category=)
POST   /api/v1/bills/detect          Detect recurring bills from transactions
GET    /api/v1/bills/:id             Get single bill
PATCH  /api/v1/bills/:id             Update bill

GET    /api/v1/savings               List savings opportunities
POST   /api/v1/savings/generate      Generate opportunities from active bills
PATCH  /api/v1/savings/:id           Update status (viewed/applied/dismissed)

GET    /api/v1/transactions          List transactions (paginated)
GET    /api/v1/transactions/bills    Bill transactions only
GET    /api/v1/transactions/summary  Monthly spend summary (?month=YYYY-MM)
```

---

## Sprint roadmap

- [x] **Sprint 1** — Project setup, database, auth flow ← *you are here*
- [ ] **Sprint 2** — TrueLayer live integration, transaction sync
- [ ] **Sprint 3** — Bill detection engine refinements, classification accuracy
- [ ] **Sprint 4** — Savings engine, referral links, email notifications
- [ ] **Sprint 5** — Reports, export (CSV/PDF), plan gating
