import { NextRequest, NextResponse } from "next/server";
import { ObjectId, MongoServerError } from "mongodb";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { blockedDateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [slotsCol, blockedCol] = await Promise.all([
      getCollection("availability_slots"),
      getCollection("blocked_dates"),
    ]);

    const [slotsDocs, blockedDocs] = await Promise.all([
      slotsCol.find({}).sort({ day_of_week: 1, sort_order: 1 }).toArray(),
      blockedCol.find({}).sort({ blocked_date: 1 }).toArray(),
    ]);

    return NextResponse.json({
      slots: slotsDocs.map((s) => ({
        id: s._id.toHexString(),
        day_of_week: Number(s.day_of_week),
        slot_time: String(s.slot_time),
        slot_label: String(s.slot_label),
        max_bookings: Number(s.max_bookings || 1),
        is_active: Boolean(s.is_active),
        is_available: Boolean(s.is_active),
      })),
      blockedDates: blockedDocs.map((b) => ({
        id: b._id.toHexString(),
        blocked_date: String(b.blocked_date),
        reason: String(b.reason || "Chamber Closed"),
        created_at:
          b.created_at instanceof Date
            ? b.created_at.toISOString()
            : String(b.created_at),
      })),
    });
  } catch (err) {
    console.error("MongoDB admin availability GET error:", err);
    return NextResponse.json(
      { error: "Failed to load availability settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.id !== "string" ||
    !ObjectId.isValid(body.id) ||
    typeof body.is_active !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Invalid slot update payload." },
      { status: 400 }
    );
  }

  const slotsCol = await getCollection("availability_slots");
  const updated = await slotsCol.findOneAndUpdate(
    { _id: new ObjectId(body.id) },
    { $set: { is_active: body.is_active } },
    { returnDocument: "after" }
  );

  if (!updated) {
    return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  }

  return NextResponse.json({
    slot: {
      id: updated._id.toHexString(),
      day_of_week: Number(updated.day_of_week),
      slot_time: String(updated.slot_time),
      slot_label: String(updated.slot_label),
      max_bookings: Number(updated.max_bookings || 1),
      is_active: Boolean(updated.is_active),
    },
  });
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

  try {
    const blockedCol = await getCollection("blocked_dates");
    const now = new Date();
    const res = await blockedCol.insertOne({
      blocked_date: parsed.data.blocked_date,
      reason: parsed.data.reason,
      created_by: admin.id,
      created_at: now,
    });

    return NextResponse.json(
      {
        blockedDate: {
          id: res.insertedId.toHexString(),
          blocked_date: parsed.data.blocked_date,
          reason: parsed.data.reason,
          created_at: now.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
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
}

export async function DELETE(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Missing or invalid blocked date id" },
      { status: 400 }
    );
  }

  const blockedCol = await getCollection("blocked_dates");
  await blockedCol.deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ deleted: true });
}
