import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getCollection, isMongoConfigured } from "@/lib/mongodb";
import {
  ADMIN_COOKIE_NAME,
  signAdminToken,
  type AdminUserDoc,
} from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid admin email address."),
  password: z.string().min(6, "Enter your password."),
});

export async function POST(request: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "MongoDB connection (MONGODB_URI) is not configured." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid login credentials." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const admins = await getCollection<AdminUserDoc>("admins");
    const admin = await admins.findOne({ email });

    if (!admin || !admin.is_active) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(
      parsed.data.password,
      admin.password_hash
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await signAdminToken({
      sub: admin._id.toHexString(),
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "Authentication service error. Please verify MongoDB connectivity." },
      { status: 500 }
    );
  }
}
