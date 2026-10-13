import Link from "next/link";
import { logoutAction } from "@/app/actions";
import type { PublicUser } from "@/lib/types";

export function TopBar({ user }: { user?: PublicUser | null }) {
  return (
    <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal text-sm font-semibold tracking-wide text-paper">
          CR
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-tight text-ink">CampusRoll</span>
          <span className="block text-xs text-muted">Virtual class attendance</span>
        </span>
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        {!user ? (
          <Link
            href="/login"
            className="rounded-full bg-ink px-4 py-2 font-medium text-paper hover:bg-teal"
          >
            Sign in
          </Link>
        ) : (
          <>
            <span className="hidden text-muted sm:block">
              {user.name} · {user.role}
            </span>
            <form action={logoutAction}>
              <button className="rounded-full border border-line bg-paper px-4 py-2 hover:border-teal">
                Sign out
              </button>
            </form>
          </>
        )}
      </nav>
    </header>
  );
}

export function PageFrame({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: PublicUser | null;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col">
      <TopBar user={user} />
      <main className="flex-1 px-5 pb-16 sm:px-8">{children}</main>
    </div>
  );
}
