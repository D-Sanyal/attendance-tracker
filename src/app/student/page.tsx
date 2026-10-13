import { redirect } from "next/navigation";
import { studentSnapshot } from "@/app/actions";
import { CheckInForm } from "@/components/forms";
import { PageFrame } from "@/components/shell";
import { CourseCard, SessionList } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function StudentPage() {
  const data = await studentSnapshot();
  if (!data) redirect("/login");

  const live = data.sessions.filter((s) => s.status === "live");
  const history = data.sessions.filter((s) => s.status !== "live");

  return (
    <PageFrame user={data.user}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-teal uppercase">
            {data.department.code} · {data.department.name}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
            Hi {data.user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted">Roll {data.user.rollNo}</p>
        </div>
      </div>

      <section className="paper mb-8 rounded-[2rem] p-5 sm:p-6">
        <h2 className="mb-3 text-lg font-semibold text-ink">Join a live virtual class</h2>
        <p className="mb-4 text-sm text-muted">
          Enter the code your faculty is showing. Late after 10 minutes still counts, but is flagged.
        </p>
        <CheckInForm />
        {live.length ? (
          <div className="mt-5 rounded-2xl bg-[#f4ebe0] p-4 text-sm">
            <p className="font-medium text-ink">Open now in your department</p>
            {live.map((session) => (
              <p key={session.id} className="mt-1 text-muted">
                {session.courseCode}: {session.title}
                {session.meetUrl ? (
                  <>
                    {" · "}
                    <a className="text-teal underline" href={session.meetUrl} target="_blank">
                      meeting link
                    </a>
                  </>
                ) : null}
                {session.myStatus && session.myStatus !== "none"
                  ? ` · already ${session.myStatus}`
                  : null}
              </p>
            ))}
          </div>
        ) : null}
      </section>

      <h2 className="mb-4 text-lg font-semibold text-ink">Your courses</h2>
      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {data.courses.map((item) => (
          <CourseCard key={item.course.id} item={item} />
        ))}
      </div>

      <section className="paper rounded-[2rem] p-5 sm:p-6">
        <h2 className="mb-2 text-lg font-semibold text-ink">Class history</h2>
        <SessionList sessions={history} empty="No virtual classes yet." />
      </section>
    </PageFrame>
  );
}
