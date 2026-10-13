import type { CourseAttendance, SessionRow } from "@/lib/types";

export function PercentBar({ value, min }: { value: number; min: number }) {
  const ok = value >= min;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{value}% attended</span>
        <span>{min}% required</span>
      </div>
      <div className="bar">
        <div
          className={`h-full ${ok ? "bg-ok" : "bg-accent"}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export function CourseCard({ item }: { item: CourseAttendance }) {
  return (
    <article className="paper rounded-3xl p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-muted uppercase">{item.course.code}</p>
          <h3 className="text-lg font-semibold text-ink">{item.course.name}</h3>
          <p className="text-sm text-muted">{item.facultyName}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            item.eligible ? "bg-teal/10 text-teal" : "bg-accent/10 text-accent"
          }`}
        >
          {item.eligible ? "Eligible" : "Below 75%"}
        </span>
      </div>
      <PercentBar value={item.percent} min={item.course.minPercent} />
      <p className="mt-3 text-sm text-muted">
        {item.present + item.late} present · {item.late} late · {item.total} ended classes
      </p>
    </article>
  );
}

export function SessionList({
  sessions,
  empty,
}: {
  sessions: SessionRow[];
  empty: string;
}) {
  if (!sessions.length) {
    return <p className="text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {sessions.map((session) => (
        <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <p className="font-medium text-ink">{session.title}</p>
            <p className="text-sm text-muted">
              {session.courseCode} · {session.departmentCode} ·{" "}
              {new Date(session.startsAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full border border-line px-2 py-1 capitalize">
              {session.status}
            </span>
            {session.myStatus && session.myStatus !== "none" ? (
              <span className="rounded-full bg-teal/10 px-2 py-1 text-teal capitalize">
                {session.myStatus}
              </span>
            ) : null}
            <span className="text-muted">
              {session.presentCount}/{session.enrolledCount}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
