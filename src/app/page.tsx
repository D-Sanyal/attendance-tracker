import Link from "next/link";
import { currentUser, homeFor } from "@/lib/auth";
import { PageFrame } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await currentUser();
  return (
    <PageFrame user={user}>
      <section className="grid items-center gap-10 pb-8 pt-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-3 text-xs tracking-[0.25em] text-teal uppercase">
            College · departments · virtual rooms
          </p>
          <h1 className="max-w-xl text-4xl leading-tight font-semibold tracking-tight text-ink sm:text-5xl">
            See your attendance for every virtual class, by department.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
            Faculty open a live session and share a six-digit code. Students from that
            department check in during class, then watch their 75% eligibility by course.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={user ? homeFor(user.role) : "/login"}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper"
            >
              {user ? "Open my dashboard" : "Student / faculty sign in"}
            </Link>
            <a href="#how" className="rounded-full border border-line bg-paper px-5 py-2.5 text-sm">
              How check-in works
            </a>
          </div>
        </div>
        <div className="paper rounded-[2rem] p-6">
          <p className="text-xs tracking-widest text-muted uppercase">Live CSE room</p>
          <p className="mt-2 text-2xl font-semibold text-ink">AVL trees — virtual class</p>
          <p className="text-sm text-muted">CS301 · Prof. Arjun Menon</p>
          <div className="mt-6 rounded-2xl bg-ink px-5 py-6 text-center text-paper">
            <p className="text-xs tracking-[0.4em] uppercase opacity-70">Join code</p>
            <p className="mt-2 font-mono text-4xl tracking-[0.35em]">749201</p>
          </div>
          <p className="mt-4 text-sm text-muted">
            Demo student <span className="font-medium text-ink">CSE2024001</span> / campus123
          </p>
        </div>
      </section>

      <section id="how" className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Faculty starts the room",
            body: "Pick a course, paste the Meet/Zoom link, and CampusRoll issues a code that dies when class ends.",
          },
          {
            title: "Students check in",
            body: "Only enrolled students in that department can use the code. After 10 minutes they are marked late.",
          },
          {
            title: "Eligibility stays visible",
            body: "Each course shows present / late / total with the college 75% bar so nobody is surprised at internals.",
          },
        ].map((item) => (
          <article key={item.title} className="paper rounded-3xl p-5">
            <h2 className="font-semibold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
          </article>
        ))}
      </section>
    </PageFrame>
  );
}
