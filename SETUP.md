# MISP — Setup Guide

## Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project

---

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project → Settings → API → `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project → Settings → API → `service_role` key |
| `DATABASE_URL` | Supabase → Project → Settings → Database → Connection String → **Transaction pooler** (port 6543) |
| `DIRECT_URL` | Supabase → Project → Settings → Database → Connection String → **Direct** (port 5432) |

---

## 3. Set Up the Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase (dev)
npm run db:push

# Seed default benefit programs
npx ts-node prisma/seed.ts
```

---

## 4. Set Up Supabase Storage

In the Supabase dashboard:
1. Go to **Storage** → **New bucket**
2. Bucket name: `misp-documents`
3. Set to **Private** (signed URLs will be used)
4. Add the following RLS policy:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'misp-documents' AND (storage.foldername(name))[1] = 'documents');
```

---

## 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 6. Create an Admin User

After registering a user normally, run this SQL in the Supabase SQL Editor to promote them to Admin:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your-admin@email.com';
```

Then access the admin portal at `/admin`.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── (auth)/login/             # Login page
│   ├── (auth)/register/          # Register page
│   ├── dashboard/                # Resident portal
│   │   ├── page.tsx              # Dashboard home
│   │   ├── apply/                # Submit application
│   │   ├── applications/         # View applications
│   │   └── profile/              # Profile + residency map
│   ├── admin/                    # Admin portal (MSWD Staff)
│   └── api/                      # API routes
├── components/
│   ├── auth/                     # Login/Register forms
│   ├── dashboard/                # Apply form, Leaflet map
│   ├── layout/                   # Navbar, Footer, DashboardNav, AdminNav
│   └── ui/                       # Button, Input, StatusBadge
├── lib/
│   ├── supabase/client.ts        # Browser Supabase client
│   ├── supabase/server.ts        # Server Supabase client
│   ├── prisma.ts                 # Prisma singleton
│   └── makati-bounds.ts          # GIS bounds + isWithinMakati()
├── middleware.ts                  # Route protection (Supabase SSR)
└── types/index.ts                # Shared TypeScript types
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS, Lucide React |
| Auth | Supabase Auth (email/password) + SSR cookies |
| Database | Supabase PostgreSQL via Prisma ORM |
| File Storage | Supabase Storage (`misp-documents` bucket) |
| Maps | Leaflet.js (OpenStreetMap tiles) — no API key needed |
| RBAC | `role` column on `users` table (`ADMIN` / `REGISTERED_USER`) |
