import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/supabase/server";

export async function PATCH() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await admin.supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) {
    return NextResponse.json(
      { error: "Failed to mark notifications as read." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
