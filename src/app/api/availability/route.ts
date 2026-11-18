import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_TIME_SLOTS } from "@/data/firm";
import {
  createServiceRoleClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";
import { getDhakaTodayISO, isChamberWorkingDay } from "@/lib/validation";

export const dynamic = "force-dynamic";

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
      configured: isSupabaseAdminConfigured(),
    });
  }

  if (!isChamberWorkingDay(dateParam)) {
    return NextResponse.json({
      date: dateParam,
      isWorkingDay: false,
      blockedReason: "Chamber is closed on Fridays and Saturdays.",
      slots: [],
      configured: isSupabaseAdminConfigured(),
    });
  }

  if (!isSupabaseAdminConfigured()) {
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
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc("get_date_availability", {
      target_date: dateParam,
    });

    if (error) {
      console.error("Availability RPC error:", error);
      return NextResponse.json(
        { error: "Unable to load chamber slot availability." },
        { status: 500 }
      );
    }

    const slots = (data || []) as Array<{
      slot_time: string;
      slot_label: string;
      max_bookings: number;
      booked_count: number;
      is_available: boolean;
      blocked_reason: string | null;
    }>;

    const blockedReason = slots.find((s) => s.blocked_reason)?.blocked_reason ?? null;

    return NextResponse.json({
      date: dateParam,
      isWorkingDay: true,
      blockedReason,
      configured: true,
      slots,
    });
  } catch (err) {
    console.error("Unexpected availability error:", err);
    return NextResponse.json(
      { error: "Failed to check availability." },
      { status: 500 }
    );
  }
}
