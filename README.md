# TaxVat LawAid — Single-Page Appointment & Lead Generation Landing Page

A high-converting single-page legal & tax consultancy landing page with a secure MongoDB Atlas-backed `/admin` lead and appointment management dashboard for **TaxVat LawAid** (Associated Practice: **TaxAid**), Ramna, Dhaka, Bangladesh.

## Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend & Database:** MongoDB Atlas (`mongodb` official Node.js driver)
- **Authentication:** `bcryptjs` hashed credentials in MongoDB + `HttpOnly` HS256 JWT session cookies (`jose`) + Edge Middleware protection
- **Validation:** Zod (Bangladesh `+880` phone normalization & `Asia/Dhaka` BST working-day validation)
- **Marketing & Ads:** Meta Pixel, GA4, Google Ads Conversion Tracking, UTM & `fbclid`/`gclid` attribution
- **Hosting:** Vercel

## Environment Variables (`.env.local` & Vercel Project Settings)
Copy `.env.example` to `.env.local` and configure:
- `MONGODB_URI` — MongoDB Atlas connection string (server-only, never exposed to browser)
- `MONGODB_DB` — Database name (default: `TaxvatlawaidLandingpage`)
- `ADMIN_JWT_SECRET` — Strong random secret string (32+ chars)
- `ADMIN_SEED_EMAIL` & `ADMIN_SEED_PASSWORD` — Used automatically on first startup to seed the initial `super_admin` in the `admins` collection
- Optional Ads IDs: `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`
- Optional Admin Email Alerts: `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAIL`

## MongoDB Collections (Auto-Initialized)
Indexes, default Sun–Thu (3:00 PM–7:30 PM BST) consultation slots, and the initial admin account are created automatically on first connection:
- `appointments` (unique `inquiry_id`, partial unique confirmed slot index, full UTM attribution)
- `availability_slots` (50 default weekly slots, toggleable in `/admin`)
- `blocked_dates` (public holidays & chamber closures manageable in `/admin`)
- `admin_notifications` (unread alert feed on every new booking)
- `admins` (`bcryptjs` hashed credentials & active status)

## Run Locally
```bash
npm install
npm run dev
```
- Public Landing Page: `http://localhost:3000`
- Admin Login: `http://localhost:3000/admin/login`
- Admin Dashboard: `http://localhost:3000/admin`
