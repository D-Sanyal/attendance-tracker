import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { PublicUser, Role } from "./types";

const COOKIE = "campusroll_session";
const SECRET = process.env.SESSION_SECRET ?? "campusroll-local-dev-secret";

type Payload = {
  id: string;
  role: Role;
  exp: number;
};

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

function encode(payload: Payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string): Payload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSession(user: PublicUser) {
  const jar = await cookies();
  jar.set(COOKIE, encode({ id: user.id, role: user.role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function readSession(): Promise<Payload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return decode(token);
}
