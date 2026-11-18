import { NextRequest, NextResponse } from "next/server";
import { inquiryStatusLookupSchema } from "@/lib/validation";
import {
  createServiceRoleClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const inquiryId = request.nextUrl.searchParams.get("inquiryId") || "";
  const phoneLast4 = request.nextUrl.searchParams.get("phoneLast4") || "";

  const parsed = inquiryStatusLookupSchema.safeParse({ inquiryId, phoneLast4 });
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ||
          "Provide a valid Inquiry ID and last 4 digits of your phone number.",
      },
      { status: 400 }
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Database connection is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc("check_inquiry_status", {
      p_inquiry_id: parsed.data.inquiryId,
      p_phone_last4: parsed.data.phoneLast4,
    });

    if (error) {
      console.error("Status lookup error:", error);
      return NextResponse.json(
        { error: "Could not verify inquiry status." },
        { status: 500 }
      );
    }

    const record = Array.isArray(data) ? data[0] : null;
    if (!record) {
      return NextResponse.json(
        {
          error:
            "No matching inquiry found. Please check your Inquiry ID and the last 4 digits of your phone number.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ inquiry: record });
  } catch (err) {
    console.error("Unexpected status lookup error:", err);
    return NextResponse.json(
      { error: "Failed to check inquiry status." },
      { status: 500 }
    );
  }
}
