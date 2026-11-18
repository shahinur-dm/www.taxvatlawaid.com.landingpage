import { NextRequest, NextResponse } from "next/server";
import type { Document, Filter } from "mongodb";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function serializeAppointment(doc: Document) {
  return {
    id: doc._id.toHexString(),
    inquiry_id: doc.inquiry_id,
    full_name: doc.full_name,
    phone: doc.phone,
    whatsapp_number: doc.whatsapp_number,
    email: doc.email ?? null,
    client_type: doc.client_type,
    service_category: doc.service_category,
    consultation_type: doc.consultation_type,
    preferred_date: doc.preferred_date,
    preferred_time: doc.preferred_time,
    description: doc.description,
    privacy_consent: Boolean(doc.privacy_consent),
    status: doc.status,
    is_new: Boolean(doc.is_new),
    internal_notes: doc.internal_notes || "",
    reviewed_by: doc.reviewed_by ?? null,
    reviewed_at:
      doc.reviewed_at instanceof Date
        ? doc.reviewed_at.toISOString()
        : doc.reviewed_at ?? null,
    lead_source: doc.lead_source || "direct",
    utm_source: doc.utm_source ?? null,
    utm_medium: doc.utm_medium ?? null,
    utm_campaign: doc.utm_campaign ?? null,
    utm_term: doc.utm_term ?? null,
    utm_content: doc.utm_content ?? null,
    fbclid: doc.fbclid ?? null,
    gclid: doc.gclid ?? null,
    referrer_url: doc.referrer_url ?? null,
    landing_page_url: doc.landing_page_url ?? null,
    timezone: doc.timezone || "Asia/Dhaka",
    created_at:
      doc.created_at instanceof Date
        ? doc.created_at.toISOString()
        : String(doc.created_at),
    updated_at:
      doc.updated_at instanceof Date
        ? doc.updated_at.toISOString()
        : String(doc.updated_at),
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") || "";
  const service = searchParams.get("service") || "";
  const source = searchParams.get("source") || "";
  const search = (searchParams.get("search") || "").trim();

  try {
    const [apptCol, notifCol] = await Promise.all([
      getCollection("appointments"),
      getCollection("admin_notifications"),
    ]);

    const filter: Filter<Document> = {};
    if (status && status !== "all") {
      if (status === "new_only") {
        filter.is_new = true;
      } else {
        filter.status = status;
      }
    }

    if (service && service !== "all") {
      filter.service_category = service;
    }

    if (source && source !== "all") {
      filter.lead_source = source;
    }

    if (search) {
      const regex = { $regex: escapeRegex(search), $options: "i" };
      filter.$or = [
        { inquiry_id: regex },
        { full_name: regex },
        { phone: regex },
        { whatsapp_number: regex },
        { email: regex },
        { description: regex },
        { utm_campaign: regex },
      ];
    }

    const [filteredDocs, allMetaDocs, notifDocs] = await Promise.all([
      apptCol.find(filter).sort({ created_at: -1 }).toArray(),
      apptCol
        .find({}, { projection: { status: 1, is_new: 1, lead_source: 1 } })
        .toArray(),
      notifCol.find({}).sort({ created_at: -1 }).limit(20).toArray(),
    ]);

    const stats = {
      total: allMetaDocs.length,
      newInquiries: allMetaDocs.filter((r) => r.is_new).length,
      pending: allMetaDocs.filter(
        (r) => r.status === "pending" || r.status === "new"
      ).length,
      confirmed: allMetaDocs.filter((r) => r.status === "confirmed").length,
      completed: allMetaDocs.filter((r) => r.status === "completed").length,
      rejected: allMetaDocs.filter(
        (r) => r.status === "rejected" || r.status === "cancelled"
      ).length,
    };

    const distinctSources = Array.from(
      new Set(
        allMetaDocs.map((r) => String(r.lead_source || "")).filter(Boolean)
      )
    ).sort();

    return NextResponse.json({
      appointments: filteredDocs.map(serializeAppointment),
      stats,
      distinctSources,
      notifications: notifDocs.map((n) => ({
        id: n._id.toHexString(),
        appointment_id: String(n.appointment_id),
        inquiry_id: String(n.inquiry_id),
        title: String(n.title),
        message: String(n.message),
        is_read: Boolean(n.is_read),
        created_at:
          n.created_at instanceof Date
            ? n.created_at.toISOString()
            : String(n.created_at),
      })),
      admin: {
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("MongoDB admin GET appointments error:", err);
    return NextResponse.json(
      { error: "Unexpected error loading dashboard." },
      { status: 500 }
    );
  }
}
