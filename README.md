# TaxVat LawAid — Single-Page Appointment & Lead Generation Landing Page

A high-converting single-page legal & tax consultancy landing page with a secure Supabase-backed `/admin` lead and appointment management dashboard for **TaxVat LawAid** (Associated Practice: **TaxAid**), Ramna, Dhaka, Bangladesh.

## Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend & Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Auth:** Supabase Auth (`@supabase/ssr`) + `admin_profiles` role guard
- **Validation:** Zod (including Bangladesh `+880` phone normalization & `Asia/Dhaka` BST working-day checks)
- **Marketing & Ads:** Meta Pixel, GA4, Google Ads Conversion Tracking, UTM & `fbclid`/`gclid` capture
- **Hosting:** Vercel

## Quick Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase & Environment Variables
1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — never exposed to browser)
   - Optional Ads IDs: `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`
   - Optional Admin Email Alerts: `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAIL`

### 3. Run the PostgreSQL Migration
Open **Supabase Dashboard → SQL Editor** and execute the entire contents of:
- `supabase/migrations/001_initial_schema.sql`

This creates:
- `appointments`, `availability_slots` (seeded Sun–Thu, 3:00 PM–8:00 PM BST), `blocked_dates`, `admin_profiles`, and `admin_notifications`
- Strict Row Level Security (RLS) policies preventing anonymous PII access
- Automatic admin notification trigger on every new lead
- Secure `SECURITY DEFINER` RPCs (`get_date_availability`, `check_inquiry_status`)

### 4. Create Your Admin Account
1. In **Supabase Dashboard → Authentication → Users**, click **Add user** (e.g., `taxvatlawaid@gmail.com` + a strong password).
2. Copy the new user's UUID and run in **SQL Editor**:
```sql
INSERT INTO public.admin_profiles (id, email, full_name, role)
VALUES ('<AUTH_USER_UUID>', 'taxvatlawaid@gmail.com', 'Hossain Ahmed (Khan)', 'super_admin')
ON CONFLICT (id) DO NOTHING;
```

### 5. Run Locally & Deploy to Vercel
```bash
npm run dev
```
- Public Landing Page: `http://localhost:3000`
- Secure Admin Dashboard: `http://localhost:3000/admin`

To deploy to Vercel, add the same environment variables in **Vercel Project Settings → Environment Variables** and deploy with `vercel --prod`.
