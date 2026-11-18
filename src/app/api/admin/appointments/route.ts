import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    let query = admin.supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      if (status === "new_only") {
        query = query.eq("is_new", true);
      } else {
        query = query.eq("status", status);
      }
    }

    if (service && service !== "all") {
      query = query.eq("service_category", service);
    }

    if (source && source !== "all") {
      query = query.eq("lead_source", source);
    }

    if (search) {
      const safe = search.replace(/[%_,]/g, "");
      query = query.or(
        `inquiry_id.ilike.%${safe}%,full_name.ilike.%${safe}%,phone.ilike.%${safe}%,whatsapp_number.ilike.%${safe}%,email.ilike.%${safe}%,description.ilike.%${safe}%,utm_campaign.ilike.%${safe}%`
      );
    }

    const [appointmentsRes, allCountsRes, notificationsRes] = await Promise.all([
      query,
      admin.supabase
        .from("appointments")
        .select("status, is_new, lead_source, service_category"),
      admin.supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (appointmentsRes.error) {
      console.error("Admin appointments query error:", appointmentsRes.error);
      return NextResponse.json(
        { error: "Failed to load appointments." },
        { status: 500 }
      );
    }

    const allRows = allCountsRes.data || [];
    const stats = {
      total: allRows.length,
      newInquiries: allRows.filter((r) => r.is_new).length,
      pending: allRows.filter((r) => r.status === "pending" || r.status === "new")
        .length,
      confirmed: allRows.filter((r) => r.status === "confirmed").length,
      completed: allRows.filter((r) => r.status === "completed").length,
      rejected: allRows.filter(
        (r) => r.status === "rejected" || r.status === "cancelled"
      ).length,
    };

    const distinctSources = Array.from(
      new Set(allRows.map((r) => r.lead_source).filter(Boolean))
    ).sort();

    return NextResponse.json({
      appointments: appointmentsRes.data || [],
      stats,
      distinctSources,
      notifications: notificationsRes.data || [],
      admin: {
        email: admin.profile.email,
        full_name: admin.profile.full_name,
        role: admin.profile.role,
      },
    });
  } catch (err) {
    console.error("Admin GET appointments error:", err);
    return NextResponse.json(
      { error: "Unexpected error loading dashboard." },
      { status: 500 }
    );
  }
}
