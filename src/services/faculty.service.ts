import { persistRoleCookie } from "@/lib/auth";
import apiFetch from "@/lib/apiClient";
import type {
  AssignmentSubmission,
  AssignmentsApiResponse,
  AssignmentApiResponse,
  CreateAssignmentPayload,
  CreateExamPayload,
  ExamApiResponse,
  FacultyAssignment,
  FacultyExam,
  FacultyProfile,
  FacultyProfileApiResponse,
  FacultyResult,
  PostResultPayload,
  RecordAttendancePayload,
  Section,
  SectionsApiResponse,
  StudentsApiResponse,
  TaughtStudent,
  UpdateFacultyProfilePayload,
} from "@/types/faculty";

async function fetchFacultyDetail<T>(
  url: string,
  fallbackError: string,
): Promise<T> {
  const res = await apiFetch<{ data?: T; message?: string }>(url);
  if (res && typeof res === "object" && "data" in res && res.data !== undefined) {
    return res.data as T;
  }
  throw new Error(res?.message || fallbackError);
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function fetchFacultyProfile(): Promise<FacultyProfile> {
  const res = await apiFetch<FacultyProfileApiResponse>("/api/v1/faculty/me");
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to fetch faculty profile");
}

export async function updateFacultyProfile(
  payload: UpdateFacultyProfilePayload,
): Promise<FacultyProfile> {
  const res = await apiFetch<FacultyProfileApiResponse>("/api/v1/faculty/me", {
    method: "PATCH",
    body: payload,
  });
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to update faculty profile");
}

export async function createFacultyProfile(
  payload: Partial<FacultyProfile> & {
    departmentId?: string;
    designation?: string;
    specialization?: string;
    joiningDate?: string;
    phone?: string;
    photoUrl?: string;
  },
): Promise<FacultyProfile> {
  const res = await apiFetch<{
    data?:
      | FacultyProfile
      | {
          accessToken?: string;
          refreshToken?: string;
          faculty?: FacultyProfile;
        };
    message?: string;
  }>("/api/v1/faculty/me", {
    method: "POST",
    body: payload,
  });

  const data = res?.data;
  if (data && "faculty" in data && data.faculty) {
    persistRoleCookie("FACULTY");
    try {
      return await fetchFacultyProfile();
    } catch {
      return data.faculty;
    }
  }
  if (data && "id" in data && data.id) return data as FacultyProfile;
  throw new Error(res?.message || "Failed to create faculty profile");
}

export async function fetchFacultySectionDetail(id: string): Promise<{
  assignments?: FacultyAssignment[];
  exams?: FacultyExam[];
} & Partial<Section>> {
  const res = await apiFetch<{
    data: { assignments?: FacultyAssignment[]; exams?: FacultyExam[] } & Partial<Section>;
    message?: string;
  }>(`/api/v1/faculty/sections/${encodeURIComponent(id)}`);
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to fetch section detail");
}

export async function fetchFacultyStudent(id: string): Promise<TaughtStudent> {
  return fetchFacultyDetail<TaughtStudent>(
    `/api/v1/faculty/students/${encodeURIComponent(id)}`,
    "Failed to fetch faculty student",
  );
}

export const fetchFacultyStudentDetail = fetchFacultyStudent;

export async function fetchFacultyAssignments(): Promise<FacultyAssignment[]> {
  try {
    const res = await apiFetch<AssignmentsApiResponse>(
      "/api/v1/faculty/me/assignments",
    );
    if (Array.isArray(res?.data)) return res.data;
  } catch {
    // List endpoint is optional — fall back to section details.
  }

  const sections = await fetchFacultySections();
  const details = await Promise.all(
    sections.map((s) => fetchFacultySectionDetail(s.id).catch(() => null)),
  );
  const assignments: FacultyAssignment[] = [];
  for (const detail of details) {
    if (!detail?.assignments) continue;
    for (const assignment of detail.assignments) {
      assignments.push({
        ...assignment,
        section:
          assignment.section ??
          (detail.name
            ? {
                name: detail.name,
                course: detail.course
                  ? { code: detail.course.code, title: detail.course.title }
                  : undefined,
              }
            : assignment.section),
      });
    }
  }
  return assignments;
}

export async function fetchFacultyExams(): Promise<FacultyExam[]> {
  try {
    const res = await apiFetch<{ data: FacultyExam[] }>(
      "/api/v1/faculty/exams",
    );
    if (Array.isArray(res?.data)) return res.data;
  } catch {
    // List endpoint is optional — fall back to section details.
  }

  const sections = await fetchFacultySections();
  const details = await Promise.all(
    sections.map((s) => fetchFacultySectionDetail(s.id).catch(() => null)),
  );
  const exams: FacultyExam[] = [];
  for (const detail of details) {
    if (!detail?.exams) continue;
    for (const exam of detail.exams) {
      exams.push({
        ...exam,
        section:
          exam.section ??
          (detail.name
            ? {
                name: detail.name,
                course: detail.course
                  ? { code: detail.course.code, title: detail.course.title }
                  : undefined,
              }
            : exam.section),
      });
    }
  }
  return exams;
}

// ── Sections ──────────────────────────────────────────────────────────────────

export async function fetchFacultySections(params?: {
  semesterId?: string;
  courseId?: string;
}): Promise<Section[]> {
  let url = "/api/v1/faculty/me/sections";
  if (params?.semesterId)
    url += `?semesterId=${encodeURIComponent(params.semesterId)}`;
  else if (params?.courseId)
    url += `?courseId=${encodeURIComponent(params.courseId)}`;

  const res = await apiFetch<SectionsApiResponse>(url);
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to fetch sections");
}

// ── Students ──────────────────────────────────────────────────────────────────

export async function fetchFacultyStudents(params?: {
  sectionId?: string;
  search?: string;
}): Promise<TaughtStudent[]> {
  const searchParams = new URLSearchParams();
  if (params?.sectionId) searchParams.set("sectionId", params.sectionId);
  if (params?.search) searchParams.set("search", params.search);

  const query = searchParams.toString();
  const url = `/api/v1/faculty/me/students${query ? `?${query}` : ""}`;

  const res = await apiFetch<StudentsApiResponse | TaughtStudent[] | { data: unknown }>(
    url,
  );
  const payload = Array.isArray(res) ? res : res && typeof res === "object" ? (res as { data?: unknown }).data : undefined;
  const list = unwrapStudentList(payload);

  if (list.length > 0 || payload !== undefined) {
    return list.map(normalizeTaughtStudent).filter((s): s is TaughtStudent => s !== null);
  }

  throw new Error(
    (res as StudentsApiResponse)?.message || "Failed to fetch students",
  );
}

function unwrapStudentList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["students", "data", "items", "result"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function stringField(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function normalizeTaughtStudent(raw: unknown): TaughtStudent | null {
  const item = asRecord(raw);
  if (!item) return null;

  const nestedStudent = asRecord(item.student);
  const student = nestedStudent ?? item;
  const user = asRecord(student.user) ?? asRecord(item.user) ?? {};

  const id = stringField(student.id, item.id, student.studentId, item.studentId);
  if (!id) return null;

  const name =
    stringField(user.name, student.name, item.name) || "Unknown Student";

  return {
    id,
    studentId: stringField(student.studentId, item.studentId, id),
    userId: stringField(student.userId, user.id, item.userId),
    currentYear: Number(student.currentYear ?? item.currentYear ?? 0) || 0,
    currentSemester:
      Number(student.currentSemester ?? item.currentSemester ?? 0) || 0,
    user: {
      id: stringField(user.id, student.userId, id),
      name,
      email: stringField(user.email, student.email, item.email),
      photoUrl:
        stringField(user.photoUrl, student.photoUrl, item.photoUrl) || null,
    },
    enrollments: Array.isArray(student.enrollments)
      ? (student.enrollments as TaughtStudent["enrollments"])
      : Array.isArray(item.enrollments)
        ? (item.enrollments as TaughtStudent["enrollments"])
        : undefined,
  };
}

// ── Assignments ───────────────────────────────────────────────────────────────

export async function fetchFacultyAssignment(
  id: string,
): Promise<FacultyAssignment> {
  return fetchFacultyDetail<FacultyAssignment>(
    `/api/v1/faculty/assignments/${encodeURIComponent(id)}`,
    "Failed to fetch assignment",
  );
}

export const fetchFacultyAssignmentDetail = fetchFacultyAssignment;

export async function createAssignment(
  payload: CreateAssignmentPayload,
): Promise<FacultyAssignment> {
  const res = await apiFetch<AssignmentApiResponse>(
    "/api/v1/faculty/assignments",
    {
      method: "POST",
      body: payload,
    },
  );
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to create assignment");
}

export async function updateAssignment(
  id: string,
  payload: Partial<CreateAssignmentPayload>,
): Promise<FacultyAssignment> {
  const res = await apiFetch<AssignmentApiResponse>(
    `/api/v1/faculty/assignments/${encodeURIComponent(id)}`,
    { method: "PATCH", body: payload },
  );
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to update assignment");
}

export async function fetchAssignmentSubmissions(
  assignmentId: string,
): Promise<AssignmentSubmission[]> {
  const res = await apiFetch<{ data: AssignmentSubmission[] }>(
    `/api/v1/faculty/assignments/${encodeURIComponent(assignmentId)}/submissions`,
  );
  if (res?.data) return res.data;
  throw new Error("Failed to fetch submissions");
}

// ── Exams ─────────────────────────────────────────────────────────────────────

export async function fetchFacultyExam(id: string): Promise<FacultyExam> {
  return fetchFacultyDetail<FacultyExam>(
    `/api/v1/faculty/exams/${encodeURIComponent(id)}`,
    "Failed to fetch exam",
  );
}

export const fetchFacultyExamDetail = fetchFacultyExam;

export async function createExam(
  payload: CreateExamPayload,
): Promise<FacultyExam> {
  const res = await apiFetch<ExamApiResponse>("/api/v1/faculty/exams", {
    method: "POST",
    body: payload,
  });
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to create exam");
}

// ── Attendance ────────────────────────────────────────────────────────────────

export async function recordAttendance(
  sectionId: string,
  payload: RecordAttendancePayload,
): Promise<{
  recorded: number;
  alreadyRecorded: number;
  recordedStudentIds: string[];
  date: string;
}> {
  const records = [
    ...new Map(payload.records.map((record) => [record.studentId, record])).values(),
  ];
  if (records.length === 0) {
    throw new Error("Select at least one student before submitting attendance.");
  }

  const res = await apiFetch<{
    success?: boolean;
    statusCode?: number;
    message?: string;
    data?: unknown;
  }>(
    `/api/v1/faculty/sections/${encodeURIComponent(sectionId)}/attendance`,
    { method: "POST", body: { ...payload, records } },
  );
  if (res?.success === false) {
    throw new Error(res.message || "Failed to record attendance");
  }

  const responseData =
    res?.data && typeof res.data === "object"
      ? (res.data as Record<string, unknown>)
      : {};
  const rawTotalRecorded =
    responseData.totalRecorded ?? responseData.recorded ?? responseData.count;
  const recorded =
    typeof rawTotalRecorded === "number" && Number.isFinite(rawTotalRecorded)
      ? rawTotalRecorded
      : records.length;
  const rawAlreadyRecorded = responseData.alreadyRecorded;
  const alreadyRecorded =
    typeof rawAlreadyRecorded === "number" && Number.isFinite(rawAlreadyRecorded)
      ? rawAlreadyRecorded
      : 0;
  const createdRecords = Array.isArray(responseData.records)
    ? responseData.records.filter(
        (record): record is Record<string, unknown> =>
          typeof record === "object" && record !== null,
      )
    : [];
  const recordedStudentIds = createdRecords
    .map((record) => record.studentId)
    .filter((studentId): studentId is string => typeof studentId === "string");
  const date =
    typeof responseData.date === "string" && responseData.date
      ? responseData.date.slice(0, 10)
      : payload.date;

  return {
    recorded,
    alreadyRecorded,
    recordedStudentIds:
      recordedStudentIds.length > 0
        ? recordedStudentIds
        : alreadyRecorded === 0
          ? records.map((record) => record.studentId)
          : [],
    date,
  };
}

export async function correctAttendance(
  attendanceId: string,
  status: "PRESENT" | "ABSENT" | "LATE",
): Promise<void> {
  await apiFetch(
    `/api/v1/faculty/attendance/${encodeURIComponent(attendanceId)}`,
    {
      method: "PATCH",
      body: { status },
    },
  );
}

// ── Results ───────────────────────────────────────────────────────────────────

export async function postResult(
  payload: PostResultPayload,
): Promise<FacultyResult> {
  const res = await apiFetch<{ data: FacultyResult }>(
    "/api/v1/faculty/results",
    {
      method: "POST",
      body: payload,
    },
  );
  if (res?.data) return res.data;
  throw new Error("Failed to post result");
}

export async function correctResult(
  resultId: string,
  marks: number,
): Promise<FacultyResult> {
  const res = await apiFetch<{ data: FacultyResult }>(
    `/api/v1/faculty/results/${encodeURIComponent(resultId)}`,
    { method: "PATCH", body: { marks } },
  );
  if (res?.data) return res.data;
  throw new Error("Failed to correct result");
}

// ── Mock data for demo fallback ───────────────────────────────────────────────

export const mockFacultyProfile: FacultyProfile = {
  id: "fac-mock-uuid-1",
  employeeId: "FAC20262596",
  userId: "user-fac-uuid-1",
  departmentId: "dept-cse-uuid",
  designation: "Assistant Professor",
  specialization: "Artificial Intelligence & Data Science",
  joiningDate: "2026-01-15",
  phone: "+8801811000000",
  photoUrl: "",
  user: {
    id: "user-fac-uuid-1",
    name: "Dr. Sarah Ahmed",
    email: "sarah.ahmed@university.edu",
    role: "FACULTY",
    phone: "+8801811000000",
    photoUrl: "",
    status: "ACTIVE",
  },
  department: {
    id: "dept-cse-uuid",
    name: "Computer Science & Engineering",
    code: "CSE",
    facultyName: "Faculty of Science & Engineering",
  },
};

export const mockSections: Section[] = [
  {
    id: "sec-cse301-a",
    name: "Section 01",
    courseId: "course-cse301",
    semesterId: "sem-fall-2026",
    facultyId: "fac-mock-uuid-1",
    capacity: 40,
    enrolledCount: 36,
    schedule: "Mon, Wed 10:00 AM – 11:30 AM",
    room: "Lab 402, Academic Bldg A",
    course: {
      id: "course-cse301",
      code: "CSE-301",
      title: "Database Management Systems",
      credit: 3.0,
    },
    semester: {
      id: "sem-fall-2026",
      name: "Fall 2026",
      year: 2026,
      status: "ONGOING",
    },
  },
  {
    id: "sec-cse311-a",
    name: "Section 01",
    courseId: "course-cse311",
    semesterId: "sem-fall-2026",
    facultyId: "fac-mock-uuid-1",
    capacity: 40,
    enrolledCount: 39,
    schedule: "Mon, Wed 01:00 PM – 02:30 PM",
    room: "Software Lab 201",
    course: {
      id: "course-cse311",
      code: "CSE-311",
      title: "Web & Enterprise Application Development",
      credit: 3.0,
    },
    semester: {
      id: "sem-fall-2026",
      name: "Fall 2026",
      year: 2026,
      status: "ONGOING",
    },
  },
  {
    id: "sec-cse421-a",
    name: "Section 01",
    courseId: "course-cse421",
    semesterId: "sem-fall-2026",
    facultyId: "fac-mock-uuid-1",
    capacity: 35,
    enrolledCount: 22,
    schedule: "Sun, Tue 11:30 AM – 01:00 PM",
    room: "AI Research Lab 501",
    course: {
      id: "course-cse421",
      code: "CSE-421",
      title: "Machine Learning & Neural Networks",
      credit: 3.0,
    },
    semester: {
      id: "sem-fall-2026",
      name: "Fall 2026",
      year: 2026,
      status: "ONGOING",
    },
  },
];

export const mockAssignments: FacultyAssignment[] = [
  {
    id: "asgn-mock-1",
    sectionId: "sec-cse301-a",
    title: "Lab Report 1 – ER Diagram Design",
    description:
      "Design a complete ER diagram for a hospital management system.",
    deadline: "2026-11-01T23:59:00.000Z",
    totalMarks: 100,
    section: {
      name: "Section 01",
      course: { code: "CSE-301", title: "Database Management Systems" },
    },
  },
  {
    id: "asgn-mock-2",
    sectionId: "sec-cse311-a",
    title: "Project Milestone 1 – API Design",
    description: "Submit a RESTful API specification using OpenAPI 3.0.",
    deadline: "2026-11-04T23:59:00.000Z",
    totalMarks: 50,
    section: {
      name: "Section 01",
      course: {
        code: "CSE-311",
        title: "Web & Enterprise Application Development",
      },
    },
  },
  {
    id: "asgn-mock-3",
    sectionId: "sec-cse421-a",
    title: "ML Assignment 1 – Linear Regression",
    description: "Implement linear regression from scratch using numpy.",
    deadline: "2026-10-08T23:59:00.000Z",
    totalMarks: 80,
    section: {
      name: "Section 01",
      course: { code: "CSE-421", title: "Machine Learning & Neural Networks" },
    },
  },
];

export const mockExams: FacultyExam[] = [
  {
    id: "exam-mock-1",
    sectionId: "sec-cse301-a",
    title: "Midterm Exam 2026",
    type: "MIDTERM",
    examDate: "2026-10-24T19:00:00.000Z",
    totalMarks: 50,
    section: {
      name: "Section 01",
      course: { code: "CSE-301", title: "Database Management Systems" },
    },
  },
  {
    id: "exam-mock-2",
    sectionId: "sec-cse311-a",
    title: "Quiz 1 – REST APIs",
    type: "QUIZ",
    examDate: "2026-10-13T19:00:00.000Z",
    totalMarks: 20,
    section: {
      name: "Section 01",
      course: {
        code: "CSE-311",
        title: "Web & Enterprise Application Development",
      },
    },
  },
];
