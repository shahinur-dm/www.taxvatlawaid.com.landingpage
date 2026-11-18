import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/supabase/server";
import { blockedDateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [slotsRes, blockedRes] = await Promise.all([
    admin.supabase
      .from("availability_slots")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("sort_order", { ascending: true }),
    admin.supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date", { ascending: true }),
  ]);

  if (slotsRes.error || blockedRes.error) {
    return NextResponse.json(
      { error: "Failed to load availability settings." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    slots: slotsRes.data || [],
    blockedDates: blockedRes.data || [],
  });
}

export async function PATCH(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== "string" || typeof body.is_active !== "boolean") {
    return NextResponse.json({ error: "Invalid slot update payload." }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("availability_slots")
    .update({ is_active: body.is_active })
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update slot." }, { status: 500 });
  }

  return NextResponse.json({ slot: data });
}

export async function POST(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = blockedDateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid blocked date." },
      { status: 400 }
    );
  }

  const { data, error } = await admin.supabase
    .from("blocked_dates")
    .insert({
      blocked_date: parsed.data.blocked_date,
      reason: parsed.data.reason,
      created_by: admin.profile.id,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This date is already blocked." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add blocked date." },
      { status: 500 }
    );
  }

  return NextResponse.json({ blockedDate: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing blocked date id" }, { status: 400 });
  }

  const { error } = await admin.supabase
    .from("blocked_dates")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to remove blocked date." },
      { status: 500 }
    );
  }

  return NextResponse.json({ deleted: true });
}
