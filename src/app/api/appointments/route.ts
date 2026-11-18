import { NextRequest, NextResponse } from "next/server";
import {
  appointmentRequestSchema,
  deriveLeadSource,
  generateInquiryId,
  getDhakaTodayISO,
  isChamberWorkingDay,
} from "@/lib/validation";
import { getCollection, isMongoConfigured } from "@/lib/mongodb";
import { sendAdminEmailNotification } from "@/lib/notifications";

const rateLimitMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (timestamps.length >= RATE_MAX_REQUESTS) {
    rateLimitMap.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

function getDayOfWeekUTC(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 6, 0, 0)).getUTCDay();
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        error:
          "Too many booking attempts from your connection. Please wait a few minutes or call our chamber directly at +880 1614-446444.",
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const parsed = appointmentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const todayDhaka = getDhakaTodayISO();

  if (data.preferredDate < todayDhaka) {
    return NextResponse.json(
      {
        error:
          "Please choose today or a future chamber working day (Sunday – Thursday).",
        fieldErrors: { preferredDate: ["Date cannot be in the past."] },
      },
      { status: 400 }
    );
  }

  if (!isChamberWorkingDay(data.preferredDate)) {
    return NextResponse.json(
      {
        error:
          "Our Ramna chamber is closed on Fridays and Saturdays. Please pick a Sunday – Thursday slot.",
        fieldErrors: { preferredDate: ["Chamber closed on Fridays & Saturdays."] },
      },
      { status: 400 }
    );
  }

  if (!isMongoConfigured()) {
    return NextResponse.json(
      {
        error: "Database connection (MONGODB_URI) is not configured.",
        code: "MONGODB_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  try {
    const [blockedCol, slotsCol, apptCol, notifCol] = await Promise.all([
      getCollection("blocked_dates"),
      getCollection("availability_slots"),
      getCollection("appointments"),
      getCollection("admin_notifications"),
    ]);

    const blocked = await blockedCol.findOne({
      blocked_date: data.preferredDate,
    });
    if (blocked) {
      return NextResponse.json(
        {
          error: `Selected date is unavailable: ${blocked.reason || "Chamber Closed"}. Please choose another date.`,
          fieldErrors: { preferredDate: [blocked.reason || "Date blocked"] },
        },
        { status: 409 }
      );
    }

    const dow = getDayOfWeekUTC(data.preferredDate);
    const activeSlot = await slotsCol.findOne({
      day_of_week: dow,
      slot_label: data.preferredTime,
      is_active: true,
    });

    if (!activeSlot) {
      return NextResponse.json(
        {
          error:
            "The selected time slot is not active for this date. Please choose an available slot.",
          fieldErrors: { preferredTime: ["Selected time slot is unavailable."] },
        },
        { status: 409 }
      );
    }

    const existingCount = await apptCol.countDocuments({
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingCount >= Number(activeSlot.max_bookings || 1)) {
      return NextResponse.json(
        {
          error:
            "This time slot has just been reserved. Please select another available slot.",
          fieldErrors: { preferredTime: ["This slot is already reserved."] },
        },
        { status: 409 }
      );
    }

    const inquiryId = generateInquiryId();
    const leadSource = deriveLeadSource({
      leadSource: data.leadSource,
      utmSource: data.utmSource,
      fbclid: data.fbclid,
      gclid: data.gclid,
      referrerUrl: data.referrerUrl,
    });

    const now = new Date();

    // Always start as 'pending' — NEVER auto-confirm before admin approval
    const doc = {
      inquiry_id: inquiryId,
      full_name: data.fullName,
      phone: data.phone,
      whatsapp_number: data.whatsappNumber,
      email: data.email || null,
      client_type: data.clientType,
      service_category: data.serviceCategory,
      consultation_type: data.consultationType,
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime,
      description: data.description,
      privacy_consent: true,
      status: "pending" as const,
      is_new: true,
      internal_notes: "",
      reviewed_by: null,
      reviewed_at: null,
      lead_source: leadSource,
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null,
      utm_term: data.utmTerm || null,
      utm_content: data.utmContent || null,
      fbclid: data.fbclid || null,
      gclid: data.gclid || null,
      referrer_url: data.referrerUrl || null,
      landing_page_url: data.landingPageUrl || null,
      timezone: "Asia/Dhaka",
      created_at: now,
      updated_at: now,
    };

    const insertRes = await apptCol.insertOne(doc);

    // Automatically log an admin notification in MongoDB
    await notifCol.insertOne({
      appointment_id: insertRes.insertedId.toHexString(),
      inquiry_id: inquiryId,
      title: `New Appointment Request: ${inquiryId}`,
      message: `${data.fullName} requested ${data.serviceCategory} (${data.consultationType}) on ${data.preferredDate} at ${data.preferredTime}`,
      is_read: false,
      created_at: now,
    });

    await sendAdminEmailNotification({
      inquiryId,
      fullName: data.fullName,
      phone: data.phone,
      whatsappNumber: data.whatsappNumber,
      email: data.email || null,
      clientType: data.clientType,
      serviceCategory: data.serviceCategory,
      consultationType: data.consultationType,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      description: data.description,
      leadSource,
      utmCampaign: data.utmCampaign || null,
    });

    return NextResponse.json(
      {
        success: true,
        appointment: {
          id: insertRes.insertedId.toHexString(),
          inquiry_id: inquiryId,
          full_name: data.fullName,
          service_category: data.serviceCategory,
          consultation_type: data.consultationType,
          preferred_date: data.preferredDate,
          preferred_time: data.preferredTime,
          status: "pending",
          created_at: now.toISOString(),
        },
        message:
          "Your consultation request has been received and is pending chamber verification.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("MongoDB appointment insert error:", err);
    return NextResponse.json(
      { error: "Unable to save your appointment request. Please try again." },
      { status: 500 }
    );
  }
}
