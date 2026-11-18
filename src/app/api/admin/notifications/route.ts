import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";

export async function PATCH() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifCol = await getCollection("admin_notifications");
  await notifCol.updateMany({ is_read: false }, { $set: { is_read: true } });

  return NextResponse.json({ success: true });
}
