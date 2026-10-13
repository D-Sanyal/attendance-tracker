import { readDb } from "./store";
import { verifyPassword } from "./password";
import { clearSession, readSession, setSession } from "./session";
import { toPublicUser } from "./queries";
import type { PublicUser, Role } from "./types";

export async function login(login: string, password: string) {
  const db = await readDb();
  const user = db.users.find((u) => u.login.toLowerCase() === login.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Roll number / ID or password is incorrect." as const };
  }
  const publicUser = toPublicUser(user);
  await setSession(publicUser);
  return { user: publicUser };
}

export async function logout() {
  await clearSession();
}

export async function currentUser(): Promise<PublicUser | null> {
  const session = await readSession();
  if (!session) return null;
  const db = await readDb();
  const user = db.users.find((u) => u.id === session.id);
  return user ? toPublicUser(user) : null;
}

export async function requireUser(roles?: Role[]) {
  const user = await currentUser();
  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return user;
}

export function homeFor(role: Role) {
  if (role === "faculty") return "/faculty";
  if (role === "admin") return "/admin";
  return "/student";
}
