import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_TIME_SLOTS } from "@/data/firm";
import { getCollection, isMongoConfigured } from "@/lib/mongodb";
import { getDhakaTodayISO, isChamberWorkingDay } from "@/lib/validation";

export const dynamic = "force-dynamic";

function getDayOfWeekUTC(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 6, 0, 0)).getUTCDay();
}

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json(
      { error: "Provide a valid date parameter (YYYY-MM-DD)." },
      { status: 400 }
    );
  }

  const todayDhaka = getDhakaTodayISO();
  if (dateParam < todayDhaka) {
    return NextResponse.json({
      date: dateParam,
      isWorkingDay: false,
      blockedReason: "Selected date is in the past (Asia/Dhaka).",
      slots: [],
      configured: isMongoConfigured(),
    });
  }

  if (!isChamberWorkingDay(dateParam)) {
    return NextResponse.json({
      date: dateParam,
      isWorkingDay: false,
      blockedReason: "Chamber is closed on Fridays and Saturdays.",
      slots: [],
      configured: isMongoConfigured(),
    });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json({
      date: dateParam,
      isWorkingDay: true,
      blockedReason: null,
      configured: false,
      slots: DEFAULT_TIME_SLOTS.map((s) => ({
        slot_time: s.slot_time,
        slot_label: s.slot_label,
        max_bookings: 1,
        booked_count: 0,
        is_available: true,
        blocked_reason: null,
      })),
    });
  }

  try {
    const dow = getDayOfWeekUTC(dateParam);
    const [blockedCol, slotsCol, apptCol] = await Promise.all([
      getCollection("blocked_dates"),
      getCollection("availability_slots"),
      getCollection("appointments"),
    ]);

    const blocked = await blockedCol.findOne({ blocked_date: dateParam });
    if (blocked) {
      return NextResponse.json({
        date: dateParam,
        isWorkingDay: true,
        blockedReason: blocked.reason || "Chamber Closed",
        configured: true,
        slots: [],
      });
    }

    const [activeSlots, existingBookings] = await Promise.all([
      slotsCol
        .find({ day_of_week: dow, is_active: true })
        .sort({ sort_order: 1 })
        .toArray(),
      apptCol
        .find(
          {
            preferred_date: dateParam,
            status: { $in: ["pending", "confirmed"] },
          },
          { projection: { preferred_time: 1 } }
        )
        .toArray(),
    ]);

    const countByTime = new Map<string, number>();
    for (const b of existingBookings) {
      const t = String(b.preferred_time || "");
      countByTime.set(t, (countByTime.get(t) || 0) + 1);
    }

    const slots = activeSlots.map((s) => {
      const maxBookings = Number(s.max_bookings || 1);
      const bookedCount = countByTime.get(String(s.slot_label)) || 0;
      return {
        slot_time: String(s.slot_time),
        slot_label: String(s.slot_label),
        max_bookings: maxBookings,
        booked_count: bookedCount,
        is_available: bookedCount < maxBookings,
        blocked_reason: null,
      };
    });

    return NextResponse.json({
      date: dateParam,
      isWorkingDay: true,
      blockedReason: null,
      configured: true,
      slots,
    });
  } catch (err) {
    console.error("MongoDB availability error:", err);
    return NextResponse.json(
      { error: "Unable to load chamber slot availability." },
      { status: 500 }
    );
  }
}
