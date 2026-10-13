import { redirect } from "next/navigation";
import { adminSnapshot, resetDemoAction } from "@/app/actions";
import { PageFrame } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await adminSnapshot();
  if (!data) redirect("/login");

  return (
    <PageFrame user={data.user}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Campus overview</h1>
          <p className="text-sm text-muted">{data.studentCount} students across departments</p>
        </div>
        <form action={resetDemoAction}>
          <button className="rounded-full border border-line bg-paper px-4 py-2 text-sm">
            Reset demo data
          </button>
        </form>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data.departments.map((dept) => (
          <article key={dept.id} className="paper rounded-[2rem] p-5">
            <p className="text-xs tracking-widest text-muted uppercase">{dept.code}</p>
            <h2 className="text-xl font-semibold text-ink">{dept.name}</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Students</dt>
                <dd className="text-lg font-medium">{dept.studentCount}</dd>
              </div>
              <div>
                <dt className="text-muted">Faculty</dt>
                <dd className="text-lg font-medium">{dept.facultyCount}</dd>
              </div>
              <div>
                <dt className="text-muted">Courses</dt>
                <dd className="text-lg font-medium">{dept.courseCount}</dd>
              </div>
              <div>
                <dt className="text-muted">Live rooms</dt>
                <dd className="text-lg font-medium">{dept.liveCount}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted">Students below 75% in a course</dt>
                <dd className={`text-lg font-medium ${dept.atRisk ? "text-accent" : "text-ok"}`}>
                  {dept.atRisk}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}
