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

| Model                                                                                                   | Purpose                                                                   |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `User`                                                                                                  | Admin/staff accounts with role-based access (`admin`, `manager`, `staff`) |
| `Customer`                                                                                              | Website customers, supports guest + registered                            |
| `Supplier`                                                                                              | Vendors for purchases, tracks outstanding balance                         |
| `Category` / `Brand`                                                                                    | Product taxonomy                                                          |
| `Product`                                                                                               | Full product info: pricing, stock, expiry, flash sale, SEO                |
| `Purchase`                                                                                              | Purchase bills — stock auto-increases via `lib/stock.js`                  |
| `Sale`                                                                                                  | POS transactions — stock auto-decreases                                   |
| `Order`                                                                                                 | Website checkout orders with status workflow                              |
| `Expense`, `Coupon`, `Banner`, `Settings`, `Notification`, `Review`, `Wishlist`, `Cart`, `StockHistory` | Supporting collections                                                    |

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

E-commerce websites ke liye sirf yellow hi zaroori nahi hota. Yahan kuch modern color palettes hain jo bahut professional aur attractive lagte hain.

1. Royal Blue (⭐⭐⭐⭐⭐ Best for Electronics & General E-commerce)
   primary: "#2563EB"
   secondary: "#DBEAFE"
   accent: "#F97316"
   background: "#F8FAFC"
   text: "#0F172A"
   Trust build karta hai.
   Amazon, Walmart jaisi feel.
2. Emerald Green (⭐⭐⭐⭐⭐ Organic, Grocery, Fashion)
   primary: "#10B981"
   secondary: "#D1FAE5"
   accent: "#F59E0B"
   background: "#F9FAFB"
   text: "#111827"
   Fresh aur premium look.
   Grocery aur fashion stores ke liye achha.
3. Luxury Gold (⭐⭐⭐⭐⭐ Premium Products)
   primary: "#D4AF37"
   secondary: "#FFF7D6"
   accent: "#1F2937"
   background: "#FFFCF5"
   text: "#111827"
   Luxury brands, jewelry, perfumes ke liye perfect.
4. Modern Orange (⭐⭐⭐⭐⭐ Best for Sales)
   primary: "#F97316"
   secondary: "#FFEDD5"
   accent: "#2563EB"
   background: "#FFFDFB"
   text: "#1F2937"
   Bahut energetic aur conversion-friendly.
5. Purple Premium (⭐⭐⭐⭐⭐ Modern Brand)
   primary: "#7C3AED"
   secondary: "#EDE9FE"
   accent: "#F59E0B"
   background: "#FAFAFF"
   text: "#1F2937"
   Modern aur premium feel.
6. Black + Gold (⭐⭐⭐⭐⭐ Luxury)
   primary: "#111827"
   secondary: "#F3F4F6"
   accent: "#FBBF24"
   background: "#FFFFFF"
   text: "#111827"
   Apple aur luxury brands jaisi feel.
7. Warm Yellow (⭐⭐⭐⭐⭐ Best Yellow Theme)
   primary: "#EAB308"
   secondary: "#FEF9C3"
   accent: "#EA580C"
   background: "#FFFEF5"
   text: "#1F2937"
   Simple yellow se zyada premium aur modern.
   Meri recommendation

Agar aap modern e-commerce website bana rahe hain, to ye palette sabse achha lagega:

Primary : #2563EB (Royal Blue)
Secondary : #DBEAFE
Accent : #F97316 (Orange)
Background: #F8FAFC
Text : #0F172A

Ya agar aap yellow hi rakhna chahte hain, to:

Primary : #EAB308
Secondary : #FEF9C3
Accent : #EA580C
Background: #FFFEF5
Text : #1F2937
# Gift-Store
