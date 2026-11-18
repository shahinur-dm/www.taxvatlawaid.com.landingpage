import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/supabase/server";
import { adminUpdateAppointmentSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing appointment ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminUpdateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update fields", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updatePayload: Record<string, unknown> = {
    ...parsed.data,
  };

  if (parsed.data.status) {
    updatePayload.reviewed_by = admin.profile.id;
    updatePayload.reviewed_at = new Date().toISOString();
    updatePayload.is_new = false;
  }

  const { data, error } = await admin.supabase
    .from("appointments")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "Another appointment is already CONFIRMED for this exact date and time slot. Reschedule or cancel the conflicting booking first.",
        },
        { status: 409 }
      );
    }
    console.error("Admin update appointment error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment." },
      { status: 500 }
    );
  }

  // Mark related admin notifications as read when reviewed
  if (parsed.data.status || parsed.data.is_new === false) {
    await admin.supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("appointment_id", id);
  }

  return NextResponse.json({ appointment: data });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { error } = await admin.supabase
    .from("appointments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Admin delete appointment error:", error);
    return NextResponse.json(
      { error: "Failed to delete record." },
      { status: 500 }
    );
  }

  return NextResponse.json({ deleted: true });
}
