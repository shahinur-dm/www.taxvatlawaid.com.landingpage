import { NextRequest, NextResponse } from "next/server";
import { inquiryStatusLookupSchema } from "@/lib/validation";
import { getCollection, isMongoConfigured } from "@/lib/mongodb";

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

  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "Database connection is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const apptCol = await getCollection("appointments");
    const doc = await apptCol.findOne(
      { inquiry_id: parsed.data.inquiryId.trim().toUpperCase() },
      {
        projection: {
          inquiry_id: 1,
          phone: 1,
          service_category: 1,
          consultation_type: 1,
          preferred_date: 1,
          preferred_time: 1,
          status: 1,
          created_at: 1,
        },
      }
    );

    if (!doc) {
      return NextResponse.json(
        {
          error:
            "No matching inquiry found. Please check your Inquiry ID and the last 4 digits of your phone number.",
        },
        { status: 404 }
      );
    }

    const digits = String(doc.phone || "").replace(/\D/g, "");
    if (!digits.endsWith(parsed.data.phoneLast4)) {
      return NextResponse.json(
        {
          error:
            "No matching inquiry found. Please check your Inquiry ID and the last 4 digits of your phone number.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      inquiry: {
        inquiry_id: doc.inquiry_id,
        service_category: doc.service_category,
        consultation_type: doc.consultation_type,
        preferred_date: doc.preferred_date,
        preferred_time: doc.preferred_time,
        status: doc.status,
        created_at:
          doc.created_at instanceof Date
            ? doc.created_at.toISOString()
            : String(doc.created_at),
      },
    });
  } catch (err) {
    console.error("MongoDB status lookup error:", err);
    return NextResponse.json(
      { error: "Failed to check inquiry status." },
      { status: 500 }
    );
  }
}
