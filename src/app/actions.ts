"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser, homeFor, login, logout, requireUser } from "@/lib/auth";
import {
  courseAttendanceForStudent,
  decorateSession,
  studentsInCourse,
  upsertAttendance,
} from "@/lib/queries";
import { readDb, resetDb, updateDb } from "@/lib/store";
import type { AttendanceStatus } from "@/lib/types";

function sixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function loginAction(_: { error?: string } | null, formData: FormData) {
  const loginId = String(formData.get("login") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await login(loginId, password);
  if ("error" in result && result.error) return { error: result.error };
  if (!("user" in result) || !result.user) return { error: "Could not sign in." };
  redirect(homeFor(result.user.role));
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}

export async function checkInAction(_: { error?: string; ok?: string } | null, formData: FormData) {
  const user = await requireUser(["student"]);
  if (!user) return { error: "Sign in as a student first." };
  const code = String(formData.get("code") ?? "").trim();
  const db = await readDb();
  const session = db.sessions.find((s) => s.joinCode === code && s.status === "live");
  if (!session) return { error: "No live virtual class uses that code." };
  const enrolled = db.enrollments.some((e) => e.courseId === session.courseId && e.studentId === user.id);
  if (!enrolled) return { error: "This class is not in your department timetable." };

  const started = new Date(session.startsAt).getTime();
  const late = Date.now() - started > 10 * 60 * 1000;
  const status: AttendanceStatus = late ? "late" : "present";

  await updateDb((next) => {
    upsertAttendance(next, {
      sessionId: session.id,
      studentId: user.id,
      status,
      method: "code",
      markedAt: new Date().toISOString(),
    });
  });

  revalidatePath("/student");
  revalidatePath("/faculty");
  return {
    ok: status === "late" ? "Marked late for this live class." : "You're marked present.",
  };
}

export async function startSessionAction(_: { error?: string } | null, formData: FormData) {
  const user = await requireUser(["faculty", "admin"]);
  if (!user) return { error: "Faculty sign-in required." };
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const meetUrl = String(formData.get("meetUrl") ?? "").trim();
  const minutes = Number(formData.get("minutes") ?? 60);
  if (!courseId || !title) return { error: "Course and title are required." };

  const db = await readDb();
  const course = db.courses.find((c) => c.id === courseId);
  if (!course) return { error: "Course not found." };
  if (user.role === "faculty" && course.facultyId !== user.id) {
    return { error: "You can only start classes for your own courses." };
  }

  const live = db.sessions.find((s) => s.courseId === courseId && s.status === "live");
  if (live) return { error: "This course already has a live virtual class." };

  await updateDb((next) => {
    next.sessions.push({
      id: crypto.randomUUID(),
      courseId,
      title,
      meetUrl: meetUrl || `https://meet.example.edu/${course.code.toLowerCase()}`,
      joinCode: sixDigitCode(),
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + Math.max(15, minutes) * 60 * 1000).toISOString(),
      status: "live",
    });
  });

  revalidatePath("/faculty");
  revalidatePath("/student");
  revalidatePath("/admin");
  return { error: undefined };
}

export async function endSessionAction(sessionId: string) {
  const user = await requireUser(["faculty", "admin"]);
  if (!user) return { error: "Faculty sign-in required." };

  await updateDb((next) => {
    const session = next.sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const course = next.courses.find((c) => c.id === session.courseId);
    if (user.role === "faculty" && course?.facultyId !== user.id) return;
    session.status = "ended";
    session.endsAt = new Date().toISOString();
    for (const student of studentsInCourse(next, session.courseId)) {
      const existing = next.attendance.find(
        (a) => a.sessionId === session.id && a.studentId === student.id,
      );
      if (!existing) {
        next.attendance.push({
          id: crypto.randomUUID(),
          sessionId: session.id,
          studentId: student.id,
          status: "absent",
          method: "faculty",
          markedAt: new Date().toISOString(),
        });
      }
    }
  });

  revalidatePath("/faculty");
  revalidatePath("/student");
  revalidatePath("/admin");
}

export async function markStudentAction(sessionId: string, studentId: string, status: AttendanceStatus) {
  const user = await requireUser(["faculty", "admin"]);
  if (!user) return { error: "Faculty sign-in required." };

  await updateDb((next) => {
    const session = next.sessions.find((s) => s.id === sessionId);
    if (!session || session.status === "ended") return;
    const course = next.courses.find((c) => c.id === session.courseId);
    if (user.role === "faculty" && course?.facultyId !== user.id) return;
    upsertAttendance(next, {
      sessionId,
      studentId,
      status,
      method: "faculty",
      markedAt: new Date().toISOString(),
    });
  });

  revalidatePath("/faculty");
  revalidatePath("/student");
}

export async function resetDemoAction() {
  const user = await currentUser();
  if (!user || user.role !== "admin") return;
  resetDb();
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/faculty");
  revalidatePath("/student");
}

export async function studentSnapshot() {
  const user = await requireUser(["student"]);
  if (!user) return null;
  const db = await readDb();
  const department = db.departments.find((d) => d.id === user.departmentId)!;
  const courses = courseAttendanceForStudent(db, user.id);
  const courseIds = new Set(courses.map((c) => c.course.id));
  const sessions = db.sessions
    .filter((s) => courseIds.has(s.courseId))
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt))
    .map((s) => decorateSession(db, s, user.id));
  return { user, department, courses, sessions };
}

export async function facultySnapshot() {
  const user = await requireUser(["faculty", "admin"]);
  if (!user) return null;
  const db = await readDb();
  const courses =
    user.role === "admin"
      ? db.courses
      : db.courses.filter((c) => c.facultyId === user.id);
  const sessions = db.sessions
    .filter((s) => courses.some((c) => c.id === s.courseId))
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt))
    .map((s) => decorateSession(db, s));

  const live = sessions.filter((s) => s.status === "live");
  const rosters = live.map((session) => {
    const people = studentsInCourse(db, session.courseId).map((student) => {
      const record = db.attendance.find(
        (a) => a.sessionId === session.id && a.studentId === student.id,
      );
      return {
        id: student.id,
        name: student.name,
        rollNo: student.rollNo ?? student.login,
        status: record?.status ?? ("none" as const),
      };
    });
    return { session, people };
  });

  return { user, courses, sessions, rosters };
}

export async function adminSnapshot() {
  const user = await requireUser(["admin"]);
  if (!user) return null;
  const db = await readDb();
  const departments = db.departments.map((dept) => {
    const students = db.users.filter((u) => u.role === "student" && u.departmentId === dept.id);
    const faculty = db.users.filter((u) => u.role === "faculty" && u.departmentId === dept.id);
    const courses = db.courses.filter((c) => c.departmentId === dept.id);
    const atRisk = students.filter((s) =>
      courseAttendanceForStudent(db, s.id).some((c) => !c.eligible && c.total > 0),
    ).length;
    return {
      ...dept,
      studentCount: students.length,
      facultyCount: faculty.length,
      courseCount: courses.length,
      liveCount: db.sessions.filter(
        (s) => s.status === "live" && courses.some((c) => c.id === s.courseId),
      ).length,
      atRisk,
    };
  });
  return { user, departments, studentCount: db.users.filter((u) => u.role === "student").length };
}
