import { NextRequest, NextResponse } from "next/server";
import { ObjectId, MongoServerError } from "mongodb";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
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
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid appointment ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminUpdateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update fields", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const now = new Date();
  const updateSet: Record<string, unknown> = {
    ...parsed.data,
    updated_at: now,
  };

  if (parsed.data.status) {
    updateSet.reviewed_by = admin.id;
    updateSet.reviewed_at = now;
    updateSet.is_new = false;
  }

  try {
    const [apptCol, notifCol] = await Promise.all([
      getCollection("appointments"),
      getCollection("admin_notifications"),
    ]);

    const updated = await apptCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateSet },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Appointment record not found." },
        { status: 404 }
      );
    }

    if (parsed.data.status || parsed.data.is_new === false) {
      await notifCol.updateMany(
        { appointment_id: id },
        { $set: { is_read: true } }
      );
    }

    return NextResponse.json({
      appointment: {
        id: updated._id.toHexString(),
        inquiry_id: updated.inquiry_id,
        full_name: updated.full_name,
        phone: updated.phone,
        whatsapp_number: updated.whatsapp_number,
        email: updated.email ?? null,
        client_type: updated.client_type,
        service_category: updated.service_category,
        consultation_type: updated.consultation_type,
        preferred_date: updated.preferred_date,
        preferred_time: updated.preferred_time,
        description: updated.description,
        privacy_consent: Boolean(updated.privacy_consent),
        status: updated.status,
        is_new: Boolean(updated.is_new),
        internal_notes: updated.internal_notes || "",
        reviewed_by: updated.reviewed_by ?? null,
        reviewed_at:
          updated.reviewed_at instanceof Date
            ? updated.reviewed_at.toISOString()
            : updated.reviewed_at ?? null,
        lead_source: updated.lead_source || "direct",
        utm_source: updated.utm_source ?? null,
        utm_medium: updated.utm_medium ?? null,
        utm_campaign: updated.utm_campaign ?? null,
        utm_term: updated.utm_term ?? null,
        utm_content: updated.utm_content ?? null,
        fbclid: updated.fbclid ?? null,
        gclid: updated.gclid ?? null,
        referrer_url: updated.referrer_url ?? null,
        landing_page_url: updated.landing_page_url ?? null,
        timezone: updated.timezone || "Asia/Dhaka",
        created_at:
          updated.created_at instanceof Date
            ? updated.created_at.toISOString()
            : String(updated.created_at),
        updated_at:
          updated.updated_at instanceof Date
            ? updated.updated_at.toISOString()
            : String(updated.updated_at),
      },
    });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return NextResponse.json(
        {
          error:
            "Another appointment is already CONFIRMED for this exact date and time slot. Reschedule or cancel the conflicting booking first.",
        },
        { status: 409 }
      );
    }
    console.error("MongoDB admin update error:", err);
    return NextResponse.json(
      { error: "Failed to update appointment." },
      { status: 500 }
    );
  }
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
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid appointment ID" }, { status: 400 });
  }

  const [apptCol, notifCol] = await Promise.all([
    getCollection("appointments"),
    getCollection("admin_notifications"),
  ]);

  await Promise.all([
    apptCol.deleteOne({ _id: new ObjectId(id) }),
    notifCol.deleteMany({ appointment_id: id }),
  ]);

  return NextResponse.json({ deleted: true });
}
