import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getCollection, isMongoConfigured } from "@/lib/mongodb";

export const ADMIN_COOKIE_NAME = "tvla_admin_session";

export interface AdminSessionPayload {
  sub: string;
  email: string;
  full_name: string;
  role: "admin" | "super_admin";
}

function getJwtSecretBytes(): Uint8Array {
  const secret =
    process.env.ADMIN_JWT_SECRET ||
    "fallback-dev-only-change-admin-jwt-secret-in-env";
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(
  payload: AdminSessionPayload
): Promise<string> {
  return new SignJWT({
    email: payload.email,
    full_name: payload.full_name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretBytes());
}

export async function verifyAdminToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email,
      full_name:
        typeof payload.full_name === "string"
          ? payload.full_name
          : "Chamber Admin",
      role: payload.role === "super_admin" ? "super_admin" : "admin",
    };
  } catch {
    return null;
  }
}

export interface AdminUserDoc {
  _id: ObjectId;
  email: string;
  password_hash: string;
  full_name: string;
  role: "admin" | "super_admin";
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Verifies the HttpOnly JWT cookie AND checks that the admin account is still active in MongoDB.
 */
export async function getAuthenticatedAdmin() {
  if (!isMongoConfigured()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifyAdminToken(token);
  if (!session || !ObjectId.isValid(session.sub)) return null;

  const admins = await getCollection<AdminUserDoc>("admins");
  const adminDoc = await admins.findOne(
    { _id: new ObjectId(session.sub), is_active: true },
    { projection: { password_hash: 0 } }
  );

  if (!adminDoc) return null;

  return {
    id: adminDoc._id.toHexString(),
    email: adminDoc.email,
    full_name: adminDoc.full_name,
    role: adminDoc.role,
    is_active: adminDoc.is_active,
  };
}
