import { hashPassword } from "./password";
import type { AttendanceRecord, ClassSession, Database } from "./types";

const PASSWORD = hashPassword("campus123", "demo-salt-campusroll");

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function createSeed(): Database {
  const departments = [
    { id: "dept-cse", code: "CSE", name: "Computer Science & Engineering" },
    { id: "dept-ece", code: "ECE", name: "Electronics & Communication" },
    { id: "dept-me", code: "ME", name: "Mechanical Engineering" },
    { id: "dept-civil", code: "CIVIL", name: "Civil Engineering" },
  ];

  const users = [
    {
      id: "admin-1",
      name: "Dr. Meera Iyer",
      login: "admin",
      passwordHash: PASSWORD,
      role: "admin" as const,
      departmentId: "dept-cse",
    },
    {
      id: "fac-cse",
      name: "Prof. Arjun Menon",
      login: "faculty.cse",
      passwordHash: PASSWORD,
      role: "faculty" as const,
      departmentId: "dept-cse",
    },
    {
      id: "fac-ece",
      name: "Prof. Kavya Nair",
      login: "faculty.ece",
      passwordHash: PASSWORD,
      role: "faculty" as const,
      departmentId: "dept-ece",
    },
    {
      id: "fac-me",
      name: "Prof. Rohan Desai",
      login: "faculty.me",
      passwordHash: PASSWORD,
      role: "faculty" as const,
      departmentId: "dept-me",
    },
    {
      id: "fac-civil",
      name: "Prof. Ananya Rao",
      login: "faculty.civil",
      passwordHash: PASSWORD,
      role: "faculty" as const,
      departmentId: "dept-civil",
    },
    ...cseStudents(),
    ...eceStudents(),
    ...meStudents(),
    ...civilStudents(),
  ];

  const courses = [
    {
      id: "cse-dsa",
      code: "CS301",
      name: "Data Structures",
      departmentId: "dept-cse",
      facultyId: "fac-cse",
      minPercent: 75,
    },
    {
      id: "cse-dbms",
      code: "CS305",
      name: "Database Systems",
      departmentId: "dept-cse",
      facultyId: "fac-cse",
      minPercent: 75,
    },
    {
      id: "ece-dsp",
      code: "EC210",
      name: "Digital Signal Processing",
      departmentId: "dept-ece",
      facultyId: "fac-ece",
      minPercent: 75,
    },
    {
      id: "me-thermo",
      code: "ME220",
      name: "Thermodynamics",
      departmentId: "dept-me",
      facultyId: "fac-me",
      minPercent: 75,
    },
    {
      id: "civil-som",
      code: "CE201",
      name: "Strength of Materials",
      departmentId: "dept-civil",
      facultyId: "fac-civil",
      minPercent: 75,
    },
  ];

  const enrollments = [
    ...["stu-cse-1", "stu-cse-2", "stu-cse-3", "stu-cse-4", "stu-cse-5"].flatMap((id) => [
      { studentId: id, courseId: "cse-dsa" },
      { studentId: id, courseId: "cse-dbms" },
    ]),
    ...["stu-ece-1", "stu-ece-2", "stu-ece-3"].map((id) => ({
      studentId: id,
      courseId: "ece-dsp",
    })),
    ...["stu-me-1", "stu-me-2"].map((id) => ({ studentId: id, courseId: "me-thermo" })),
    ...["stu-civil-1", "stu-civil-2"].map((id) => ({ studentId: id, courseId: "civil-som" })),
  ];

  const sessions: ClassSession[] = [
    past("cse-dsa-1", "cse-dsa", "Trees & Graphs — virtual lab", 96, "482110"),
    past("cse-dsa-2", "cse-dsa", "Hashing recap", 72, "482111"),
    past("cse-dsa-3", "cse-dsa", "Heaps office hours", 48, "482112"),
    past("cse-dsa-4", "cse-dsa", "Complexity clinic", 24, "482113"),
    {
      id: "cse-dsa-live",
      courseId: "cse-dsa",
      title: "AVL trees — live virtual class",
      meetUrl: "https://meet.example.edu/cse-dsa-live",
      joinCode: "749201",
      startsAt: hoursAgo(0.2),
      endsAt: hoursFromNow(0.8),
      status: "live",
    },
    past("cse-dbms-1", "cse-dbms", "Normalization workshop", 80, "305101"),
    past("cse-dbms-2", "cse-dbms", "SQL joins lab", 50, "305102"),
    past("cse-dbms-3", "cse-dbms", "Indexing & query plans", 20, "305103"),
    past("ece-dsp-1", "ece-dsp", "FFT virtual studio", 40, "210101"),
    past("ece-dsp-2", "ece-dsp", "Filter design", 16, "210102"),
    past("me-thermo-1", "me-thermo", "First law problems", 30, "220101"),
    past("civil-som-1", "civil-som", "Shear force diagrams", 28, "201101"),
  ];

  const attendance: AttendanceRecord[] = [
    ...markEnded("cse-dsa-1", {
      "stu-cse-1": "present",
      "stu-cse-2": "present",
      "stu-cse-3": "late",
      "stu-cse-4": "absent",
      "stu-cse-5": "present",
    }),
    ...markEnded("cse-dsa-2", {
      "stu-cse-1": "present",
      "stu-cse-2": "absent",
      "stu-cse-3": "present",
      "stu-cse-4": "absent",
      "stu-cse-5": "present",
    }),
    ...markEnded("cse-dsa-3", {
      "stu-cse-1": "present",
      "stu-cse-2": "present",
      "stu-cse-3": "present",
      "stu-cse-4": "late",
      "stu-cse-5": "absent",
    }),
    ...markEnded("cse-dsa-4", {
      "stu-cse-1": "present",
      "stu-cse-2": "present",
      "stu-cse-3": "absent",
      "stu-cse-4": "absent",
      "stu-cse-5": "present",
    }),
    ...markEnded("cse-dbms-1", {
      "stu-cse-1": "present",
      "stu-cse-2": "present",
      "stu-cse-3": "present",
      "stu-cse-4": "present",
      "stu-cse-5": "late",
    }),
    ...markEnded("cse-dbms-2", {
      "stu-cse-1": "present",
      "stu-cse-2": "late",
      "stu-cse-3": "present",
      "stu-cse-4": "absent",
      "stu-cse-5": "present",
    }),
    ...markEnded("cse-dbms-3", {
      "stu-cse-1": "present",
      "stu-cse-2": "present",
      "stu-cse-3": "present",
      "stu-cse-4": "absent",
      "stu-cse-5": "present",
    }),
    ...markEnded("ece-dsp-1", {
      "stu-ece-1": "present",
      "stu-ece-2": "present",
      "stu-ece-3": "absent",
    }),
    ...markEnded("ece-dsp-2", {
      "stu-ece-1": "present",
      "stu-ece-2": "late",
      "stu-ece-3": "present",
    }),
    ...markEnded("me-thermo-1", {
      "stu-me-1": "present",
      "stu-me-2": "absent",
    }),
    ...markEnded("civil-som-1", {
      "stu-civil-1": "present",
      "stu-civil-2": "present",
    }),
  ];

  return { departments, users, courses, enrollments, sessions, attendance };
}

function student(
  id: string,
  name: string,
  login: string,
  departmentId: string,
  rollNo: string,
) {
  return {
    id,
    name,
    login,
    passwordHash: PASSWORD,
    role: "student" as const,
    departmentId,
    rollNo,
  };
}

function cseStudents() {
  return [
    student("stu-cse-1", "Aditi Sharma", "CSE2024001", "dept-cse", "CSE2024001"),
    student("stu-cse-2", "Rahul Verma", "CSE2024002", "dept-cse", "CSE2024002"),
    student("stu-cse-3", "Sneha Patel", "CSE2024003", "dept-cse", "CSE2024003"),
    student("stu-cse-4", "Vikram Singh", "CSE2024004", "dept-cse", "CSE2024004"),
    student("stu-cse-5", "Nisha Reddy", "CSE2024005", "dept-cse", "CSE2024005"),
  ];
}

function eceStudents() {
  return [
    student("stu-ece-1", "Ishaan Kapoor", "ECE2024001", "dept-ece", "ECE2024001"),
    student("stu-ece-2", "Priya Das", "ECE2024002", "dept-ece", "ECE2024002"),
    student("stu-ece-3", "Karthik Iyer", "ECE2024003", "dept-ece", "ECE2024003"),
  ];
}

function meStudents() {
  return [
    student("stu-me-1", "Aman Gupta", "ME2024001", "dept-me", "ME2024001"),
    student("stu-me-2", "Diya Joshi", "ME2024002", "dept-me", "ME2024002"),
  ];
}

function civilStudents() {
  return [
    student("stu-civil-1", "Farhan Ali", "CE2024001", "dept-civil", "CE2024001"),
    student("stu-civil-2", "Meera Kulkarni", "CE2024002", "dept-civil", "CE2024002"),
  ];
}

function past(id: string, courseId: string, title: string, hours: number, joinCode: string): ClassSession {
  return {
    id,
    courseId,
    title,
    meetUrl: `https://meet.example.edu/${id}`,
    joinCode,
    startsAt: hoursAgo(hours),
    endsAt: hoursAgo(hours - 1),
    status: "ended",
  };
}

function markEnded(
  sessionId: string,
  map: Record<string, AttendanceRecord["status"]>,
): AttendanceRecord[] {
  return Object.entries(map).map(([studentId, status]) => ({
    id: `${sessionId}-${studentId}`,
    sessionId,
    studentId,
    status,
    method: "code" as const,
    markedAt: hoursAgo(20),
  }));
}
