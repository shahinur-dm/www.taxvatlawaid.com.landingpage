import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import {
  getAuthenticatedAdmin,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { BrandLogo } from "@/components/BrandLogo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chamber Admin Dashboard | TaxVat LawAid",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-[#F6F7FC] flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200 space-y-5">
          <BrandLogo compact />
          <div className="flex items-start gap-3 rounded-xl bg-[#FBF6E6] border border-[#C99A1E]/35 p-4 text-sm text-[#7C5909]">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-[#C99A1E]" />
            <div>
              <p className="font-bold">Supabase Connection Not Configured</p>
              <p className="mt-1 text-xs leading-relaxed">
                This admin dashboard runs strictly on real Supabase PostgreSQL data. Set{" "}
                <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
                <code>SUPABASE_SERVICE_ROLE_KEY</code> in <code>.env.local</code>, apply{" "}
                <code>supabase/migrations/001_initial_schema.sql</code>, and create your
                admin user to activate <code>/admin</code>.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#2B2E7E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1B1E59] transition"
          >
            Return to Landing Page
          </Link>
        </div>
      </div>
    );
  }

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  if (!admin.profile.is_active) {
    return (
      <div className="min-h-screen bg-[#F6F7FC] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200 text-center space-y-4">
          <ShieldAlert className="h-10 w-10 text-[#CC242B] mx-auto" />
          <h1 className="font-serif text-2xl font-bold text-[#1B1E59]">
            Access Restricted
          </h1>
          <p className="text-sm text-slate-600">
            Your administrator account is currently inactive. Please contact the firm
            super administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboardClient
      adminName={admin.profile.full_name}
      adminEmail={admin.profile.email}
      adminRole={admin.profile.role}
    />
  );
}
