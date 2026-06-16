# 🌿 FarmConnect — Virtual Farm Product Marketplace

A full-stack Nigerian agricultural marketplace built with Next.js 16, React 19, TypeScript, Prisma, Tailwind CSS 4, shadcn/ui, and Zustand.

## 🚀 Quick Start (Local Development)

```bash
# 1. Extract the zip and open in VS Code

# 2. Install dependencies
npm install

# 3. Push database schema (SQLite — local)
npx prisma db push

# 4. Seed with demo data
npx tsx prisma/seed.ts

# 5. Start the development server
npm run dev

# 6. Open http://localhost:3000
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Farmer | adebayo@farm.ng | password |
| Farmer | fatima@farm.ng | password |
| Buyer | chinedu@buy.ng | password |
| Logistics | emeka@logistics.ng | password |

---

## 🌐 Deploy to Vercel + Supabase

### Step 1: Create Supabase Database (Free)

1. Go to [https://supabase.com](https://supabase.com) → Sign up
2. Click **"New Project"** → Name it `farmconnect` → Set a password (save it!)
3. Choose closest region (e.g., **Lagos** or **London**)
4. Wait ~2 minutes for project to initialize

### Step 2: Get Your Database URL

1. In Supabase dashboard → **Settings** (gear icon) → **Database**
2. Scroll to **"Connection string"** → Select **"Transaction pooler"**
3. Copy the URI:
   ```
   postgresql://postgres.xxxxxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### Step 3: Switch to PostgreSQL Schema

Open `prisma/schema.prisma` and change line 6:

```diff
- provider = "sqlite"
+ provider = "postgresql"
```

### Step 4: Push Tables to Supabase

```bash
DATABASE_URL="paste-your-supabase-url-here" npx prisma db push
```

### Step 5: Seed the Database

```bash
DATABASE_URL="paste-your-supabase-url-here" npx tsx prisma/seed.ts
```

### Step 6: Deploy to Vercel

1. Push your project to **GitHub** (create a new repository)
2. Go to [https://vercel.com](https://vercel.com) → **"New Project"**
3. Import your GitHub repository
4. Under **Environment Variables**, add:
   - `DATABASE_URL` = your Supabase connection string
5. Click **Deploy**

That's it! Your FarmConnect app will be live. 🎉

---

## 📁 Project Structure

```
farmconnect/
├── prisma/
│   ├── schema.prisma      # Database schema (SQLite/PostgreSQL)
│   └── seed.ts            # Demo data seeder
├── public/
│   └── images/
│       ├── products/       # Product images (24 items)
│       └── farms/          # Farm images (2 farms)
├── src/
│   ├── app/
│   │   ├── page.tsx        # Main entry (single-page routing)
│   │   ├── layout.tsx      # Root layout
│   │   └── api/
│   │       ├── auth/       # Login API
│   │       ├── register/   # Registration API
│   │       ├── products/   # Products CRUD
│   │       ├── orders/     # Orders CRUD
│   │       ├── farms/      # Farms CRUD
│   │       ├── deliveries/ # Delivery management
│   │       ├── stats/       # Dashboard statistics
│   │       └── upload/     # Image upload
│   ├── components/
│   │   ├── Header.tsx           # Navigation bar
│   │   ├── LandingPage.tsx      # Landing/home page
│   │   ├── AuthPages.tsx        # Login & Register UI
│   │   ├── MarketplacePage.tsx  # Buyer experience
│   │   ├── FarmerDashboard.tsx  # Farmer dashboard
│   │   ├── LogisticsDashboard.tsx # Logistics dashboard
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── store.ts        # Zustand state management
│   │   ├── db.ts           # Prisma database client
│   │   └── utils.ts        # Utility functions
│   └── hooks/
│       ├── use-toast.ts    # Toast notification hook
│       └── use-mobile.ts   # Mobile detection hook
├── .env.example            # Environment variables template
├── vercel.json             # Vercel deployment config
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies & scripts
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 | React framework (App Router) |
| React 19 | UI library |
| TypeScript | Type safety |
| Prisma ORM | Database management |
| SQLite / PostgreSQL | Database (local / Supabase) |
| Tailwind CSS 4 | Styling |
| shadcn/ui | UI component library |
| Zustand | State management |
| Framer Motion | Animations |
| Lucide React | Icons |

---

## 👥 Roles & Features

### Farmer
- Add/manage products with images
- View orders and update status
- Track inventory & low stock alerts
- Dashboard with revenue stats

### Buyer
- Browse products by category
- Search & filter products
- Add to cart & checkout
- Multiple payment methods (Paystack, Flutterwave, ATM Card, Bank Transfer)
- View order history

### Logistics
- View pickup queue
- Accept & manage deliveries
- Track delivery progress
- View earnings & completed deliveries

---

## 💳 Payment Methods

| Method | Description |
|--------|------------|
| Paystack | Redirect to secure Paystack checkout (cards, USSD, bank transfer) |
| Flutterwave | Pay via Flutterwave portal (cards, mobile money, USSD) |
| ATM Card | Direct debit card payment (Visa, Mastercard, Verve) |
| Bank Transfer | Transfer to bank account with verification |

---

## 📝 Available Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database with demo data
```
