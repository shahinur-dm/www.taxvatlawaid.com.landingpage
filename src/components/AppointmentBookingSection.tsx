"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Building2,
  Video,
  PhoneCall,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import {
  CLIENT_TYPES,
  CONSULTATION_TYPES,
  DEFAULT_TIME_SLOTS,
  FIRM_INFO,
  SERVICE_CATEGORIES,
  type Locale,
} from "@/data/firm";
import {
  getStoredAttribution,
  trackAppointmentSubmitted,
  trackPhoneClick,
  trackWhatsAppClick,
} from "@/lib/analytics";
import type { AvailabilitySlot } from "@/types/database";

interface AppointmentBookingSectionProps {
  locale: Locale;
  preselectedService?: string;
}

interface SubmittedReceipt {
  inquiry_id: string;
  full_name: string;
  service_category: string;
  consultation_type: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
}

interface StatusLookupResult {
  inquiry_id: string;
  service_category: string;
  consultation_type: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at: string;
}

/**
 * Generates the next N open chamber working days (Sunday–Thursday) in Asia/Dhaka timezone
 */
function getUpcomingWorkingDays(count = 7): Array<{
  iso: string;
  dayShort: string;
  dateLabel: string;
}> {
  const results: Array<{ iso: string; dayShort: string; dateLabel: string }> = [];
  const dhakaNowStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const [y, m, d] = dhakaNowStr.split("-").map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d, 6, 0, 0));

  for (let offset = 0; offset < 25 && results.length < count; offset++) {
    const dt = new Date(cursor.getTime() + offset * 86400000);
    const dow = dt.getUTCDay(); // 0=Sun .. 4=Thu
    if (dow >= 0 && dow <= 4) {
      const iso = dt.toISOString().slice(0, 10);
      const dayShort = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: "UTC",
      }).format(dt);
      const dateLabel = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }).format(dt);
      results.push({ iso, dayShort, dateLabel });
    }
  }
  return results;
}

export function AppointmentBookingSection({
  locale,
  preselectedService,
}: AppointmentBookingSectionProps) {
  const isBn = locale === "bn";
  const workingDays = useMemo(() => getUpcomingWorkingDays(7), []);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [clientType, setClientType] = useState<string>(CLIENT_TYPES[0]);
  const [serviceCategory, setServiceCategory] = useState<string>(
    preselectedService || SERVICE_CATEGORIES[0]
  );
  const [consultationType, setConsultationType] = useState<
    "Chamber Visit" | "Video Call" | "Phone Call"
  >("Chamber Visit");
  const [preferredDate, setPreferredDate] = useState<string>(
    workingDays[0]?.iso || ""
  );
  const [preferredTime, setPreferredTime] = useState<string>("");
  const [description, setDescription] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Availability states
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [receipt, setReceipt] = useState<SubmittedReceipt | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Inquiry status lookup states
  const [lookupId, setLookupId] = useState("");
  const [lookupLast4, setLookupLast4] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<StatusLookupResult | null>(null);

  // Sync preselected service from service card clicks
  useEffect(() => {
    if (preselectedService) {
      setServiceCategory(preselectedService);
    }
  }, [preselectedService]);

  // Fetch live slot availability whenever preferredDate changes
  useEffect(() => {
    if (!preferredDate) return;
    let cancelled = false;

    async function loadAvailability() {
      setLoadingSlots(true);
      setDateWarning(null);
      try {
        const res = await fetch(
          `/api/availability?date=${encodeURIComponent(preferredDate)}`
        );
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setDateWarning(data.error || "Unable to verify slot availability.");
          setSlots([]);
          setPreferredTime("");
          return;
        }

        if (data.blockedReason) {
          setDateWarning(data.blockedReason);
          setSlots([]);
          setPreferredTime("");
          return;
        }

        const loaded: AvailabilitySlot[] = data.slots || [];
        setSlots(loaded);

        // Select first available slot if current selection is not available
        const stillValid = loaded.find(
          (s) => s.slot_label === preferredTime && s.is_available
        );
        if (!stillValid) {
          const firstOpen = loaded.find((s) => s.is_available);
          setPreferredTime(firstOpen ? firstOpen.slot_label : "");
        }
      } catch {
        if (!cancelled) {
          setSlots(
            DEFAULT_TIME_SLOTS.map((s) => ({
              ...s,
              max_bookings: 1,
              booked_count: 0,
              is_available: true,
            }))
          );
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    loadAvailability();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredDate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    const attribution = getStoredAttribution();
    const effectiveWhatsapp = sameAsPhone ? phone : whatsappNumber;

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          whatsappNumber: effectiveWhatsapp,
          email: email.trim(),
          clientType,
          serviceCategory,
          consultationType,
          preferredDate,
          preferredTime,
          description,
          privacyConsent,
          website_hp: honeypot,
          ...attribution,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error || "Unable to submit your request. Please check your details."
        );
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        return;
      }

      const saved: SubmittedReceipt = data.appointment;
      setReceipt(saved);

      // Fire Meta Pixel, GA4 & Google Ads conversion tracking
      trackAppointmentSubmitted({
        inquiryId: saved.inquiry_id,
        serviceCategory: saved.service_category,
        consultationType: saved.consultation_type,
        clientType,
      });
    } catch {
      setErrorMessage(
        "Network error while submitting your request. Please try again or reach our chamber on WhatsApp (+880 1614-446444)."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusLookup(e: FormEvent) {
    e.preventDefault();
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(
        `/api/appointments/status?inquiryId=${encodeURIComponent(
          lookupId.trim()
        )}&phoneLast4=${encodeURIComponent(lookupLast4.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || "Could not find this inquiry.");
        return;
      }
      setLookupResult(data.inquiry);
    } catch {
      setLookupError("Unable to verify status right now. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  }

  function handleCopyInquiryId(id: string) {
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  function buildReceiptWhatsAppLink(r: SubmittedReceipt) {
    const msg = [
      `Hello TaxVat LawAid Chamber Desk,`,
      `I have submitted a consultation request:`,
      `• Inquiry ID: ${r.inquiry_id}`,
      `• Name: ${r.full_name}`,
      `• Service: ${r.service_category}`,
      `• Mode: ${r.consultation_type}`,
      `• Preferred Slot: ${r.preferred_date} at ${r.preferred_time} (BST)`,
      `• Status: Pending Admin Approval`,
      `Please confirm my appointment slot.`,
    ].join("\n");
    return `https://wa.me/${FIRM_INFO.whatsapp.raw}?text=${encodeURIComponent(msg)}`;
  }

  function resetForm() {
    setReceipt(null);
    setFullName("");
    setPhone("");
    setWhatsappNumber("");
    setSameAsPhone(true);
    setEmail("");
    setDescription("");
    setPrivacyConsent(false);
    setErrorMessage(null);
    setFieldErrors({});
  }

  return (
    <section
      id="appointment"
      className="relative py-20 lg:py-24 bg-[#F6F7FC] border-t border-slate-200/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#2B2E7E] shadow-xs ring-1 ring-[#2B2E7E]/15">
            <Calendar className="h-3.5 w-3.5 text-[#CC242B]" />
            {isBn ? "অ্যাপয়েন্টমেন্ট বুকিং ডেস্ক" : "Chamber Appointment Desk"}
          </span>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1B1E59]">
            {isBn
              ? "আইনি ও কর পরামর্শের জন্য অ্যাপয়েন্টমেন্ট বুক করুন"
              : "Book Your Legal & Tax Consultation"}
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            {isBn
              ? "রবিবার থেকে বৃহস্পতিবার (বিকাল ৩:০০ – রাত ৮:০০, বাংলাদেশ সময়) চেম্বারে সরাসরি সাক্ষাৎ, ভিডিও কল অথবা ফোন কনসালটেশনের জন্য অনুরোধ পাঠান।"
              : "Request an in-person consultation at our Ramna, Dhaka chamber, a Video Call, or a direct Phone Consultation during chamber hours (Sunday – Thursday, 3:00 PM – 8:00 PM BST)."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Chamber Intake Protocol + Direct Contact + Status Check */}
          <div className="lg:col-span-4 space-y-6">
            {/* Chamber Verification Notice */}
            <div className="rounded-2xl bg-[#1B1E59] p-6 sm:p-7 text-white shadow-lg">
              <div className="flex items-center gap-2.5 text-[#E0B437] text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                {isBn ? "চেম্বার যাচাইকরণ প্রক্রিয়া" : "Chamber Verification Protocol"}
              </div>
              <h3 className="mt-2 font-serif text-xl font-semibold text-white">
                {isBn ? "আবেদনের পর কী হবে?" : "What Happens After You Submit?"}
              </h3>
              <ol className="mt-5 space-y-4 text-sm text-slate-200">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-[#E0B437]">
                    1
                  </span>
                  <span>
                    {isBn
                      ? "আপনি তাৎক্ষণিক একটি ইউনিক ইনকোয়ারি আইডি পাবেন এবং আপনার অনুরোধ 'অপেক্ষমাণ (Pending)' হিসেবে নথিভুক্ত হবে।"
                      : "You immediately receive a unique Inquiry ID with status 'Pending Chamber Approval' — appointments are never auto-confirmed without review."}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-[#E0B437]">
                    2
                  </span>
                  <span>
                    {isBn
                      ? "অ্যাডভোকেট হোসাইন আহমেদ (খান)-এর চেম্বার ডেস্ক আপনার বিষয়টি পর্যালোচনা করে ফোন বা হোয়াটসঅ্যাপে সময় নিশ্চিত করবে।"
                      : "Advocate Hossain Ahmed (Khan)'s chamber desk reviews your request and confirms your slot via phone or WhatsApp."}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-[#E0B437]">
                    3
                  </span>
                  <span>
                    {isBn
                      ? "নিশ্চিতকরণের সময় আপনাকে প্রয়োজনীয় নথিপত্রের তালিকা জানিয়ে দেওয়া হবে।"
                      : "We also advise which notices, returns, or corporate records to bring or share ahead of your consultation."}
                  </span>
                </li>
              </ol>

              {/* Urgent Notice Direct Buttons */}
              <div className="mt-6 pt-5 border-t border-white/15 space-y-2.5">
                <p className="text-xs font-medium text-slate-300">
                  {isBn
                    ? "জরুরি আয়কর, ভ্যাট বা আদালত নোটিশের জন্য সরাসরি যোগাযোগ:"
                    : "Urgent statutory notice or court deadline?"}
                </p>
                <a
                  href={`tel:${FIRM_INFO.phones[0].tel}`}
                  onClick={() =>
                    trackPhoneClick(FIRM_INFO.phones[0].display, "booking_sidebar")
                  }
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-sm font-semibold text-white transition"
                >
                  <Phone className="h-4 w-4 text-[#E0B437]" />
                  {FIRM_INFO.phones[0].display} / 01343-226633
                </a>
                <a
                  href={FIRM_INFO.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick("booking_sidebar")}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#45B049] hover:bg-[#359639] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                  <MessageSquare className="h-4 w-4" />
                  {isBn ? "হোয়াটসঅ্যাপ চেম্বার ডেস্ক" : "WhatsApp Chamber Desk"}
                </a>
              </div>
            </div>

            {/* Check Existing Inquiry Status Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/90">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1B1E59]">
                <Search className="h-4 w-4 text-[#2B2E7E]" />
                {isBn
                  ? "পূর্বের অ্যাপয়েন্টমেন্ট স্ট্যাটাস যাচাই করুন"
                  : "Check Your Inquiry Status"}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {isBn
                  ? "আপনার ইনকোয়ারি আইডি ও মোবাইল নম্বরের শেষ ৪টি সংখ্যা দিন।"
                  : "Enter your Inquiry ID and the last 4 digits of your phone number."}
              </p>

              <form onSubmit={handleStatusLookup} className="mt-4 space-y-3">
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="TVLA-20261118-XXXXXX"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={lookupLast4}
                    onChange={(e) =>
                      setLookupLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder={isBn ? "শেষ ৪ সংখ্যা" : "Last 4 digits"}
                    required
                    className="w-36 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                  />
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2B2E7E] hover:bg-[#1B1E59] px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 cursor-pointer"
                  >
                    {lookupLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>{isBn ? "যাচাই করুন" : "Check"}</span>
                    )}
                  </button>
                </div>
              </form>

              {lookupError ? (
                <p className="mt-3 text-xs font-medium text-[#CC242B]">
                  {lookupError}
                </p>
              ) : null}

              {lookupResult ? (
                <div className="mt-4 rounded-xl bg-[#F6F7FC] p-3.5 text-xs border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#1B1E59]">
                      {lookupResult.inquiry_id}
                    </span>
                    <StatusPill status={lookupResult.status} />
                  </div>
                  <p className="text-slate-700 font-medium">
                    {lookupResult.service_category}
                  </p>
                  <p className="text-slate-500">
                    {lookupResult.preferred_date} • {lookupResult.preferred_time} (BST) •{" "}
                    {lookupResult.consultation_type}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* RIGHT COLUMN: Full 11-Field Appointment Booking Form OR Confirmation Slip */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl bg-white p-6 sm:p-8 lg:p-10 shadow-md ring-1 ring-slate-200/90">
              {receipt ? (
                /* SUCCESSFUL SUBMISSION RECEIPT */
                <div className="py-4 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-200">
                    <div className="mx-auto sm:mx-0 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF9EF] text-[#45B049]">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBF6E6] px-3 py-1 text-xs font-semibold text-[#9A720F] ring-1 ring-[#C99A1E]/30">
                        <Clock className="h-3.5 w-3.5" />
                        {isBn
                          ? "স্ট্যাটাস: চেম্বার অনুমোদনের অপেক্ষায় (Pending)"
                          : "Status: Pending Chamber Approval"}
                      </span>
                      <h3 className="mt-2 font-serif text-2xl font-bold text-[#1B1E59]">
                        {isBn
                          ? "আপনার অ্যাপয়েন্টমেন্ট অনুরোধ গৃহীত হয়েছে"
                          : "Consultation Request Received"}
                      </h3>
                    </div>
                  </div>

                  {/* Unique Inquiry ID Box */}
                  <div className="mt-6 rounded-xl bg-[#F6F7FC] border border-[#2B2E7E]/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {isBn ? "আপনার ইউনিক ইনকোয়ারি আইডি" : "Your Unique Inquiry ID"}
                      </p>
                      <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-[#2B2E7E]">
                        {receipt.inquiry_id}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyInquiryId(receipt.inquiry_id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1B1E59] shadow-xs ring-1 ring-slate-300 hover:bg-slate-50 transition cursor-pointer"
                    >
                      {copiedId ? (
                        <>
                          <Check className="h-4 w-4 text-[#45B049]" />
                          {isBn ? "কপি হয়েছে" : "Copied"}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          {isBn ? "আইডি কপি করুন" : "Copy Reference ID"}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Summary Details */}
                  <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <dt className="text-xs font-medium text-slate-500">
                        {isBn ? "আবেদনকারীর নাম" : "Applicant"}
                      </dt>
                      <dd className="mt-1 font-semibold text-[#1B1E59]">
                        {receipt.full_name}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <dt className="text-xs font-medium text-slate-500">
                        {isBn ? "পরামর্শের মাধ্যম" : "Consultation Mode"}
                      </dt>
                      <dd className="mt-1 font-semibold text-[#1B1E59]">
                        {receipt.consultation_type}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                      <dt className="text-xs font-medium text-slate-500">
                        {isBn ? "সেবার ধরন" : "Service Category"}
                      </dt>
                      <dd className="mt-1 font-semibold text-[#1B1E59]">
                        {receipt.service_category}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                      <dt className="text-xs font-medium text-slate-500">
                        {isBn ? "পছন্দের তারিখ ও সময়" : "Requested Date & Time"}
                      </dt>
                      <dd className="mt-1 font-semibold text-[#1B1E59]">
                        {receipt.preferred_date} • {receipt.preferred_time} (Asia/Dhaka BST)
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-5 text-sm text-slate-600 leading-relaxed">
                    {isBn
                      ? "আমাদের রমনা চেম্বার ডেস্ক আপনার অনুরোধটি যাচাই করে শীঘ্রই ফোন বা হোয়াটসঅ্যাপের মাধ্যমে চূড়ান্ত নিশ্চিতকরণ জানাবে। দ্রুত সমন্বয়ের জন্য নিচের বাটনে ক্লিক করে আপনার ইনকোয়ারি স্লিপটি হোয়াটসঅ্যাপে পাঠাতে পারেন।"
                      : "Please note that your appointment is currently Pending until verified by our Ramna chamber desk. For faster coordination, you can forward your inquiry summary directly to our official WhatsApp desk below."}
                  </p>

                  <div className="mt-7 flex flex-col sm:flex-row gap-3">
                    <a
                      href={buildReceiptWhatsAppLink(receipt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick("booking_confirmation_slip")}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#45B049] hover:bg-[#359639] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {isBn
                        ? "হোয়াটসঅ্যাপে ইনকোয়ারি স্লিপ পাঠান"
                        : "Send Inquiry Slip via WhatsApp"}
                    </a>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-3.5 text-sm font-semibold text-[#1B1E59] transition cursor-pointer"
                    >
                      {isBn ? "নতুন অনুরোধ জমা দিন" : "Submit Another Request"}
                    </button>
                  </div>
                </div>
              ) : (
                /* APPOINTMENT REQUEST FORM */
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1E59]">
                        {isBn
                          ? "পরামর্শের জন্য তথ্য পূরণ করুন"
                          : "Request an Appointment"}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {isBn
                          ? "সকল তথ্য সম্পূর্ণ গোপনীয়তার সাথে সংরক্ষণ করা হয়। সময় অঞ্চল: Asia/Dhaka (BST)"
                          : "All inquiries are treated with strict legal confidentiality. Timezone: Asia/Dhaka (BST)"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEF0FA] px-3 py-1.5 text-xs font-semibold text-[#2B2E7E]">
                      <Clock className="h-3.5 w-3.5" />
                      Sun–Thu • 3–8 PM BST
                    </span>
                  </div>

                  {/* Honeypot field hidden from human users */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website_hp">Website</label>
                    <input
                      id="website_hp"
                      name="website_hp"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {errorMessage ? (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl bg-[#FDF1F2] border border-[#CC242B]/25 p-4 text-sm text-[#991B1F]"
                    >
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-[#CC242B]" />
                      <div>
                        <p className="font-semibold">{errorMessage}</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Row 1: Full Name & Client Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-semibold text-[#1B1E59]"
                      >
                        {isBn ? "পূর্ণ নাম / প্রতিষ্ঠানের নাম" : "Full Name / Company"}{" "}
                        <span className="text-[#CC242B]">*</span>
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={
                          isBn
                            ? "যেমন: মোঃ রফিকুল ইসলাম / এবিসি লিমিটেড"
                            : "e.g., Md. Rafiqul Islam / ABC Trading Ltd."
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                      />
                      {fieldErrors.fullName?.[0] ? (
                        <p className="mt-1 text-xs text-[#CC242B]">
                          {fieldErrors.fullName[0]}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label
                        htmlFor="clientType"
                        className="block text-sm font-semibold text-[#1B1E59]"
                      >
                        {isBn ? "ক্লায়েন্টের ধরন" : "Client Type"}{" "}
                        <span className="text-[#CC242B]">*</span>
                      </label>
                      <select
                        id="clientType"
                        required
                        value={clientType}
                        onChange={(e) => setClientType(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                      >
                        {CLIENT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Phone Number & WhatsApp Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-[#1B1E59]"
                      >
                        {isBn ? "মোবাইল নম্বর (+880)" : "Phone Number (+880)"}{" "}
                        <span className="text-[#CC242B]">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+880 17XX-XXXXXX"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                      />
                      {fieldErrors.phone?.[0] ? (
                        <p className="mt-1 text-xs text-[#CC242B]">
                          {fieldErrors.phone[0]}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="whatsappNumber"
                          className="block text-sm font-semibold text-[#1B1E59]"
                        >
                          {isBn ? "হোয়াটসঅ্যাপ নম্বর" : "WhatsApp Number"}{" "}
                          <span className="text-[#CC242B]">*</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameAsPhone}
                            onChange={(e) => setSameAsPhone(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-[#2B2E7E] focus:ring-[#2B2E7E]"
                          />
                          {isBn ? "মোবাইল নম্বরের মতোই" : "Same as Phone"}
                        </label>
                      </div>
                      <input
                        id="whatsappNumber"
                        type="tel"
                        required
                        disabled={sameAsPhone}
                        value={sameAsPhone ? phone : whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="+880 17XX-XXXXXX"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                      {fieldErrors.whatsappNumber?.[0] ? (
                        <p className="mt-1 text-xs text-[#CC242B]">
                          {fieldErrors.whatsappNumber[0]}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Row 3: Email & Service Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-[#1B1E59]"
                      >
                        {isBn ? "ইমেইল ঠিকানা (ঐচ্ছিক)" : "Email Address (Optional)"}
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                      />
                      {fieldErrors.email?.[0] ? (
                        <p className="mt-1 text-xs text-[#CC242B]">
                          {fieldErrors.email[0]}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label
                        htmlFor="serviceCategory"
                        className="block text-sm font-semibold text-[#1B1E59]"
                      >
                        {isBn ? "সেবার বিভাগ" : "Service Category"}{" "}
                        <span className="text-[#CC242B]">*</span>
                      </label>
                      <select
                        id="serviceCategory"
                        required
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                      >
                        {SERVICE_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Consultation Type */}
                  <div>
                    <span className="block text-sm font-semibold text-[#1B1E59]">
                      {isBn ? "পরামর্শের মাধ্যম নির্বাচন করুন" : "Consultation Type"}{" "}
                      <span className="text-[#CC242B]">*</span>
                    </span>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {CONSULTATION_TYPES.map((mode) => {
                        const active = consultationType === mode.value;
                        const Icon =
                          mode.value === "Chamber Visit"
                            ? Building2
                            : mode.value === "Video Call"
                              ? Video
                              : PhoneCall;
                        return (
                          <button
                            key={mode.value}
                            type="button"
                            onClick={() => setConsultationType(mode.value)}
                            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition cursor-pointer ${
                              active
                                ? "border-[#2B2E7E] bg-[#EEF0FA] ring-1 ring-[#2B2E7E]"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 shrink-0 mt-0.5 ${
                                active ? "text-[#2B2E7E]" : "text-slate-400"
                              }`}
                            />
                            <div>
                              <div
                                className={`text-sm font-semibold ${
                                  active ? "text-[#1B1E59]" : "text-slate-800"
                                }`}
                              >
                                {isBn ? mode.labelBn : mode.labelEn}
                              </div>
                              <div className="text-xs text-slate-500">
                                {isBn ? mode.subBn : mode.subEn}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 5: Preferred Date (Sun–Thu Quick Picker + Date Input) */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="preferredDate"
                        className="block text-sm font-semibold text-[#1B1E59]"
                      >
                        {isBn
                          ? "পছন্দের তারিখ (রবিবার – বৃহস্পতিবার)"
                          : "Preferred Date (Sunday – Thursday)"}{" "}
                        <span className="text-[#CC242B]">*</span>
                      </label>
                      <span className="text-xs text-slate-500">
                        {isBn ? "শুক্র ও শনি বন্ধ" : "Closed Fri & Sat • Asia/Dhaka"}
                      </span>
                    </div>

                    {/* Quick Working Day Chips */}
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-7 gap-2">
                      {workingDays.map((day) => {
                        const active = preferredDate === day.iso;
                        return (
                          <button
                            key={day.iso}
                            type="button"
                            onClick={() => setPreferredDate(day.iso)}
                            className={`rounded-xl border px-2 py-2.5 text-center transition cursor-pointer ${
                              active
                                ? "border-[#2B2E7E] bg-[#2B2E7E] text-white shadow-xs"
                                : "border-slate-200 bg-white text-slate-700 hover:border-[#2B2E7E]/40"
                            }`}
                          >
                            <div
                              className={`text-[11px] font-medium uppercase ${
                                active ? "text-slate-200" : "text-slate-500"
                              }`}
                            >
                              {day.dayShort}
                            </div>
                            <div className="text-xs font-bold mt-0.5">
                              {day.dateLabel}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Calendar Fallback */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {isBn ? "অথবা অন্য তারিখ বেছে নিন:" : "Or pick another date:"}
                      </span>
                      <input
                        id="preferredDate"
                        type="date"
                        required
                        min={workingDays[0]?.iso}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                      />
                    </div>
                    {fieldErrors.preferredDate?.[0] ? (
                      <p className="mt-1 text-xs text-[#CC242B]">
                        {fieldErrors.preferredDate[0]}
                      </p>
                    ) : null}
                  </div>

                  {/* Row 6: Preferred Time (Live Availability Slots) */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="block text-sm font-semibold text-[#1B1E59]">
                        {isBn
                          ? "পছন্দের সময় (বিকাল ৩:০০ – রাত ৮:০০ BST)"
                          : "Preferred Time Slot (3:00 PM – 8:00 PM BST)"}{" "}
                        <span className="text-[#CC242B]">*</span>
                      </span>
                      {loadingSlots ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Checking availability...
                        </span>
                      ) : null}
                    </div>

                    {dateWarning ? (
                      <div className="mt-2 rounded-xl bg-[#FBF6E6] border border-[#C99A1E]/30 px-4 py-3 text-xs font-medium text-[#8B6408]">
                        {dateWarning}
                      </div>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {slots.map((slot) => {
                          const selected = preferredTime === slot.slot_label;
                          const disabled = !slot.is_available;
                          return (
                            <button
                              key={slot.slot_time}
                              type="button"
                              disabled={disabled}
                              onClick={() => setPreferredTime(slot.slot_label)}
                              className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                                disabled
                                  ? "border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed"
                                  : selected
                                    ? "border-[#45B049] bg-[#45B049] text-white shadow-xs cursor-pointer"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-[#2B2E7E] cursor-pointer"
                              }`}
                            >
                              {slot.slot_label}
                              {disabled ? (
                                <span className="block text-[10px] font-normal no-underline">
                                  Reserved
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {fieldErrors.preferredTime?.[0] ? (
                      <p className="mt-1 text-xs text-[#CC242B]">
                        {fieldErrors.preferredTime[0]}
                      </p>
                    ) : null}
                  </div>

                  {/* Row 7: Brief Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-semibold text-[#1B1E59]"
                    >
                      {isBn
                        ? "আপনার বিষয়টি সংক্ষেপে লিখুন"
                        : "Brief Description of Your Matter"}{" "}
                      <span className="text-[#CC242B]">*</span>
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        isBn
                          ? "আপনার আয়কর/ভ্যাট নোটিশ, কোম্পানি নিবন্ধন, আপিল বা আইনি বিষয়টি সংক্ষেপে লিখুন..."
                          : "Briefly summarize your tax/VAT notice, RJSC incorporation, customs query, appeal deadline, or legal matter..."
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2B2E7E] focus:outline-none focus:ring-2 focus:ring-[#2B2E7E]/15"
                    />
                    {fieldErrors.description?.[0] ? (
                      <p className="mt-1 text-xs text-[#CC242B]">
                        {fieldErrors.description[0]}
                      </p>
                    ) : null}
                  </div>

                  {/* Row 8: Privacy Consent */}
                  <div className="rounded-xl bg-[#F6F7FC] p-4 border border-slate-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={privacyConsent}
                        onChange={(e) => setPrivacyConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2B2E7E] focus:ring-[#2B2E7E]"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        {isBn
                          ? "আমি সম্মতি দিচ্ছি যে TaxVat LawAid আমার প্রদত্ত তথ্য কেবলমাত্র অ্যাপয়েন্টমেন্ট যাচাইকরণ ও আইনি পরামর্শের সমন্বয়ের জন্য গোপনীয়তার সাথে ব্যবহার করবে। আমি বুঝি যে চেম্বার অনুমোদনের আগে এই আবেদন চূড়ান্ত নিশ্চিতকরণ নয় এবং এটি আইনজীবী-ক্লায়েন্ট সম্পর্ক তৈরি করে না।"
                          : "I consent to TaxVat LawAid securely storing and using my submitted information solely to review and coordinate my consultation request. I understand that submitting this form creates a Pending request awaiting chamber approval and does not establish a formal advocate-client engagement until confirmed."}
                      </span>
                    </label>
                    {fieldErrors.privacyConsent?.[0] ? (
                      <p className="mt-2 text-xs text-[#CC242B]">
                        {fieldErrors.privacyConsent[0]}
                      </p>
                    ) : null}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !preferredTime || Boolean(dateWarning)}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#CC242B] hover:bg-[#A81B21] px-6 py-4 text-base font-semibold text-white shadow-md shadow-[#CC242B]/20 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {isBn
                          ? "অনুরোধ জমা দেওয়া হচ্ছে..."
                          : "Submitting Appointment Request..."}
                      </>
                    ) : (
                      <>
                        <span>
                          {isBn
                            ? "অ্যাপয়েন্টমেন্ট অনুরোধ জমা দিন"
                            : "Submit Appointment Request"}
                        </span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-[#FBF6E6] text-[#9A720F] ring-[#C99A1E]/30",
    new: "bg-[#EEF0FA] text-[#2B2E7E] ring-[#2B2E7E]/25",
    confirmed: "bg-[#EEF9EF] text-[#247A28] ring-[#45B049]/35",
    completed: "bg-slate-100 text-slate-700 ring-slate-300",
    rejected: "bg-[#FDF1F2] text-[#CC242B] ring-[#CC242B]/30",
    cancelled: "bg-slate-100 text-slate-600 ring-slate-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}
