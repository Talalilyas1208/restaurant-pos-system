# 🍽️ Grand Horizon - Hotel & Restaurant POS & Contactless QR Menu System

A production-ready, full-featured Point of Sale (POS), Kitchen Display System (KDS), and Mobile QR Code Digital Menu platform engineered for restaurants, boutique hotels, cafes, and room service.

---

## 🌟 Key Features

### 1. 🖥️ POS Cashier & Waiter Terminal (`/pos`)
- **Fast Touch Catalog**: Filterable categories, fuzzy dish search, modifier selection modal (doneness, toppings, extra sides).
- **Floor Table Manager**: Real-time table status mapping (*Available*, *Occupied*, *Billed*, *Reserved*).
- **Redux-Persist Cart**: Local drafts persisted across page reloads and offline sessions.
- **Bill Splitting**: 2-way to 6-way equal bill calculations.
- **Multi-Method Settlement**: Cash (with tendered & change calculator), Credit/Debit Card, and Hotel Room Bill Charge.
- **Thermal Receipt Generator**: Built-in 80mm & 58mm POS receipt layout with QR invoice code and 1-click `window.print()`.

### 2. 📱 Guest QR Code Digital Menu (`/menu/[hotelId]/[tableId]`)
- **Zero App Download**: Customers scan the table QR code to open the restaurant's menu with table context automatically bound.
- **Dietary Filter Chips**: Toggle Vegetarian, Spicy, and Chef Specials.
- **Live Kitchen Tracker**: Real-time order progress bar (*Received ⏱️* &rarr; *Cooking in Kitchen 🍳* &rarr; *Ready / Served 🍽️*).

### 3. 🍳 Kitchen Display System (`/kds`)
- **Live Kanban Queue**: Automated tickets organized into *New Tickets*, *Cooking On Line*, and *Pass / Ready to Serve*.
- **Elapsed Ticket Timers**: Visual warning timer highlighting tickets over 15 minutes.
- **Real-Time Polling**: React Query synchronization every 8 seconds.

### 4. ⚙️ Admin Hub & Table QR Generator (`/admin`)
- **Printable Table Stand Generator**: High-resolution branded QR table cards with customizable table tokens.
- **Menu & Dish Manager**: Add new items, update prices, and toggle 86 / Sold-out stock status in real-time.
- **Revenue Analytics**: Daily sales, average ticket value, top-selling dishes, and hourly peak volume chart.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **State & Cache** | Redux Toolkit (`@reduxjs/toolkit`), `redux-persist`, TanStack React Query v5 |
| **Backend API** | Express.js, TypeScript (`tsx`), Helmet, CORS, Morgan, Zod Validation |
| **Database & Realtime** | Supabase (PostgreSQL 14+), Schema migrations, Seed data |
| **QR Code Engine** | `qrcode.react` (SVG high-resolution QR rendering) |

---

## 📂 Project Directory Structure

```text
restaurant-management/
├── client/                     # Next.js 14+ App Router Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Global layout & Providers
│   │   │   ├── page.tsx        # Operations Dashboard & Role Hub
│   │   │   ├── pos/page.tsx    # POS Cashier Terminal
│   │   │   ├── menu/[hotelId]/[tableId]/page.tsx # Customer QR Menu & Tracker
│   │   │   ├── kds/page.tsx    # Kitchen Display System
│   │   │   └── admin/page.tsx  # Admin & QR Stand Generator
│   │   ├── components/         # ReceiptModal, SplitBillModal, ItemModifierModal, QRStandCard, Navbar
│   │   ├── store/              # Redux Toolkit store + redux-persist slices
│   │   ├── lib/                # TanStack React Query client & API fetcher
│   │   └── types/              # TypeScript interfaces
├── server/                     # Express.js REST API Backend
│   ├── src/
│   │   ├── config/             # Supabase client & environment variables
│   │   ├── controllers/        # Hotel, Table, Menu, Order, Payment, Analytics controllers
│   │   ├── middlewares/        # Error handler & Zod validation
│   │   ├── routes/             # REST endpoints (/api/v1/...)
│   │   ├── services/           # Supabase DB service with in-memory fallback engine
│   │   └── server.ts           # Express server entry point
├── supabase/
│   ├── schema.sql              # PostgreSQL tables, relations, and RLS policies
│   └── seed.sql                # Hotel seed data, tables, categories, dishes
├── package.json                # Monorepo orchestration scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**

### 2. Start Development Servers
From the project root:

```bash
# Start backend API (Port 5001) and frontend (Port 3000):
npm run dev:server
# in another terminal:
npm run dev:client
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001/api/v1](http://localhost:5001/api/v1)
- **API Health Check**: [http://localhost:5001/health](http://localhost:5001/health)

---

## 🗄️ Supabase Database Setup (Optional)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase/schema.sql` and run.
4. Paste the contents of `supabase/seed.sql` and run.
5. In `server/.env`, set:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-or-anon-key
   ```
*(Note: The server includes a built-in store service that functions immediately even without Supabase credentials for local testing!)*

---

## 📤 GitHub Repository
Repository is synchronized at: [https://github.com/Talalilyas1208/restaurant-pos-system.git](https://github.com/Talalilyas1208/restaurant-pos-system.git)

---

## 📄 License
MIT License. Created for hospitality businesses and fine dining restaurants.