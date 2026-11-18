"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7FC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="mt-6 text-center font-serif text-2xl sm:text-3xl font-bold text-[#1B1E59]">
          Chamber Admin Portal
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Authorized access for TaxVat LawAid leads &amp; appointment management.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl bg-white py-8 px-6 sm:px-9 shadow-md ring-1 ring-slate-200/90">
          {error ? (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl bg-[#FDF1F2] border border-[#CC242B]/25 p-3.5 text-xs font-medium text-[#991B1F]"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#CC242B]" />
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-5 mt-2">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-semibold text-[#1B1E59]"
              >
                Admin Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="taxvatlawaid@gmail.com"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-semibold text-[#1B1E59]"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2B2E7E] hover:bg-[#1B1E59] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Sign In to Admin Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-semibold text-[#2B2E7E] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Landing Page
            </Link>
            <span>MongoDB Atlas • Encrypted JWT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
