import type {
  AttendanceRecord,
  AttendanceStatus,
  ClassSession,
  CourseAttendance,
  Database,
  PublicUser,
  SessionRow,
  User,
} from "./types";

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return rest;
}

export function enrolledCourseIds(db: Database, studentId: string) {
  return db.enrollments.filter((e) => e.studentId === studentId).map((e) => e.courseId);
}

export function studentsInCourse(db: Database, courseId: string) {
  const ids = new Set(db.enrollments.filter((e) => e.courseId === courseId).map((e) => e.studentId));
  return db.users.filter((u) => ids.has(u.id));
}

export function sessionForCourse(db: Database, courseId: string) {
  return db.sessions.filter((s) => s.courseId === courseId);
}

function countedStatus(status: AttendanceStatus) {
  return status === "present" || status === "late";
}

export function courseAttendanceForStudent(
  db: Database,
  studentId: string,
): CourseAttendance[] {
  const facultyById = new Map(db.users.map((u) => [u.id, u.name]));
  const courseIds = enrolledCourseIds(db, studentId);
  return db.courses
    .filter((c) => courseIds.includes(c.id))
    .map((course) => {
      const ended = sessionForCourse(db, course.id).filter((s) => s.status === "ended");
      const mine = db.attendance.filter((a) => a.studentId === studentId && ended.some((s) => s.id === a.sessionId));
      const present = mine.filter((a) => a.status === "present").length;
      const late = mine.filter((a) => a.status === "late").length;
      const total = ended.length;
      const percent = total === 0 ? 100 : Math.round(((present + late) / total) * 1000) / 10;
      return {
        course,
        facultyName: facultyById.get(course.facultyId) ?? "Faculty",
        present,
        late,
        total,
        percent,
        eligible: percent >= course.minPercent,
      };
    });
}

export function decorateSession(db: Database, session: ClassSession, studentId?: string): SessionRow {
  const course = db.courses.find((c) => c.id === session.courseId)!;
  const dept = db.departments.find((d) => d.id === course.departmentId)!;
  const presentCount = db.attendance.filter(
    (a) => a.sessionId === session.id && countedStatus(a.status),
  ).length;
  const enrolledCount = db.enrollments.filter((e) => e.courseId === session.courseId).length;
  const mine = studentId
    ? db.attendance.find((a) => a.sessionId === session.id && a.studentId === studentId)
    : undefined;
  return {
    ...session,
    courseCode: course.code,
    courseName: course.name,
    departmentCode: dept.code,
    presentCount,
    enrolledCount,
    myStatus: mine?.status ?? (studentId ? "none" : undefined),
  };
}

export function upsertAttendance(
  db: Database,
  record: Omit<AttendanceRecord, "id"> & { id?: string },
) {
  const existing = db.attendance.find(
    (a) => a.sessionId === record.sessionId && a.studentId === record.studentId,
  );
  if (existing) {
    existing.status = record.status;
    existing.method = record.method;
    existing.markedAt = record.markedAt;
    return existing;
  }
  const created: AttendanceRecord = {
    id: record.id ?? crypto.randomUUID(),
    sessionId: record.sessionId,
    studentId: record.studentId,
    status: record.status,
    method: record.method,
    markedAt: record.markedAt,
  };
  db.attendance.push(created);
  return created;
}
