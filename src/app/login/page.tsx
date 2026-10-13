import { redirect } from "next/navigation";
import { currentUser, homeFor } from "@/lib/auth";
import { LoginForm } from "@/components/forms";
import { PageFrame } from "@/components/shell";

export const dynamic = "force-dynamic";

const accounts = [
  ["CSE student (on track)", "CSE2024001"],
  ["CSE student (at risk)", "CSE2024004"],
  ["ECE student", "ECE2024001"],
  ["CSE faculty", "faculty.cse"],
  ["Admin", "admin"],
];

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect(homeFor(user.role));

  return (
    <PageFrame>
      <div className="mx-auto grid max-w-4xl gap-8 py-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="paper rounded-[2rem] p-6 sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Sign in</h1>
          <p className="mt-2 mb-6 text-sm text-muted">
            Use your roll number (students) or faculty ID. Demo password is{" "}
            <span className="font-medium text-ink">campus123</span> for every account.
          </p>
          <LoginForm />
        </div>
        <aside className="paper rounded-[2rem] p-6">
          <h2 className="text-sm tracking-widest text-muted uppercase">Demo campus</h2>
          <ul className="mt-4 divide-y divide-line text-sm">
            {accounts.map(([label, login]) => (
              <li key={login} className="flex items-center justify-between py-3">
                <span className="text-muted">{label}</span>
                <span className="font-mono text-ink">{login}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </PageFrame>
  );
}
