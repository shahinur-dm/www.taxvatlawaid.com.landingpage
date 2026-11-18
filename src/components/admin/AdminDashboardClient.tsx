"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Filter,
  Loader2,
  LogOut,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
  XCircle,
  AlertCircle,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { FIRM_INFO, SERVICE_CATEGORIES } from "@/data/firm";
import { BrandLogo } from "@/components/BrandLogo";
import type {
  AdminNotificationRecord,
  AppointmentRecord,
  AppointmentStatus,
  AvailabilitySlot,
  BlockedDateRecord,
} from "@/types/database";

interface AdminDashboardClientProps {
  adminName: string;
  adminEmail: string;
  adminRole: string;
}

interface DashboardStats {
  total: number;
  newInquiries: number;
  pending: number;
  confirmed: number;
  completed: number;
  rejected: number;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function AdminDashboardClient({
  adminName,
  adminEmail,
  adminRole,
}: AdminDashboardClientProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"leads" | "availability">("leads");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Leads & Appointments state
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    newInquiries: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    rejected: 0,
  });
  const [distinctSources, setDistinctSources] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AdminNotificationRecord[]>(
    []
  );
  const [showNotifications, setShowNotifications] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected client detail drawer
  const [selectedRecord, setSelectedRecord] =
    useState<AppointmentRecord | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Availability management state
  const [availSlots, setAvailSlots] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDateRecord[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("Public Holiday");
  const [availLoading, setAvailLoading] = useState(false);

  const showToastMessage = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchDashboard = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setErrorBanner(null);

      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (serviceFilter !== "all") params.set("service", serviceFilter);
        if (sourceFilter !== "all") params.set("source", sourceFilter);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());

        const res = await fetch(`/api/admin/appointments?${params.toString()}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setErrorBanner(data.error || "Failed to load leads.");
          return;
        }

        setAppointments(data.appointments || []);
        setStats(
          data.stats || {
            total: 0,
            newInquiries: 0,
            pending: 0,
            confirmed: 0,
            completed: 0,
            rejected: 0,
          }
        );
        setDistinctSources(data.distinctSources || []);
        setNotifications(data.notifications || []);
      } catch {
        setErrorBanner("Network error while fetching dashboard data.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, serviceFilter, sourceFilter, searchQuery, router]
  );

  const fetchAvailability = useCallback(async () => {
    setAvailLoading(true);
    try {
      const res = await fetch("/api/admin/availability");
      const data = await res.json();
      if (res.ok) {
        setAvailSlots(data.slots || []);
        setBlockedDates(data.blockedDates || []);
      }
    } finally {
      setAvailLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboard(false);
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchDashboard]);

  useEffect(() => {
    if (activeTab === "availability") {
      fetchAvailability();
    }
  }, [activeTab, fetchAvailability]);

  async function handleSignOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleStatusUpdate(
    record: AppointmentRecord,
    newStatus: AppointmentStatus
  ) {
    setSavingId(record.id);
    setErrorBanner(null);
    try {
      const res = await fetch(`/api/admin/appointments/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, is_new: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorBanner(data.error || "Could not update status.");
        return;
      }

      if (selectedRecord?.id === record.id) {
        setSelectedRecord(data.appointment);
      }
      showToastMessage(
        `${record.inquiry_id} marked as ${newStatus.toUpperCase()}`
      );
      await fetchDashboard(true);
    } finally {
      setSavingId(null);
    }
  }

  async function handleSaveNotes() {
    if (!selectedRecord) return;
    setSavingId(selectedRecord.id);
    try {
      const res = await fetch(`/api/admin/appointments/${selectedRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internal_notes: notesDraft, is_new: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorBanner(data.error || "Failed to save internal notes.");
        return;
      }
      setSelectedRecord(data.appointment);
      showToastMessage("Internal notes saved.");
      await fetchDashboard(true);
    } finally {
      setSavingId(null);
    }
  }

  async function handleMarkNotificationsRead() {
    await fetch("/api/admin/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleToggleSlot(slot: AvailabilitySlot) {
    if (!slot.id) return;
    const nextActive = !slot.is_active;
    const res = await fetch("/api/admin/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: slot.id, is_active: nextActive }),
    });
    if (res.ok) {
      setAvailSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, is_active: nextActive } : s))
      );
      showToastMessage(
        `${slot.slot_label} ${nextActive ? "enabled" : "disabled"}.`
      );
    }
  }

  async function handleAddBlockedDate(e: FormEvent) {
    e.preventDefault();
    if (!newBlockedDate) return;
    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocked_date: newBlockedDate,
        reason: newBlockedReason || "Chamber Closed",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorBanner(data.error || "Could not block date.");
      return;
    }
    setBlockedDates((prev) => [...prev, data.blockedDate]);
    setNewBlockedDate("");
    showToastMessage(`Blocked ${data.blockedDate.blocked_date}.`);
  }

  async function handleRemoveBlockedDate(id: string) {
    const res = await fetch(`/api/admin/availability?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setBlockedDates((prev) => prev.filter((b) => b.id !== id));
      showToastMessage("Blocked date removed.");
    }
  }

  function handleOpenDetail(record: AppointmentRecord) {
    setSelectedRecord(record);
    setNotesDraft(record.internal_notes || "");
    if (record.is_new) {
      fetch(`/api/admin/appointments/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_new: false }),
      }).then(() => fetchDashboard(true));
    }
  }

  function handleExportCsv() {
    const headers = [
      "Inquiry ID",
      "Status",
      "Full Name",
      "Phone",
      "WhatsApp",
      "Email",
      "Client Type",
      "Service Category",
      "Consultation Type",
      "Preferred Date",
      "Preferred Time (BST)",
      "Description",
      "Internal Notes",
      "Lead Source",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "UTM Term",
      "UTM Content",
      "FBCLID",
      "GCLID",
      "Submitted At",
    ];

    const escapeCsv = (val: string | null | undefined) => {
      const s = (val ?? "").replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = appointments.map((r) => [
      r.inquiry_id,
      r.status,
      r.full_name,
      r.phone,
      r.whatsapp_number,
      r.email || "",
      r.client_type,
      r.service_category,
      r.consultation_type,
      r.preferred_date,
      r.preferred_time,
      r.description,
      r.internal_notes,
      r.lead_source,
      r.utm_source || "",
      r.utm_medium || "",
      r.utm_campaign || "",
      r.utm_term || "",
      r.utm_content || "",
      r.fbclid || "",
      r.gclid || "",
      r.created_at,
    ]);

    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map((cell) => escapeCsv(String(cell))).join(","))
        .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `taxvat-lawaid-leads-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToastMessage(`Exported ${appointments.length} records to CSV.`);
  }

  function buildClientWhatsAppConfirmUrl(r: AppointmentRecord) {
    const digits = r.whatsapp_number.replace(/\D/g, "");
    const msg =
      r.status === "confirmed"
        ? `Assalamu Alaikum ${r.full_name},\n\nYour appointment with TaxVat LawAid (Advocate Hossain Ahmed Khan) is CONFIRMED.\n• Inquiry ID: ${r.inquiry_id}\n• Service: ${r.service_category}\n• Mode: ${r.consultation_type}\n• Date & Time: ${r.preferred_date} at ${r.preferred_time} (BST)\n• Chamber: ${FIRM_INFO.address.full}\n\nPlease bring or share relevant documents prior to the session.`
        : `Assalamu Alaikum ${r.full_name},\n\nRegarding your TaxVat LawAid inquiry (${r.inquiry_id}) for ${r.service_category} requested on ${r.preferred_date} at ${r.preferred_time} (BST).`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#F6F7FC] text-[#1E2438]">
      {/* TOP ADMIN NAVBAR */}
      <header className="sticky top-0 z-30 bg-[#1B1E59] text-white border-b border-white/10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo variant="dark" compact />
            <span className="hidden md:inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-[#E0B437]">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((v) => !v)}
                aria-label="Notifications"
                className="relative rounded-xl bg-white/10 hover:bg-white/20 p-2.5 transition cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#CC242B] px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {showNotifications ? (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white text-slate-800 shadow-xl ring-1 ring-slate-200 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-[#F6F7FC]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1B1E59]">
                      Chamber Alerts ({unreadCount} unread)
                    </span>
                    {unreadCount > 0 ? (
                      <button
                        type="button"
                        onClick={handleMarkNotificationsRead}
                        className="text-xs font-semibold text-[#2B2E7E] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    ) : null}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-5 text-center text-xs text-slate-500">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 text-xs ${n.is_read ? "bg-white" : "bg-[#EEF0FA]/60"
                            }`}
                        >
                          <p className="font-bold text-[#1B1E59]">{n.title}</p>
                          <p className="mt-0.5 text-slate-600">{n.message}</p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {new Date(n.created_at).toLocaleString("en-GB", {
                              timeZone: "Asia/Dhaka",
                            })}{" "}
                            BST
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-semibold transition"
            >
              <span>Landing Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <div className="hidden md:block text-right leading-tight">
              <p className="text-xs font-semibold text-white">{adminName}</p>
              <p className="text-[11px] text-slate-300">
                {adminEmail} • {adminRole}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#CC242B] hover:bg-[#A81B21] px-3 py-2 text-xs font-semibold text-white transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#1B1E59] px-4 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-white/15">
          <CheckCircle2 className="h-4 w-4 text-[#45B049]" />
          <span>{toast}</span>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* TOP ACTION BAR + TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B1E59]">
              Leads &amp; Appointments Console
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Live MongoDB Atlas records • Asia/Dhaka (BST) Chamber Desk
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-xl bg-white p-1 shadow-2xs ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("leads")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${activeTab === "leads"
                    ? "bg-[#2B2E7E] text-white"
                    : "text-slate-600 hover:text-[#1B1E59]"
                  }`}
              >
                <Users className="h-3.5 w-3.5" />
                Leads &amp; Bookings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("availability")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${activeTab === "availability"
                    ? "bg-[#2B2E7E] text-white"
                    : "text-slate-600 hover:text-[#1B1E59]"
                  }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Availability &amp; Holidays
              </button>
            </div>

            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-[#1B1E59] ring-1 ring-slate-200 cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            {activeTab === "leads" ? (
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={appointments.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#45B049] hover:bg-[#359639] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV ({appointments.length})
              </button>
            ) : null}
          </div>
        </div>

        {errorBanner ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#FDF1F2] border border-[#CC242B]/30 px-4 py-3 text-sm text-[#991B1F]">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#CC242B]" />
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="p-1 hover:bg-[#CC242B]/10 rounded cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {/* KPI OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Total Leads"
            value={stats.total}
            icon={<Users className="h-4 w-4 text-[#2B2E7E]" />}
            accent="navy"
            active={statusFilter === "all"}
            onClick={() => {
              setActiveTab("leads");
              setStatusFilter("all");
            }}
          />
          <KpiCard
            label="New Inquiries"
            value={stats.newInquiries}
            icon={<Sparkles className="h-4 w-4 text-[#CC242B]" />}
            accent="red"
            active={statusFilter === "new_only"}
            onClick={() => {
              setActiveTab("leads");
              setStatusFilter("new_only");
            }}
          />
          <KpiCard
            label="Pending Approval"
            value={stats.pending}
            icon={<Clock className="h-4 w-4 text-[#C99A1E]" />}
            accent="gold"
            active={statusFilter === "pending"}
            onClick={() => {
              setActiveTab("leads");
              setStatusFilter("pending");
            }}
          />
          <KpiCard
            label="Confirmed"
            value={stats.confirmed}
            icon={<CheckCircle2 className="h-4 w-4 text-[#45B049]" />}
            accent="green"
            active={statusFilter === "confirmed"}
            onClick={() => {
              setActiveTab("leads");
              setStatusFilter("confirmed");
            }}
          />
          <KpiCard
            label="Completed"
            value={stats.completed}
            icon={<Calendar className="h-4 w-4 text-slate-600" />}
            accent="slate"
            active={statusFilter === "completed"}
            onClick={() => {
              setActiveTab("leads");
              setStatusFilter("completed");
            }}
          />
        </div>

        {activeTab === "leads" ? (
          <>
            {/* SEARCH & FILTER BAR */}
            <div className="rounded-2xl bg-white p-4 shadow-2xs ring-1 ring-slate-200/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              <div className="relative lg:col-span-4">
                <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Inquiry ID, name, phone, email, UTM..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F6F7FC] pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2B2E7E] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="lg:col-span-2 flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-[#2B2E7E] focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="new_only">New Inquiries Only</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="lg:col-span-4">
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-[#2B2E7E] focus:outline-none"
                >
                  <option value="all">All Service Categories</option>
                  {SERVICE_CATEGORIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-[#2B2E7E] focus:outline-none"
                >
                  <option value="all">All Lead Sources</option>
                  {distinctSources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LEADS & APPOINTMENTS TABLE */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/90 overflow-hidden">
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="h-7 w-7 animate-spin text-[#2B2E7E]" />
                  <p className="text-sm font-medium">
                    Loading real MongoDB leads...
                  </p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="py-16 text-center px-6">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="mt-3 font-serif text-lg font-bold text-[#1B1E59]">
                    No Matching Leads Found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    New client appointment submissions from your landing page will appear
                    here automatically.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F6F7FC] border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4">Inquiry ID</th>
                        <th className="py-3.5 px-4">Client</th>
                        <th className="py-3.5 px-4">Service &amp; Mode</th>
                        <th className="py-3.5 px-4">Requested Slot (BST)</th>
                        <th className="py-3.5 px-4">Source / UTM</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {appointments.map((item) => {
                        const busy = savingId === item.id;
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-[#F6F7FC]/70 transition ${item.is_new ? "bg-[#EEF0FA]/35" : ""
                              }`}
                          >
                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {item.is_new ? (
                                  <span
                                    title="New unread inquiry"
                                    className="h-2 w-2 rounded-full bg-[#CC242B]"
                                  />
                                ) : null}
                                <span className="font-mono text-xs font-bold text-[#2B2E7E]">
                                  {item.inquiry_id}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {new Date(item.created_at).toLocaleDateString(
                                  "en-GB",
                                  { timeZone: "Asia/Dhaka" }
                                )}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <p className="font-semibold text-[#1B1E59]">
                                {item.full_name}
                              </p>
                              <p className="text-xs text-slate-600">{item.phone}</p>
                              <p className="text-[11px] text-slate-400">
                                {item.client_type}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 align-top max-w-xs">
                              <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                                {item.service_category}
                              </p>
                              <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                {item.consultation_type}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <p className="text-xs font-bold text-[#1B1E59]">
                                {item.preferred_date}
                              </p>
                              <p className="text-xs text-slate-600">
                                {item.preferred_time}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <span className="inline-block rounded-md bg-[#EEF0FA] px-2 py-0.5 text-[11px] font-semibold text-[#2B2E7E]">
                                {item.lead_source}
                              </span>
                              {item.utm_campaign ? (
                                <p className="mt-0.5 text-[11px] text-slate-500 max-w-[140px] truncate">
                                  {item.utm_campaign}
                                </p>
                              ) : null}
                            </td>

                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <StatusBadge status={item.status} />
                            </td>

                            <td className="py-3.5 px-4 align-top whitespace-nowrap text-right">
                              <div className="inline-flex items-center gap-1.5">
                                {item.status === "pending" ||
                                  item.status === "new" ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() =>
                                        handleStatusUpdate(item, "confirmed")
                                      }
                                      title="Confirm Appointment"
                                      className="inline-flex items-center gap-1 rounded-lg bg-[#45B049] hover:bg-[#359639] px-2.5 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() =>
                                        handleStatusUpdate(item, "rejected")
                                      }
                                      title="Reject Appointment"
                                      className="inline-flex items-center gap-1 rounded-lg bg-[#FDF1F2] hover:bg-[#CC242B] text-[#CC242B] hover:text-white px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      Reject
                                    </button>
                                  </>
                                ) : null}

                                {item.status === "confirmed" ? (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                      handleStatusUpdate(item, "completed")
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg bg-[#2B2E7E] hover:bg-[#1B1E59] px-2.5 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                                  >
                                    Complete
                                  </button>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() => handleOpenDetail(item)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-[#1B1E59] transition cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* AVAILABILITY & HOLIDAYS MANAGEMENT TAB */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Weekly Chamber Slots */}
            <div className="lg:col-span-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/90">
              <h2 className="font-serif text-xl font-bold text-[#1B1E59]">
                Weekly Consultation Slots (Sun – Thu, 3:00 PM – 8:00 PM BST)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Click any slot to enable or disable it on the public booking form.
              </p>

              {availLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#2B2E7E]" />
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  {[0, 1, 2, 3, 4].map((dow) => {
                    const daySlots = availSlots.filter(
                      (s) => s.day_of_week === dow
                    );
                    return (
                      <div
                        key={dow}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <p className="text-sm font-bold text-[#1B1E59] mb-3">
                          {DAY_NAMES[dow]}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {daySlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => handleToggleSlot(slot)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition cursor-pointer ${slot.is_active
                                  ? "bg-[#EEF9EF] border-[#45B049]/40 text-[#247A28]"
                                  : "bg-slate-100 border-slate-200 text-slate-400 line-through"
                                }`}
                            >
                              {slot.slot_label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Blocked Dates / Public Holidays */}
            <div className="lg:col-span-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/90 h-fit">
              <h2 className="font-serif text-xl font-bold text-[#1B1E59]">
                Blocked Dates &amp; Holidays
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Block public holidays or court recess dates from receiving online
                bookings.
              </p>

              <form onSubmit={handleAddBlockedDate} className="mt-4 space-y-3">
                <input
                  type="date"
                  required
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
                <input
                  type="text"
                  required
                  value={newBlockedReason}
                  onChange={(e) => setNewBlockedReason(e.target.value)}
                  placeholder="Reason (e.g., Eid Holiday, Court Vacation)"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2B2E7E] hover:bg-[#1B1E59] px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Block Date
                </button>
              </form>

              <div className="mt-5 divide-y divide-slate-100 border-t border-slate-200">
                {blockedDates.length === 0 ? (
                  <p className="py-4 text-xs text-slate-400 text-center">
                    No blocked dates configured.
                  </p>
                ) : (
                  blockedDates.map((bd) => (
                    <div
                      key={bd.id}
                      className="py-3 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#1B1E59]">
                          {bd.blocked_date}
                        </p>
                        <p className="text-slate-500">{bd.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlockedDate(bd.id)}
                        className="p-1.5 text-slate-400 hover:text-[#CC242B] cursor-pointer"
                        title="Remove blocked date"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CLIENT DETAIL SLIDE-OVER MODAL */}
      {selectedRecord ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 z-10 bg-[#1B1E59] text-white px-6 py-5 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#E0B437] font-bold">
                  {selectedRecord.inquiry_id}
                </p>
                <h2 className="font-serif text-xl font-bold">
                  {selectedRecord.full_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg bg-white/10 hover:bg-white/20 p-2 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Status & Quick Workflow Actions */}
              <div className="rounded-xl bg-[#F6F7FC] p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Current Status
                  </span>
                  <StatusBadge status={selectedRecord.status} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { s: "confirmed", label: "Confirm", cls: "bg-[#45B049] text-white" },
                      { s: "completed", label: "Complete", cls: "bg-[#2B2E7E] text-white" },
                      { s: "pending", label: "Set Pending", cls: "bg-[#FBF6E6] text-[#9A720F]" },
                      { s: "rejected", label: "Reject", cls: "bg-[#FDF1F2] text-[#CC242B]" },
                      { s: "cancelled", label: "Cancel", cls: "bg-slate-200 text-slate-700" },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.s}
                      type="button"
                      disabled={savingId === selectedRecord.id}
                      onClick={() => handleStatusUpdate(selectedRecord, btn.s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${btn.cls}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Direct Outreach */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${selectedRecord.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EEF0FA] hover:bg-[#2B2E7E] text-[#1B1E59] hover:text-white py-2.5 px-3 text-xs font-semibold transition"
                >
                  <Phone className="h-4 w-4" />
                  Call {selectedRecord.phone}
                </a>
                <a
                  href={buildClientWhatsAppConfirmUrl(selectedRecord)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#45B049] hover:bg-[#359639] text-white py-2.5 px-3 text-xs font-semibold transition"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp Client
                </a>
              </div>

              {/* Matter Summary */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <DetailField label="Client Type" value={selectedRecord.client_type} />
                <DetailField
                  label="Consultation Mode"
                  value={selectedRecord.consultation_type}
                />
                <DetailField
                  label="Preferred Slot (BST)"
                  value={`${selectedRecord.preferred_date} at ${selectedRecord.preferred_time}`}
                />
                <DetailField
                  label="WhatsApp / Email"
                  value={`${selectedRecord.whatsapp_number}${selectedRecord.email ? ` • ${selectedRecord.email}` : ""
                    }`}
                />
                <div className="sm:col-span-2">
                  <DetailField
                    label="Service Category"
                    value={selectedRecord.service_category}
                  />
                </div>
              </dl>

              {/* Brief Description */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Client Matter Description
                </p>
                <div className="mt-1.5 rounded-xl bg-[#F6F7FC] border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedRecord.description}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label
                  htmlFor="internal-notes"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Internal Chamber Notes (Private)
                </label>
                <textarea
                  id="internal-notes"
                  rows={4}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Record conflict check notes, documents requested, follow-up actions, or fee estimate..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                />
                <button
                  type="button"
                  disabled={savingId === selectedRecord.id}
                  onClick={handleSaveNotes}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#2B2E7E] hover:bg-[#1B1E59] px-4 py-2 text-xs font-semibold text-white transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Internal Notes
                </button>
              </div>

              {/* Ad Campaign & UTM Attribution */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                <p className="font-bold uppercase tracking-wider text-[#2B2E7E]">
                  Marketing &amp; UTM Attribution
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <p>
                    <strong>Lead Source:</strong> {selectedRecord.lead_source}
                  </p>
                  <p>
                    <strong>UTM Source:</strong> {selectedRecord.utm_source || "—"}
                  </p>
                  <p>
                    <strong>UTM Medium:</strong> {selectedRecord.utm_medium || "—"}
                  </p>
                  <p>
                    <strong>UTM Campaign:</strong>{" "}
                    {selectedRecord.utm_campaign || "—"}
                  </p>
                  <p>
                    <strong>UTM Term:</strong> {selectedRecord.utm_term || "—"}
                  </p>
                  <p>
                    <strong>UTM Content:</strong>{" "}
                    {selectedRecord.utm_content || "—"}
                  </p>
                  <p className="col-span-2 truncate">
                    <strong>FBCLID / GCLID:</strong>{" "}
                    {selectedRecord.fbclid || selectedRecord.gclid || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  accent,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "navy" | "red" | "gold" | "green" | "slate";
  active: boolean;
  onClick: () => void;
}) {
  const ringMap = {
    navy: active ? "ring-2 ring-[#2B2E7E]" : "ring-1 ring-slate-200",
    red: active ? "ring-2 ring-[#CC242B]" : "ring-1 ring-slate-200",
    gold: active ? "ring-2 ring-[#C99A1E]" : "ring-1 ring-slate-200",
    green: active ? "ring-2 ring-[#45B049]" : "ring-1 ring-slate-200",
    slate: active ? "ring-2 ring-slate-600" : "ring-1 ring-slate-200",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl bg-white p-4 sm:p-5 text-left shadow-2xs transition hover:shadow-sm cursor-pointer ${ringMap[accent]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        {icon}
      </div>
      <p className="mt-2 font-serif text-3xl font-bold text-[#1B1E59]">{value}</p>
    </button>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, string> = {
    new: "bg-[#EEF0FA] text-[#2B2E7E] ring-[#2B2E7E]/25",
    pending: "bg-[#FBF6E6] text-[#9A720F] ring-[#C99A1E]/35",
    confirmed: "bg-[#EEF9EF] text-[#247A28] ring-[#45B049]/35",
    completed: "bg-slate-100 text-slate-700 ring-slate-300",
    rejected: "bg-[#FDF1F2] text-[#CC242B] ring-[#CC242B]/30",
    cancelled: "bg-slate-100 text-slate-500 ring-slate-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ${map[status] || map.pending
        }`}
    >
      {status}
    </span>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-[#1B1E59] break-words">
        {value}
      </dd>
    </div>
  );
}
