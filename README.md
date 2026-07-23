# Pansar Store — ERP + POS + E-commerce (Foundation)

This is **Phase 1** of the project: project setup, folder structure, and all MongoDB
data models. The next phases (Admin Dashboard, POS, Customer Website) will be built
on top of this foundation.

## Tech Stack
- Next.js 14 (App Router) + JavaScript
- MongoDB + Mongoose
- JWT auth (HTTP-only cookies)
- Cloudinary (image uploads — to be wired in Phase 2/3)
- Tailwind CSS
- Zod (validation)

## Folder Structure
```
pansar-store/
├── src/
│   ├── app/                  # Next.js App Router pages & API routes
│   │   ├── api/               # (empty for now — admin/customer APIs added in next phases)
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   ├── models/                 # All Mongoose schemas
│   │   ├── User.js              # Admin / staff / manager accounts
│   │   ├── Customer.js          # Website customers
│   │   ├── Supplier.js
│   │   ├── Category.js
│   │   ├── Brand.js
│   │   ├── Product.js
│   │   ├── Purchase.js          # Purchase bills (auto increases stock)
│   │   ├── Sale.js              # POS sales (auto decreases stock)
│   │   ├── Order.js             # Website orders (auto decreases stock on confirm)
│   │   └── index.js             # Expense, Coupon, Banner, Settings, Notification,
│   │                             # Review, Wishlist, Cart, StockHistory
│   ├── lib/
│   │   ├── db.js                # Cached MongoDB connection
│   │   ├── auth.js               # JWT sign/verify + cookie helpers
│   │   ├── stock.js              # Central stock in/out logic + auto notifications
│   │   ├── apiResponse.js        # Uniform API response helpers
│   │   └── validations.js        # Zod schemas for all major forms
│   ├── middleware.js            # Protects /admin and /api/admin routes via JWT
│   └── scripts/
│       └── seed.js               # Creates first Admin user + default settings
├── package.json
├── next.config.js
├── tailwind.config.js
├── jsconfig.json                # "@/..." import alias -> src/
└── .env.example
```

## Data Model Overview
| Model | Purpose |
|---|---|
| `User` | Admin/staff accounts with role-based access (`admin`, `manager`, `staff`) |
| `Customer` | Website customers, supports guest + registered |
| `Supplier` | Vendors for purchases, tracks outstanding balance |
| `Category` / `Brand` | Product taxonomy |
| `Product` | Full product info: pricing, stock, expiry, flash sale, SEO |
| `Purchase` | Purchase bills — stock auto-increases via `lib/stock.js` |
| `Sale` | POS transactions — stock auto-decreases |
| `Order` | Website checkout orders with status workflow |
| `Expense`, `Coupon`, `Banner`, `Settings`, `Notification`, `Review`, `Wishlist`, `Cart`, `StockHistory` | Supporting collections |

## Stock Automation
All stock changes go through **`adjustStock()`** in `src/lib/stock.js`. This guarantees:
- `StockHistory` always has an audit trail
- Low-stock / out-of-stock `Notification`s fire automatically
- Purchases always increase stock, sales/orders always decrease it — no manual stock edits needed elsewhere in the codebase

## Getting Started
1. `npm install`
2. Copy `.env.example` to `.env` and fill in your MongoDB URI, JWT secret, and Cloudinary keys
3. `npm run seed` — creates your first admin login (printed in the console)
4. `npm run dev` — starts the dev server on `http://localhost:3000`

## What's Next (Phases 2-4)
- **Phase 2 — Admin Dashboard:** Login page, dashboard analytics (Recharts), CRUD UI for Products/Categories/Brands/Suppliers, Purchase & Sales POS screens, Reports, Settings, CMS editor
- **Phase 3 — Customer Website:** Homepage sections, product listing/detail pages, cart, checkout, customer account
- **Phase 4 — Polish:** Coupons, notifications UI, dark mode, PDF/Excel export, SEO, deployment

Let me know which phase to build next.
