import { NextRequest, NextResponse } from "next/server";
import {
  appointmentRequestSchema,
  deriveLeadSource,
  generateInquiryId,
  getDhakaTodayISO,
  isChamberWorkingDay,
} from "@/lib/validation";
import {
  createServiceRoleClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";
import { sendAdminEmailNotification } from "@/lib/notifications";

// Simple per-instance sliding-window rate limiter (10 requests / 10 min per IP)
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
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      {
        error: "Please check the highlighted fields and try again.",
        fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Validate date against Asia/Dhaka today and chamber working days (Sun–Thu)
  const todayDhaka = getDhakaTodayISO();
  if (data.preferredDate < todayDhaka) {
    return NextResponse.json(
      {
        error: "Please choose today or a future chamber working day (Sunday – Thursday).",
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

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database connection is not configured yet. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local and run the SQL migration.",
        code: "SUPABASE_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  try {
    const supabase = createServiceRoleClient();

    // Check blocked dates and slot availability before inserting
    const { data: availabilityRows, error: availError } = await supabase.rpc(
      "get_date_availability",
      { target_date: data.preferredDate }
    );

    if (availError) {
      console.error("Slot check error:", availError);
      return NextResponse.json(
        { error: "Could not verify slot availability. Please try again." },
        { status: 500 }
      );
    }

    const matchingSlot = (availabilityRows || []).find(
      (row: { slot_label: string; is_available: boolean; blocked_reason: string | null }) =>
        row.slot_label === data.preferredTime
    );

    if (!matchingSlot) {
      return NextResponse.json(
        {
          error: "The selected time slot is not active for this date. Please choose an available slot.",
          fieldErrors: { preferredTime: ["Selected time slot is unavailable."] },
        },
        { status: 409 }
      );
    }

    if (matchingSlot.blocked_reason) {
      return NextResponse.json(
        {
          error: `Selected date is unavailable: ${matchingSlot.blocked_reason}. Please choose another date.`,
          fieldErrors: { preferredDate: [matchingSlot.blocked_reason] },
        },
        { status: 409 }
      );
    }

    if (!matchingSlot.is_available) {
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

    // IMPORTANT: Always save as 'pending' — NEVER auto-confirm before admin approval
    const { data: inserted, error: insertError } = await supabase
      .from("appointments")
      .insert({
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
        status: "pending",
        is_new: true,
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
      })
      .select(
        "id, inquiry_id, full_name, service_category, consultation_type, preferred_date, preferred_time, status, created_at"
      )
      .single();

    if (insertError) {
      console.error("Appointment insert error:", insertError);
      return NextResponse.json(
        { error: "Unable to save your appointment request. Please try again." },
        { status: 500 }
      );
    }

    // Trigger optional email notification asynchronously without delaying response failure
    await sendAdminEmailNotification({
      inquiryId: inserted.inquiry_id,
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
        appointment: inserted,
        message:
          "Your consultation request has been received and is pending chamber verification.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected booking error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred. Please try again." },
      { status: 500 }
    );
  }
}
