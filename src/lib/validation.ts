import { z } from "zod";
import {
  CLIENT_TYPES,
  SERVICE_CATEGORIES,
} from "@/data/firm";

/**
 * Normalizes Bangladeshi mobile numbers into standard +8801XXXXXXXXX format
 * Accepts: 01614446444, +8801614446444, 8801614446444, 01614-446444, etc.
 * Also permits valid international numbers (+ followed by 8–15 digits) for NRBs/foreign investors.
 */
export function normalizeBangladeshPhone(input: string): string {
  const cleaned = input.replace(/[\s\-().]/g, "");
  if (/^01[3-9]\d{8}$/.test(cleaned)) {
    return `+88${cleaned}`;
  }
  if (/^8801[3-9]\d{8}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  if (/^\+8801[3-9]\d{8}$/.test(cleaned)) {
    return cleaned;
  }
  if (/^\+\d{8,15}$/.test(cleaned)) {
    return cleaned;
  }
  return cleaned;
}

const phoneSchema = z
  .string()
  .trim()
  .min(10, "Please enter a valid Bangladesh mobile number (e.g., 01614446444 or +8801614446444)")
  .max(24, "Phone number is too long")
  .transform(normalizeBangladeshPhone)
  .refine(
    (val) => /^\+8801[3-9]\d{8}$/.test(val) || /^\+\d{8,15}$/.test(val),
    "Enter a valid Bangladesh (+8801XXXXXXXXX) or international phone number"
  );

export const APPOINTMENT_STATUSES = [
  "new",
  "pending",
  "confirmed",
  "completed",
  "rejected",
  "cancelled",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const appointmentRequestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "Name must be under 120 characters"),
  phone: phoneSchema,
  whatsappNumber: phoneSchema,
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(160)
    .optional()
    .or(z.literal("")),
  clientType: z.enum(CLIENT_TYPES, {
    errorMap: () => ({ message: "Please select your client type" }),
  }),
  serviceCategory: z.enum(SERVICE_CATEGORIES, {
    errorMap: () => ({ message: "Please select a service category" }),
  }),
  consultationType: z.enum(["Chamber Visit", "Video Call", "Phone Call"], {
    errorMap: () => ({ message: "Please choose a consultation mode" }),
  }),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid consultation date"),
  preferredTime: z
    .string()
    .trim()
    .min(3, "Please select a preferred time slot")
    .max(30),
  description: z
    .string()
    .trim()
    .min(10, "Please briefly describe your legal or tax requirement (at least 10 characters)")
    .max(2000, "Description must be under 2,000 characters"),
  privacyConsent: z.literal(true, {
    errorMap: () => ({
      message: "Please confirm privacy consent to submit your appointment request",
    }),
  }),
  // Hidden attribution / UTM tracking fields
  leadSource: z.string().trim().max(100).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(160).optional(),
  utmTerm: z.string().trim().max(160).optional(),
  utmContent: z.string().trim().max(160).optional(),
  fbclid: z.string().trim().max(240).optional(),
  gclid: z.string().trim().max(240).optional(),
  referrerUrl: z.string().trim().max(500).optional(),
  landingPageUrl: z.string().trim().max(500).optional(),
  // Anti-spam honeypot (must stay empty)
  website_hp: z.string().max(0).optional(),
});

export type AppointmentRequestInput = z.infer<typeof appointmentRequestSchema>;

export const adminUpdateAppointmentSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  internal_notes: z.string().max(4000).optional(),
  is_new: z.boolean().optional(),
  preferred_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  preferred_time: z.string().trim().min(3).max(30).optional(),
});

export const inquiryStatusLookupSchema = z.object({
  inquiryId: z
    .string()
    .trim()
    .min(6, "Enter your Inquiry ID (e.g., TVLA-20261118-XXXXXX)")
    .max(40),
  phoneLast4: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Enter the last 4 digits of your phone number"),
});

export const blockedDateSchema = z.object({
  blocked_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  reason: z.string().trim().min(2).max(160).default("Chamber Closed"),
});

/**
 * Generates a unique, human-readable TaxVat LawAid inquiry ID in Asia/Dhaka date format:
 * e.g. TVLA-20261118-K9M4P2
 */
export function generateInquiryId(): string {
  const nowDhaka = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
  );
  const y = nowDhaka.getFullYear();
  const m = String(nowDhaka.getMonth() + 1).padStart(2, "0");
  const d = String(nowDhaka.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TVLA-${y}${m}${d}-${suffix}`;
}

/**
 * Derives a clean lead_source classification from UTM params, click IDs, or referrer
 */
export function deriveLeadSource(input: {
  leadSource?: string;
  utmSource?: string;
  fbclid?: string;
  gclid?: string;
  referrerUrl?: string;
}): string {
  if (input.utmSource) return input.utmSource.toLowerCase();
  if (input.fbclid) return "facebook_ads";
  if (input.gclid) return "google_ads";
  if (input.leadSource) return input.leadSource.toLowerCase();
  if (input.referrerUrl) {
    try {
      const host = new URL(input.referrerUrl).hostname.toLowerCase();
      if (host.includes("facebook") || host.includes("fb.") || host.includes("instagram")) {
        return "facebook_organic";
      }
      if (host.includes("google")) return "google_organic";
      return host;
    } catch {
      return "referral";
    }
  }
  return "direct";
}

/**
 * Returns today's date string (YYYY-MM-DD) in Asia/Dhaka timezone
 */
export function getDhakaTodayISO(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Checks whether a YYYY-MM-DD date falls on a chamber working day (Sun=0 .. Thu=4)
 */
export function isChamberWorkingDay(dateStr: string): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return false;
  const dt = new Date(Date.UTC(y, m - 1, d, 6, 0, 0));
  const dow = dt.getUTCDay(); // 0=Sun..4=Thu, 5=Fri, 6=Sat
  return dow >= 0 && dow <= 4;
}
