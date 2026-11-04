# 💰 RayFin — Personal Finance Dashboard

> A mobile-first personal finance PWA built with **Next.js 16**, **Supabase**, and **Gemini AI**.  
> Track spending, manage budgets, scan receipts, and get AI-powered financial advice — all in one app.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Application Pages & Features](#application-pages--features)
- [API Routes](#api-routes)
- [Business Logic & Key Calculations](#business-logic--key-calculations)
- [Real-time System](#real-time-system)
- [AI Integration (Gemini)](#ai-integration-gemini)
- [Authentication & Security](#authentication--security)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)

---

## Overview

**RayFin** is a personal expense & budget tracker designed for a single user (Ray). It operates as a **Progressive Web App (PWA)** installable on mobile, with a dark-mode-first UI. The core philosophy is to give a complete financial snapshot at a glance: net worth, today's safe-to-spend amount, budget burn rate, savings goals, and asset tracking.

Key capabilities:
- 📊 **Dashboard** — real-time financial health metrics at a glance
- 🤖 **AI Advisor (RayFin AI)** — chat-based transaction logging & financial consultation powered by Gemini
- 📷 **Receipt Scanner** — photograph a receipt and AI auto-extracts the transaction details
- 📅 **Budget Management** — monthly category budgets with daily limit guardrails
- 🎯 **Goals** — savings goals with progress tracking
- 🏦 **Wallets & Assets** — full net worth view across all accounts and asset types
- 📄 **Transactions** — filterable, searchable full transaction history

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 7 |
| **UI** | React 19 + Tailwind CSS v4 |
| **Components** | Radix UI primitives + shadcn/ui pattern |
| **Animation** | Framer Motion 13 |
| **Charts** | Recharts 3 |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Email/Password) |
| **Real-time** | Supabase Realtime (Postgres CDC) |
| **AI** | Google Gemini API (`@google/genai`) — model: `gemini-3.5-flash-lite` |
| **PWA** | `@ducanh2912/next-pwa` |
| **Package Manager** | Bun |
| **Date Handling** | `date-fns` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser / PWA)              │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Pages   │  │  Hooks   │  │  Context │             │
│  │ (App     │◄─┤ (Data    │  │ (Auth)   │             │
│  │  Router) │  │  Layer)  │  └──────────┘             │
│  └────┬─────┘  └────┬─────┘                           │
│       │             │                                   │
│       ▼             ▼                                   │
│  ┌────────────────────────┐  ┌──────────────────────┐  │
│  │  lib/queries.ts        │  │  RealtimeProvider    │  │
│  │  (Supabase client ops) │  │  (Supabase Realtime) │  │
│  └────────────┬───────────┘  └──────────┬───────────┘  │
└───────────────┼──────────────────────────┼─────────────┘
                │                          │
                ▼                          ▼
┌──────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                    │
│                                                          │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────┐   │
│  │  PostgreSQL  │  │   Auth     │  │   Realtime     │   │
│  │  (tables)    │  │  (users)   │  │   (CDC events) │   │
│  └──────────────┘  └────────────┘  └────────────────┘   │
└──────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│                 NEXT.JS API ROUTES (Server)              │
│                                                          │
│  POST /api/advisor       → Gemini AI chat                │
│  POST /api/scan-receipt  → Gemini vision receipt scan    │
│  POST /api/auth/register → User registration (admin SDK) │
└──────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│               GOOGLE GEMINI API (External)              │
│       Model: gemini-3.5-flash-lite                      │
│       Used for: chat + receipt OCR                      │
└──────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **No dedicated backend server** — Next.js API routes handle all server-side logic
- **Row Level Security (RLS)** — Supabase RLS ensures users only see their own data
- **Client-side data fetching** — Each hook fetches directly from Supabase via the browser client (anon key). The session cookie is managed by `@supabase/ssr`
- **Real-time pub/sub** — A lightweight event bus (`lib/realtimeEvents.ts`) decouples Supabase Realtime events from individual data hooks
- **PWA-first** — The app is installable, works offline for previously loaded views, and respects iOS safe areas

---

## Database Schema

### Tables

#### `accounts`
Represents each wallet/bank account/e-wallet with its current running balance.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique ID |
| `user_id` | uuid (FK) | Supabase auth user |
| `account_name` | enum | One of the supported account types |
| `current_balance` | numeric | Live balance (mutated atomically via RPC) |
| `updated_at` | timestamptz | Last balance update |

**Supported account names:** `BCA`, `CIMB_NIAGA`, `CIMB_OCTO_PAY`, `SEABANK`, `SHOPEEPAY`, `GOPAY`, `DANA`, `CASH`, `MEGA_SYARIAH`, `E-WALLET`, `OTHER`

> `MEGA_SYARIAH` is treated as a **credit card** account — its negative balance contributes to `ccDebt` in net worth calculation.

---

#### `transactions`
Every financial movement (expense, income, or internal transfer).

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique ID |
| `user_id` | uuid (FK) | Owner |
| `transaction_date` | date | Date of the transaction (`YYYY-MM-DD`) |
| `source_account` | enum | Account money came from |
| `destination_account` | enum \| null | For transfers: target account |
| `flow_type` | enum | `EXPENSE`, `INCOME`, or `TRANSFER_INTERNAL` |
| `category` | text | Spending category (see categories below) |
| `subcategory` | text \| null | Optional sub-classification |
| `amount` | numeric | Transaction amount (always positive) |
| `merchant_name` | text \| null | Store/merchant name |
| `description` | text | Human-readable description |
| `raw_prompt` | text \| null | Original AI prompt (if created via AI Advisor) |
| `created_at` | timestamptz | Record creation timestamp |

**Flow types:**
- `EXPENSE` — money leaves an account; balance decremented
- `INCOME` — money enters an account; balance incremented
- `TRANSFER_INTERNAL` — money moves between two of the user's own accounts; source decremented, destination incremented

---

#### `budgets`
Monthly spending limits per category.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique ID |
| `user_id` | uuid (FK) | Owner |
| `month_year` | text | Format: `YYYY-MM` (e.g. `2026-11`) |
| `category` | text | Category this limit applies to |
| `limit_amount` | numeric | Maximum allowed spend for the month |

---

#### `goals`
Savings targets.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique ID |
| `user_id` | uuid (FK) | Owner |
| `title` | text | Goal name |
| `target_amount` | numeric | Amount to reach |
| `current_amount` | numeric | Amount saved so far |
| `deadline` | date \| null | Optional target date |
| `category` | enum | `EMERGENCY`, `ASSET`, `DREAM`, `EDUCATION`, `TRAVEL`, `OTHER` |
| `icon` | text | Emoji icon |
| `is_achieved` | boolean | True when `current_amount >= target_amount` |
| `notes` | text \| null | Optional notes |
| `created_at` / `updated_at` | timestamptz | Timestamps |

---

#### `assets`
Non-account assets (property, investments, gold, etc.) for net worth tracking.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique ID |
| `user_id` | uuid (FK) | Owner |
| `asset_name` | text | Descriptive name |
| `asset_type` | enum | `LIKUID` (liquid), `TETAP` (fixed), `INVESTASI` (investment) |
| `value` | numeric | Current estimated value |
| `account_id` | uuid \| null | Optional link to an account |
| `notes` | text \| null | Optional notes |
| `created_at` / `updated_at` | timestamptz | Timestamps |

---

### Database RPC

#### `mutate_balance(p_account_name, p_delta)`
An atomic stored procedure that increments or decrements an account's `current_balance`. Used after every transaction insert to keep balances in sync without a race condition.

---

## Application Pages & Features

### `/` — Dashboard

The main overview screen. Composed of multiple widgets rendered in a vertical feed:

| Widget | Description |
|---|---|
| `DashboardHeader` | Greeting + notification bell + quick budget/account status |
| `HeroCard` | Today's income vs expense + month totals + safe-to-spend daily figure |
| `DailyBudgetCard` | Today's food spend vs food limit, today's total vs general daily limit |
| `MenuGrid` | 8-icon quick-nav grid to all major sections |
| `NeedsWantsSavings` | 50/30/20 rule breakdown — needs, wants, savings bars with percentages |
| `CalendarHeatmap` | Monthly calendar coloured by daily spend intensity; tap a day to filter transactions below |
| `HealthScore` | Composite financial health score (0–100) derived from net worth, savings rate, budget discipline, liquid coverage |
| `RecentTransactions` | Last 10 transactions (or transactions for the selected calendar day) |

---

### `/budgets` — Budget Management

Monthly category budget tracker with:
- **Summary cards** — total budget vs spent vs over-budget count
- **Daily limit section** — food daily limit + general daily limit (can be auto-calculated from safe-to-spend)
- **Category progress list** — each budget category shows a progress bar, spent amount, limit, and remaining
- **Telegram shortcut** — instructions to set budgets via the Telegram bot integration

---

### `/scanner` — Receipt Scanner

AI-powered receipt scanning flow:
1. User taps to open camera or select a photo
2. Image is uploaded to `POST /api/scan-receipt`
3. Gemini Vision extracts: merchant, amount, category, date, payment method
4. Result is shown with confidence badge (HIGH / MEDIUM / LOW)
5. User confirms → transaction is inserted and account balance updated atomically

---

### `/goals` — Savings Goals

CRUD interface for financial goals:
- Create goals with category, target amount, deadline, and emoji icon
- Update progress (manually set current saved amount)
- Goals automatically marked achieved when `current_amount >= target_amount`
- Achieved goals displayed in a separate "🏆 Tercapai" section

---

### `/wallets` — Wallets & Assets (Net Worth)

Net worth breakdown across:
- **Liquid accounts** — all bank & e-wallet balances
- **Credit card debt** — negative balances on CC accounts
- **Assets** — LIKUID, TETAP, INVESTASI types
- **NetWorthHero** — headline net worth + liquid coverage ratio (months of expenses covered)
- Tabs: Semua / Dompet / Aset / Utang/CC

---

### `/transactions` — Transaction History

Filterable full ledger view:
- Filter by month (MonthPicker)
- Filter by flow type (expense / income / transfer)
- Filter by category
- Shows full transaction metadata: date, merchant, category badge, account, amount

---

### `/advisor` — AI Financial Advisor (RayFin AI)

Chat interface with Gemini-powered assistant:
- **Text mode** — answers financial questions using real-time financial snapshot
- **Transaction mode** — parses natural language ("spent 50k at Indomaret today") into a structured transaction draft
- Displays `TransactionDraftCard` for review before saving
- One-tap save → `insertClientTransaction` → balance mutation RPC

---

### `/profile` — User Profile

Account management (username, email display, sign out).

---

### `/login` & `/register` — Authentication

- Login: Supabase Auth email/password sign-in
- Register: hits `POST /api/auth/register` (uses service role key to create verified users, bypassing email confirmation)

---

## API Routes

### `POST /api/advisor`

**Purpose:** AI financial advisor chat

**Request body:**
```json
{
  "message": "beli makan siang 45000 pakai gopay",
  "history": [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }]
}
```

**Flow:**
1. Fetches real-time financial snapshot (account balances, monthly income/expense, budget limits) from Supabase using the user's session cookie
2. Builds a system prompt injecting the snapshot + current date (WIB timezone)
3. Calls Gemini with multi-turn conversation history
4. Parses JSON response — either `{ type: "TEXT" }` or `{ type: "TRANSACTION", draft: {...} }`
5. Validates/corrects transaction date to prevent AI date hallucination
6. Returns structured response to client

**Response (transaction detected):**
```json
{
  "type": "TRANSACTION",
  "content": "Oke, catat pengeluaran makan siang ya!",
  "draft": {
    "description": "Makan siang",
    "amount": 45000,
    "category": "Makanan & Minuman",
    "source_account": "GOPAY",
    "flow_type": "EXPENSE",
    "transaction_date": "2026-11-04",
    "merchant_name": null
  }
}
```

---

### `POST /api/scan-receipt`

**Purpose:** AI receipt OCR and data extraction

**Request:** `multipart/form-data` with field `image` (image file)

**Flow:**
1. Reads image file, converts to base64
2. Sends image + prompt to Gemini Vision
3. Extracts: merchant name, total amount, category, date, payment method, confidence level
4. Validates date to prevent hallucination
5. Returns `ScanResult` JSON

**Response:**
```json
{
  "merchant_name": "McDonald's",
  "amount": 65000,
  "category": "Makanan & Minuman",
  "transaction_date": "2026-11-04",
  "description": "Pembelian makanan McDonald's",
  "source_account": "GOPAY",
  "confidence": "HIGH"
}
```

---

### `POST /api/auth/register`

**Purpose:** Create new user accounts

**Request body:**
```json
{ "email": "user@email.com", "password": "secret", "username": "Ray" }
```

Uses **Supabase Admin SDK** with the service role key to create pre-verified users (skips email confirmation flow). This endpoint should be protected or removed in a multi-user production environment.

---

## Business Logic & Key Calculations

### Net Worth
```
liquidAssets = sum of balances of all NON credit card accounts
ccDebt       = sum of |negative balances| of credit card accounts  
netWorth     = liquidAssets − ccDebt
```

### Safe-to-Spend Daily
The core "how much can I spend today?" metric:
```
budgetRemaining  = totalBudgetThisMonth − totalExpenseThisMonth (floored at 0)
daysRemaining    = calendar days left in the current month (min 1)
safeToSpendDaily = budgetRemaining / daysRemaining
```
If no budgets are set, this returns `null` and the UI shows "—".

### 50/30/20 Split (Needs / Wants / Savings)
Transactions are classified by category:

| Bucket | Categories |
|---|---|
| **Needs** | Makanan & Minuman, Kesehatan, Operasional, Rumah Tangga, Cicilan, Komitmen Keluarga, Pendidikan |
| **Wants** | Hiburan, Lifestyle & Dating, Belanja Online, Lainnya |
| **Savings** | `max(totalIncome − totalExpense, 0)` |

Percentage of income is shown for each bucket alongside the ideal 50/30/20 target.

### Financial Health Score (0–100)
A composite score displayed as a gauge:

| Factor | Weight | Calculation |
|---|---|---|
| **Savings Rate** | 40 pts | `(savingsRate / 20) * 40` capped at 40 |
| **Budget Discipline** | 30 pts | `100 − max(expenseRatio*100 − 100, 0)` mapped to 30 pts |
| **Liquid Coverage** | 20 pts | Months of expenses covered by liquid assets; capped at 20 pts |
| **Net Worth** | 10 pts | Positive net worth: 10 pts, negative: 0 pts |

### Budget Discipline Score
Used as a component of Health Score:
```
discipline = max(100 − max((totalExpense / totalBudget * 100) − 100, 0), 0)
```
100 = no over-budget; 0 = massively over budget.

### Account Balance Mutation
When a transaction is saved (from AI Advisor, Scanner, or Telegram bot), the Supabase RPC `mutate_balance` is called:
- `EXPENSE` → source account balance `-= amount`
- `INCOME` → source account balance `+= amount`  
- `TRANSFER_INTERNAL` → source `-= amount`, destination `+= amount`

---

## Real-time System

RayFin uses a two-layer real-time architecture:

```
Supabase Realtime (WebSocket)
        │
        ▼
  RealtimeProvider (component, mounted on each page)
  - Subscribes to: transactions table (all events)
  - Subscribes to: accounts table (UPDATE events)
        │
        ▼
  triggerRefresh() — lib/realtimeEvents.ts
  (Simple pub/sub event bus: Set<() => void>)
        │
        ▼
  All data hooks (useAccounts, useTransactions, useBudgets, etc.)
  subscribeToRefresh() → call their own refetch()
```

This means: when the **Telegram bot** inserts a transaction or the AI Advisor saves one, all dashboard widgets refresh automatically within ~1 second without any page reload.

**Required Supabase setup:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
```

---

## AI Integration (Gemini)

Both AI features use `gemini-3.5-flash-lite` via the `@google/genai` SDK, with `responseMimeType: 'application/json'` to enforce structured output.

### Advisor System Prompt Design
The advisor prompt:
1. **Injects real-time data** — account balances, monthly income/expense totals, budget limits
2. **Anchors the current date** — WIB timezone (`Asia/Jakarta`) is used; date is explicitly stated to prevent hallucinated dates
3. **Provides strict output schema** — the model must return one of two JSON shapes (TEXT or TRANSACTION)
4. **Enumerates valid values** — account names, categories, and flow types are enumerated to constrain AI output

### Date Hallucination Guard
Both the advisor and scanner routes include a post-processing check:
```typescript
if (!draftDate || !/^\d{4}-\d{2}-\d{2}$/.test(draftDate) 
    || draftDate.startsWith('2023') 
    || draftDate.startsWith('2024') 
    || draftDate.startsWith('2025')) {
  data.draft.transaction_date = todayStr  // fall back to today
}
```

---

## Authentication & Security

### Auth Flow
```
User visits any route
        │
        ▼
  middleware.ts (Next.js Edge Middleware)
  - updateSession() refreshes Supabase session from cookie
  - No session + not on /login or /register → redirect to /login
  - Has session + on /login or /register → redirect to /
        │
        ▼
  Supabase Auth cookie managed by @supabase/ssr
  - Browser client: lib/supabase/client.ts
  - Server client: lib/supabase/server.ts
  - Middleware client: lib/supabase/middleware.ts
```

### API Route Security
- `/api/advisor` — reads user session from cookie via `createServerClient`; only reads the authenticated user's data
- `/api/scan-receipt` — stateless, no auth required (image processing only; nothing persisted server-side)
- `/api/auth/register` — uses `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to browser)

### RLS
Supabase Row Level Security is expected to be enabled on all tables (`accounts`, `transactions`, `budgets`, `goals`, `assets`) with policies that restrict access to `auth.uid() = user_id`.

---

## Data Flow Diagrams

### Transaction via AI Advisor

```
User types in chat
        │
        ▼
AdvisorChat.tsx → POST /api/advisor
        │
        ├─► getFinancialSnapshot() → Supabase (accounts + transactions + budgets)
        │
        ▼
Gemini API (gemini-3.5-flash-lite)
        │
        ▼
Parse JSON response
        │
   type=TRANSACTION?
   ┌────┴────┐
  YES        NO
   │          │
   ▼          ▼
Show        Show
TransactionDraftCard    Text bubble
   │
User taps "Simpan"
   │
   ▼
insertClientTransaction() → Supabase INSERT transactions
   │
   ▼
mutate_balance() RPC → UPDATE accounts
   │
   ▼
triggerRefresh() → all hooks refetch → UI updates
```

### Receipt Scanner Flow

```
User taps "Foto Struk" → opens camera/gallery
        │
        ▼
Image selected → preview shown → scanFile()
        │
        ▼
POST /api/scan-receipt (multipart form)
        │
        ▼
Gemini Vision (image + extraction prompt)
        │
        ▼
ScanResult JSON returned
        │
        ▼
Result card shown (amount, merchant, category, date, confidence)
        │
User taps "Simpan Transaksi"
        │
        ▼
insertClientTransaction() → Supabase INSERT + balance mutation
        │
        ▼
"Tersimpan!" confirmation shown
```

---

## Project Structure

```
expense-dashboard/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (ThemeProvider, AppShell, PWA metadata)
│   ├── page.tsx                  # Dashboard (/)
│   ├── login/page.tsx            # Login page
│   ├── register/page.tsx         # Registration page
│   ├── budgets/page.tsx          # Budget management
│   ├── scanner/page.tsx          # Receipt scanner
│   ├── goals/page.tsx            # Savings goals
│   ├── wallets/page.tsx          # Wallets & assets (net worth)
│   ├── transactions/page.tsx     # Transaction history
│   ├── advisor/page.tsx          # AI advisor chat
│   ├── profile/page.tsx          # User profile
│   └── api/
│       ├── advisor/route.ts      # POST — Gemini AI chat endpoint
│       ├── scan-receipt/route.ts # POST — Gemini receipt OCR endpoint
│       └── auth/register/route.ts# POST — user registration
│
├── components/
│   ├── dashboard/                # Dashboard widgets
│   │   ├── RealtimeProvider.tsx  # Supabase Realtime subscription
│   │   ├── HeroCard.tsx          # Safe-to-spend + monthly summary
│   │   ├── DailyBudgetCard.tsx   # Daily food/total spend tracker
│   │   ├── NeedsWantsSavings.tsx # 50/30/20 breakdown
│   │   ├── CalendarHeatmap.tsx   # Daily spend heatmap calendar
│   │   ├── HealthScore.tsx       # Financial health score gauge
│   │   ├── BudgetProgressList.tsx# Category budget bars
│   │   └── ...
│   ├── advisor/
│   │   ├── AdvisorChat.tsx       # Chat UI + message history
│   │   └── TransactionDraftCard.tsx # Confirm-before-save transaction card
│   ├── goals/
│   │   ├── GoalCard.tsx          # Individual goal card with progress
│   │   └── AddGoalModal.tsx      # Create goal dialog
│   ├── wallets/
│   │   ├── NetWorthHero.tsx      # Net worth headline card
│   │   ├── AccountGroup.tsx      # Grouped account list
│   │   └── AddAssetModal.tsx     # Add asset dialog
│   ├── layout/
│   │   ├── AppShell.tsx          # Page wrapper (layout + nav)
│   │   ├── Sidebar.tsx           # Desktop sidebar nav
│   │   ├── BottomNav.tsx         # Mobile bottom navigation
│   │   ├── FABMenu.tsx           # Floating action button
│   │   └── Header.tsx            # Top header
│   ├── shared/                   # Reusable shared components
│   └── ui/                       # Base UI primitives (shadcn pattern)
│
├── hooks/                        # Data-fetching React hooks
│   ├── useAccounts.ts            # Fetches accounts[], auto-refreshes on realtime
│   ├── useBudgets.ts             # Fetches budgets with spent amounts computed
│   ├── useTransactions.ts        # Fetches filtered transactions
│   ├── useDashboardMetrics.ts    # Derives DashboardMetrics from raw data
│   ├── useDailyExpenses.ts       # Fetches daily expense totals (for heatmap)
│   ├── useDailyBudgetSettings.ts # localStorage-persisted daily limit settings
│   ├── useGoals.ts               # Fetches goals[]
│   └── useAssets.ts              # Fetches assets[]
│
├── lib/
│   ├── queries.ts                # All Supabase client CRUD operations
│   ├── constants.ts              # Enums, labels, colors, category mappings
│   ├── formatters.ts             # Rupiah formatting, date helpers
│   ├── realtimeEvents.ts         # Lightweight pub/sub event bus
│   └── supabase/
│       ├── client.ts             # Browser Supabase client (singleton)
│       ├── server.ts             # Server-side Supabase client
│       └── middleware.ts         # Session refresh for Next.js middleware
│
├── context/
│   └── AuthContext.tsx           # Auth state provider (current user)
│
├── types/
│   └── index.ts                  # All TypeScript type definitions
│
├── public/
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # App icons (192x192, 512x512, maskable)
│
├── middleware.ts                 # Next.js Edge Middleware (auth guard)
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon/publishable key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin key — only used in `/api/auth/register`. **Never expose to client.** |
| `GEMINI_API_KEY` | Server only | Google Gemini API key — only used in API routes. **Never expose to client.** |
| `NEXT_PUBLIC_USER_NAME` | Client | Display name shown in greeting (e.g. `Ray`) |

> All `NEXT_PUBLIC_*` variables are bundled into the client. The others (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) must remain server-side only and must never be prefixed with `NEXT_PUBLIC_`.

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (package manager)
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone & Install

```bash
git clone <repo-url>
cd expense-dashboard
bun install
```

### 2. Set up Environment Variables

Copy `.env.local.example` to `.env.local` (or create it) and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GEMINI_API_KEY=<your-gemini-api-key>
NEXT_PUBLIC_USER_NAME=Ray
```

### 3. Set up Supabase Database

Run the following in the Supabase SQL Editor to create the required tables and enable real-time:

```sql
-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;

-- RPC for atomic balance mutation
CREATE OR REPLACE FUNCTION mutate_balance(p_account_name TEXT, p_delta NUMERIC)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE accounts
  SET current_balance = current_balance + p_delta,
      updated_at = NOW()
  WHERE account_name = p_account_name
    AND user_id = auth.uid();
END;
$$;
```

> The full schema (tables, RLS policies) is captured in `backup_rayfin_20260920.sql`.

### 4. Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/login` if no session is found.

### 5. Build for Production

```bash
bun run build
bun start
```

### 6. Generate PWA Icons (optional)

```bash
bun run gen-icons
```

---

## Transaction Categories

| Category (ID) | Bucket | Emoji |
|---|---|---|
| Makanan & Minuman | Needs | 🍔 |
| Kesehatan | Needs | 💊 |
| Operasional | Needs | 🚗 |
| Rumah Tangga | Needs | 🏠 |
| Cicilan | Needs | 💳 |
| Komitmen Keluarga | Needs | 👨‍👩‍👧 |
| Pendidikan | Needs | 📚 |
| Hiburan | Wants | 🎮 |
| Lifestyle & Dating | Wants | 🫶 |
| Belanja Online | Wants | 🛒 |
| Lainnya | Wants | 📦 |
| Gaji | Income | 💰 |
| Freelance | Income | 💻 |
| Investasi | Income | 📈 |

---

*Built by Ray • November 2026*

