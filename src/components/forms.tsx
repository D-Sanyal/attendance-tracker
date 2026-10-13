"use client";

import { useActionState } from "react";
import {
  checkInAction,
  loginAction,
  markStudentAction,
  startSessionAction,
} from "@/app/actions";
import type { Course } from "@/lib/types";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        Roll number or ID
        <input
          name="login"
          required
          autoComplete="username"
          placeholder="CSE2024001"
          className="rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:border-teal"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          defaultValue="campus123"
          className="rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:border-teal"
        />
      </label>
      {state?.error ? <p className="text-sm text-accent">{state.error}</p> : null}
      <button
        disabled={pending}
        className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Enter campus"}
      </button>
    </form>
  );
}

export function CheckInForm() {
  const [state, action, pending] = useActionState(checkInAction, null);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row">
      <input
        name="code"
        required
        inputMode="numeric"
        maxLength={6}
        placeholder="Live class code"
        className="flex-1 rounded-xl border border-line bg-white px-3 py-2.5 tracking-[0.3em] outline-none focus:border-teal"
      />
      <button
        disabled={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-60"
      >
        {pending ? "Checking…" : "Mark me present"}
      </button>
      {state?.error ? <p className="w-full text-sm text-accent">{state.error}</p> : null}
      {state?.ok ? <p className="w-full text-sm text-ok">{state.ok}</p> : null}
    </form>
  );
}

export function StartClassForm({ courses }: { courses: Course[] }) {
  const [state, action, pending] = useActionState(startSessionAction, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm sm:col-span-2">
        Course
        <select
          name="courseId"
          className="rounded-xl border border-line bg-white px-3 py-2.5"
          defaultValue={courses[0]?.id}
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} · {course.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        Session title
        <input
          name="title"
          required
          placeholder="Virtual lecture — unit 4"
          className="rounded-xl border border-line bg-white px-3 py-2.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Meeting link
        <input
          name="meetUrl"
          placeholder="https://meet.google.com/…"
          className="rounded-xl border border-line bg-white px-3 py-2.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Duration (minutes)
        <input
          name="minutes"
          type="number"
          min={15}
          defaultValue={60}
          className="rounded-xl border border-line bg-white px-3 py-2.5"
        />
      </label>
      {state?.error ? <p className="text-sm text-accent sm:col-span-2">{state.error}</p> : null}
      <button
        disabled={pending}
        className="rounded-full bg-teal px-4 py-2.5 text-sm font-medium text-paper sm:col-span-2 disabled:opacity-60"
      >
        {pending ? "Opening room…" : "Start virtual class"}
      </button>
    </form>
  );
}

export function RosterToggle({
  sessionId,
  studentId,
  status,
}: {
  sessionId: string;
  studentId: string;
  status: string;
}) {
  return (
    <div className="flex gap-1">
      {(["present", "late", "absent"] as const).map((value) => (
        <form key={value} action={markStudentAction.bind(null, sessionId, studentId, value)}>
          <button
            className={`rounded-full px-2.5 py-1 text-xs capitalize ${
              status === value ? "bg-ink text-paper" : "border border-line bg-white"
            }`}
          >
            {value}
          </button>
        </form>
      ))}
    </div>
  );
}
