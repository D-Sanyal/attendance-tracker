export type Role = "student" | "faculty" | "admin";

export type Department = {
  id: string;
  code: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  login: string;
  passwordHash: string;
  role: Role;
  departmentId: string;
  rollNo?: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  facultyId: string;
  minPercent: number;
};

export type Enrollment = {
  studentId: string;
  courseId: string;
};

export type SessionStatus = "scheduled" | "live" | "ended";

export type ClassSession = {
  id: string;
  courseId: string;
  title: string;
  meetUrl: string;
  joinCode: string;
  startsAt: string;
  endsAt: string;
  status: SessionStatus;
};

export type AttendanceStatus = "present" | "late" | "absent";

export type AttendanceRecord = {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  method: "code" | "faculty";
  markedAt: string;
};

export type Database = {
  departments: Department[];
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  sessions: ClassSession[];
  attendance: AttendanceRecord[];
};

export type PublicUser = Omit<User, "passwordHash">;

export type CourseAttendance = {
  course: Course;
  facultyName: string;
  present: number;
  late: number;
  total: number;
  percent: number;
  eligible: boolean;
};

export type SessionRow = ClassSession & {
  courseCode: string;
  courseName: string;
  departmentCode: string;
  presentCount: number;
  enrolledCount: number;
  myStatus?: AttendanceStatus | "none";
};
