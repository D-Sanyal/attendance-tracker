import { redirect } from "next/navigation";
import { endSessionAction, facultySnapshot } from "@/app/actions";
import { RosterToggle, StartClassForm } from "@/components/forms";
import { PageFrame } from "@/components/shell";
import { SessionList } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function FacultyPage() {
  const data = await facultySnapshot();
  if (!data) redirect("/login");

  return (
    <PageFrame user={data.user}>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-ink">Faculty desk</h1>
      <p className="mb-8 text-sm text-muted">
        Start a virtual class, share the code, then close the room when lecture ends.
      </p>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="paper rounded-[2rem] p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-ink">New virtual class</h2>
          <StartClassForm courses={data.courses} />
        </section>

        <section className="grid gap-4">
          {data.rosters.length === 0 ? (
            <div className="paper rounded-[2rem] p-6 text-sm text-muted">
              No live rooms. Start one to collect attendance.
            </div>
          ) : (
            data.rosters.map(({ session, people }) => (
              <article key={session.id} className="paper rounded-[2rem] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-widest text-muted uppercase">
                      {session.courseCode} · live
                    </p>
                    <h2 className="text-xl font-semibold text-ink">{session.title}</h2>
                  </div>
                  <form action={endSessionAction.bind(null, session.id)}>
                    <button className="rounded-full border border-line px-4 py-2 text-sm">
                      End class
                    </button>
                  </form>
                </div>
                <div className="my-5 rounded-2xl bg-ink px-4 py-5 text-center text-paper">
                  <p className="text-xs tracking-[0.35em] uppercase opacity-70">Share this code</p>
                  <p className="mt-1 font-mono text-4xl tracking-[0.3em]">{session.joinCode}</p>
                  {session.meetUrl ? (
                    <a
                      href={session.meetUrl}
                      className="mt-2 inline-block text-sm text-teal-2 underline"
                      target="_blank"
                    >
                      Open meeting
                    </a>
                  ) : null}
                </div>
                <ul className="divide-y divide-line">
                  {people.map((person) => (
                    <li
                      key={person.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="font-medium text-ink">{person.name}</p>
                        <p className="text-xs text-muted">{person.rollNo}</p>
                      </div>
                      <RosterToggle
                        sessionId={session.id}
                        studentId={person.id}
                        status={person.status}
                      />
                    </li>
                  ))}
                </ul>
              </article>
            ))
          )}
        </section>
      </div>

      <section className="paper mt-8 rounded-[2rem] p-5 sm:p-6">
        <h2 className="mb-2 text-lg font-semibold text-ink">Recent sessions</h2>
        <SessionList
          sessions={data.sessions.filter((s) => s.status !== "live")}
          empty="No past sessions yet."
        />
      </section>
    </PageFrame>
  );
}
