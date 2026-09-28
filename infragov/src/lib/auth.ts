import { cookies } from "next/headers";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  departmentName: string | null;
}

const SESSION_COOKIE = "infragov_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const token = Buffer.from(`${userId}:${Date.now()}`).toString("base64");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${userId}|${token}`, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie?.value) return null;

    const userId = sessionCookie.value.split("|")[0];
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, department: true },
    });

    if (!user || user.status !== "ACTIVE") return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      departmentId: user.departmentId,
      departmentName: user.department?.name || null,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function hasPermission(role: string, action: string): boolean {
  const permissions: Record<string, string[]> = {
    ADMIN: ["*"],
    ASSET_MANAGER: [
      "assets:read", "assets:create", "assets:update", "assets:delete",
      "inspections:read", "inspections:create", "inspections:update",
      "maintenance:read", "maintenance:create", "maintenance:update",
      "lifecycle:read", "lifecycle:create",
      "policies:read", "policies:create", "policies:update",
      "alerts:read", "alerts:update",
      "reports:read",
      "dashboard:read",
      "users:read",
      "departments:read",
      "categories:read",
    ],
    FIELD_INSPECTOR: [
      "assets:read",
      "inspections:read", "inspections:create",
      "maintenance:read",
      "alerts:read",
      "dashboard:read",
    ],
    TECHNICIAN: [
      "assets:read",
      "maintenance:read", "maintenance:update",
      "alerts:read",
      "dashboard:read",
    ],
    VIEWER: [
      "assets:read",
      "inspections:read",
      "maintenance:read",
      "dashboard:read",
      "reports:read",
    ],
  };

  const rolePerms = permissions[role] || [];
  if (rolePerms.includes("*")) return true;
  return rolePerms.includes(action);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("AUTH_UNAUTHORIZED");
  }
  return session;
}

export async function requirePermission(action: string): Promise<SessionUser> {
  const session = await requireAuth();
  if (!hasPermission(session.role, action)) {
    throw new Error("AUTH_FORBIDDEN");
  }
  return session;
}
