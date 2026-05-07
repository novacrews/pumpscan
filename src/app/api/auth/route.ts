import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export const runtime = "nodejs";

// Simple in-memory user store (replace with DB in production)
interface User {
  id: string;
  email: string;
  passwordHash: string;
  plan: "free" | "pro";
  telegramId?: string;
  apiKey?: string;
  createdAt: number;
}

const users = new Map<string, User>();
const sessions = new Map<string, string>(); // sessionToken → userId

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "pumpscan_salt").digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  if (action === "signup") {
    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    // Check if user exists
    const existing = Array.from(users.values()).find(u => u.email === email);
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const user: User = {
      id: generateToken().slice(0, 16),
      email,
      passwordHash: hashPassword(password),
      plan: "free",
      apiKey: generateToken(),
      createdAt: Date.now(),
    };
    users.set(user.id, user);

    const sessionToken = generateToken();
    sessions.set(sessionToken, user.id);

    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, plan: user.plan, apiKey: user.apiKey },
    });
    res.cookies.set("ps_session", sessionToken, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  if (action === "login") {
    const { email, password } = body;
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionToken = generateToken();
    sessions.set(sessionToken, user.id);

    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, plan: user.plan },
    });
    res.cookies.set("ps_session", sessionToken, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  if (action === "logout") {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("ps_session")?.value;
    if (sessionToken) sessions.delete(sessionToken);
    const res = NextResponse.json({ ok: true });
    res.cookies.delete("ps_session");
    return res;
  }

  if (action === "me") {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("ps_session")?.value;
    if (!sessionToken) return NextResponse.json({ user: null });
    const userId = sessions.get(sessionToken);
    if (!userId) return NextResponse.json({ user: null });
    const user = users.get(userId);
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: { id: user.id, email: user.email, plan: user.plan, apiKey: user.apiKey } });
  }

  if (action === "upgrade") {
    // Called after successful Stripe payment
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("ps_session")?.value;
    if (!sessionToken) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    const userId = sessions.get(sessionToken);
    if (!userId) return NextResponse.json({ error: "Session invalid" }, { status: 401 });
    const user = users.get(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    user.plan = "pro";
    users.set(userId, user);
    return NextResponse.json({ ok: true, plan: "pro" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
