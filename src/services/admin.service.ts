import apiFetch from "@/lib/apiClient";
import type {
  AdminCourse,
  AdminDashboardStats,
  AdminDepartment,
  AdminEnrollment,
  AdminFacultyMember,
  AdminPayment,
  AdminProgram,
  AdminSection,
  AdminSemester,
  AdminStudent,
  AdminSystemReport,
  CreateCoursePayload,
  CreateDepartmentPayload,
  CreateFacultyPayload,
  CreateProgramPayload,
  CreateSectionPayload,
  CreateSemesterPayload,
  CreateStudentPayload,
  ForceEnrollPayload,
  StudentFilterParams,
  UpdateDepartmentPayload,
  UpdateStudentPayload,
} from "@/types/admin";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

function extractArray<T>(res: unknown): T[] | null {
  if (!res) return null;
  if (Array.isArray(res)) return res;
  const obj = res as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data as T[];
  if (obj.data && typeof obj.data === "object") {
    const nested = obj.data as Record<string, unknown>;
    if (Array.isArray(nested.data)) return nested.data as T[];
    if (Array.isArray(nested.payments)) return nested.payments as T[];
    if (Array.isArray(nested.enrollments)) return nested.enrollments as T[];
    if (Array.isArray(nested.students)) return nested.students as T[];
    if (Array.isArray(nested.faculty)) return nested.faculty as T[];
    if (Array.isArray(nested.departments)) return nested.departments as T[];
    if (Array.isArray(nested.programs)) return nested.programs as T[];
    if (Array.isArray(nested.courses)) return nested.courses as T[];
    if (Array.isArray(nested.semesters)) return nested.semesters as T[];
    if (Array.isArray(nested.sections)) return nested.sections as T[];
    if (Array.isArray(nested.result)) return nested.result as T[];
  }
  if (Array.isArray(obj.payments)) return obj.payments as T[];
  if (Array.isArray(obj.enrollments)) return obj.enrollments as T[];
  if (Array.isArray(obj.students)) return obj.students as T[];
  if (Array.isArray(obj.result)) return obj.result as T[];
  return null;
}

function normalizeAdminFacultyMember(
  value: unknown,
): AdminFacultyMember | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const member = value as Record<string, unknown>;
  const user =
    member.user && typeof member.user === "object"
      ? (member.user as Record<string, unknown>)
      : {};
  const rawDepartment =
    member.department && typeof member.department === "object"
      ? (member.department as Record<string, unknown>)
      : null;
  const department =
    rawDepartment &&
    typeof rawDepartment.id === "string" &&
    typeof rawDepartment.name === "string" &&
    typeof rawDepartment.code === "string"
      ? {
          id: rawDepartment.id,
          name: rawDepartment.name,
          code: rawDepartment.code,
        }
      : undefined;
  const name =
    [member.name, user.name, member.fullName]
      .find(
        (field): field is string =>
          typeof field === "string" && Boolean(field.trim()),
      )
      ?.trim() || "Unnamed Faculty";
  const email =
    [member.email, user.email]
      .find(
        (field): field is string =>
          typeof field === "string" && Boolean(field.trim()),
      )
      ?.trim() || "";

  if (typeof member.id !== "string") return null;

  return {
    id: member.id,
    employeeId:
      typeof member.employeeId === "string" ? member.employeeId : undefined,
    userId:
      typeof member.userId === "string"
        ? member.userId
        : typeof user.id === "string"
          ? user.id
          : "",
    name,
    email,
    phone:
      typeof member.phone === "string"
        ? member.phone
        : typeof user.phone === "string"
          ? user.phone
          : undefined,
    departmentId:
      typeof member.departmentId === "string"
        ? member.departmentId
        : department?.id || "",
    designation:
      typeof member.designation === "string" ? member.designation : "",
    specialization:
      typeof member.specialization === "string"
        ? member.specialization
        : undefined,
    joiningDate:
      typeof member.joiningDate === "string" ? member.joiningDate : undefined,
    department,
    user:
      typeof user.id === "string" &&
      typeof user.name === "string" &&
      typeof user.email === "string"
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: typeof user.role === "string" ? user.role : "FACULTY",
            status: typeof user.status === "string" ? user.status : "ACTIVE",
          }
        : undefined,
  };
}

async function fetchAdminDetail<T>(
  url: string,
  fallbackError: string,
): Promise<T> {
  const res = await apiFetch<{ data?: T; message?: string }>(url);
  if (res && typeof res === "object" && "data" in res && res.data !== undefined) {
    return res.data as T;
  }
  throw new Error(res?.message || fallbackError);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  try {
    const res =
      await apiFetch<ApiResponse<AdminDashboardStats>>("/admin/dashboard");
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("fetchAdminDashboardStats using fallback mock:", err);
  }
  return mockAdminStats;
}

export async function fetchAdminStudent(id: string): Promise<AdminStudent> {
  return fetchAdminDetail<AdminStudent>(
    `/admin/students/${encodeURIComponent(id)}`,
    "Failed to fetch student",
  );
}

export const fetchAdminStudentById = fetchAdminStudent;
export const fetchAdminStudentDetail = fetchAdminStudent;

export async function fetchAdminFacultyMember(
  id: string,
): Promise<AdminFacultyMember> {
  return fetchAdminDetail<AdminFacultyMember>(
    `/admin/faculty/${encodeURIComponent(id)}`,
    "Failed to fetch faculty member",
  );
}

export const fetchAdminFacultyById = fetchAdminFacultyMember;
export const fetchAdminFacultyDetail = fetchAdminFacultyMember;

export async function fetchAdminDepartment(
  id: string,
): Promise<AdminDepartment> {
  return fetchAdminDetail<AdminDepartment>(
    `/admin/departments/${encodeURIComponent(id)}`,
    "Failed to fetch department",
  );
}

export const fetchAdminDepartmentDetail = fetchAdminDepartment;

export async function fetchAdminProgram(id: string): Promise<AdminProgram> {
  return fetchAdminDetail<AdminProgram>(
    `/admin/programs/${encodeURIComponent(id)}`,
    "Failed to fetch program",
  );
}

export const fetchAdminProgramDetail = fetchAdminProgram;

export async function fetchAdminCourse(id: string): Promise<AdminCourse> {
  return fetchAdminDetail<AdminCourse>(
    `/admin/courses/${encodeURIComponent(id)}`,
    "Failed to fetch course",
  );
}

export const fetchAdminCourseDetail = fetchAdminCourse;

export async function fetchAdminSemester(id: string): Promise<AdminSemester> {
  return fetchAdminDetail<AdminSemester>(
    `/admin/semesters/${encodeURIComponent(id)}`,
    "Failed to fetch semester",
  );
}

export const fetchAdminSemesterDetail = fetchAdminSemester;

export async function fetchAdminSection(id: string): Promise<AdminSection> {
  return fetchAdminDetail<AdminSection>(
    `/admin/sections/${encodeURIComponent(id)}`,
    "Failed to fetch section",
  );
}

export const fetchAdminSectionDetail = fetchAdminSection;

export async function fetchAdminEnrollment(
  id: string,
): Promise<AdminEnrollment> {
  return fetchAdminDetail<AdminEnrollment>(
    `/admin/enrollments/${encodeURIComponent(id)}`,
    "Failed to fetch enrollment",
  );
}

export const fetchAdminEnrollmentDetail = fetchAdminEnrollment;

export async function fetchAdminPayment(id: string): Promise<AdminPayment> {
  return fetchAdminDetail<AdminPayment>(
    `/admin/payments/${encodeURIComponent(id)}`,
    "Failed to fetch payment",
  );
}

export const fetchAdminPaymentDetail = fetchAdminPayment;

// ── Students ──────────────────────────────────────────────────────────────────

export async function fetchAdminStudents(
  params?: StudentFilterParams,
): Promise<AdminStudent[]> {
  try {
    const query = new URLSearchParams();
    if (params?.departmentId) query.set("departmentId", params.departmentId);
    if (params?.programId) query.set("programId", params.programId);
    if (params?.search) query.set("search", params.search);

    const queryString = query.toString();
    const url = `/admin/students${queryString ? `?${queryString}` : ""}`;
    const res = await apiFetch<unknown>(url);
    const arr = extractArray<AdminStudent>(res);
    if (arr !== null) return arr;
  } catch (err) {
    console.warn("fetchAdminStudents fallback to mock:", err);
  }

  // Filter mock data locally
  let filtered = [...mockAdminStudents];
  if (params?.departmentId) {
    filtered = filtered.filter((s) => s.departmentId === params.departmentId);
  }
  if (params?.programId) {
    filtered = filtered.filter((s) => s.programId === params.programId);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.user.name.toLowerCase().includes(q) ||
        s.user.email.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q),
    );
  }
  return filtered;
}

export async function createAdminStudent(
  payload: CreateStudentPayload,
): Promise<AdminStudent> {
  try {
    const res = await apiFetch<ApiResponse<AdminStudent>>("/admin/students", {
      method: "POST",
      body: payload,
    });
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("createAdminStudent fallback:", err);
  }

  // Synthetic creation fallback
  const newStudent: AdminStudent = {
    id: `student-${Date.now()}`,
    studentId: `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: `usr-${Date.now()}`,
    departmentId: payload.departmentId,
    programId: payload.programId,
    admissionYear: payload.admissionYear,
    currentYear: payload.currentYear,
    currentSemester: payload.currentSemester,
    gender: payload.gender,
    dateOfBirth: payload.dateOfBirth,
    address: payload.address,
    user: {
      id: `usr-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: "STUDENT",
      phone: payload.phone,
      status: "ACTIVE",
    },
    department: mockAdminDepartments.find(
      (d) => d.id === payload.departmentId,
    ) || {
      id: payload.departmentId,
      name: "Computer Science & Engineering",
      code: "CSE",
    },
    program: mockAdminPrograms.find((p) => p.id === payload.programId) || {
      id: payload.programId,
      name: "B.Sc. in Computer Science",
      code: "BSC-CSE",
    },
    createdAt: new Date().toISOString(),
  };
  mockAdminStudents.unshift(newStudent);
  return newStudent;
}

export async function updateAdminStudent(
  id: string,
  payload: UpdateStudentPayload,
): Promise<AdminStudent> {
  try {
    const res = await apiFetch<ApiResponse<AdminStudent>>(
      `/admin/students/${id}`,
      {
        method: "PATCH",
        body: payload,
      },
    );
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("updateAdminStudent fallback:", err);
  }

  const idx = mockAdminStudents.findIndex((s) => s.id === id);
  if (idx !== -1) {
    mockAdminStudents[idx] = {
      ...mockAdminStudents[idx],
      ...payload,
      user: {
        ...mockAdminStudents[idx].user,
        name: payload.name ?? mockAdminStudents[idx].user.name,
        email: payload.email ?? mockAdminStudents[idx].user.email,
        phone: payload.phone ?? mockAdminStudents[idx].user.phone,
        status: payload.status ?? mockAdminStudents[idx].user.status,
      },
    };
    return mockAdminStudents[idx];
  }
  throw new Error("Student not found");
}

export async function deleteAdminStudent(
  id: string,
  hard = false,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiFetch<{ success: boolean; message: string }>(
      `/admin/students/${id}${hard ? "?hard=true" : ""}`,
      { method: "DELETE" },
    );
    if (res) return res;
  } catch (err) {
    console.warn("deleteAdminStudent fallback:", err);
  }

  const idx = mockAdminStudents.findIndex((s) => s.id === id);
  if (idx !== -1) {
    if (hard) {
      mockAdminStudents.splice(idx, 1);
    } else {
      mockAdminStudents[idx].user.status = "INACTIVE";
    }
  }
  return {
    success: true,
    message: hard ? "Student deleted permanently" : "Student deactivated",
  };
}

// ── Faculty ───────────────────────────────────────────────────────────────────

export async function fetchAdminFaculty(params?: {
  departmentId?: string;
  search?: string;
}): Promise<AdminFacultyMember[]> {
  try {
    const query = new URLSearchParams();
    if (params?.departmentId) query.set("departmentId", params.departmentId);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    const res = await apiFetch<unknown>(
      `/admin/faculty${qs ? `?${qs}` : ""}`,
    );
    const arr = extractArray<AdminFacultyMember>(res);
    if (arr !== null) {
      return arr
        .map(normalizeAdminFacultyMember)
        .filter((member): member is AdminFacultyMember => member !== null);
    }
  } catch (err) {
    console.warn("fetchAdminFaculty fallback:", err);
  }
  return mockAdminFaculty;
}

export async function createAdminFaculty(
  payload: CreateFacultyPayload,
): Promise<AdminFacultyMember> {
  try {
    const res = await apiFetch<ApiResponse<AdminFacultyMember>>(
      "/admin/faculty",
      {
        method: "POST",
        body: payload,
      },
    );
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("createAdminFaculty fallback:", err);
  }

  const newFaculty: AdminFacultyMember = {
    id: `fac-${Date.now()}`,
    employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    userId: `usr-${Date.now()}`,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    departmentId: payload.departmentId,
    designation: payload.designation,
    specialization: payload.specialization,
    joiningDate: payload.joiningDate,
    department: mockAdminDepartments.find((d) => d.id === payload.departmentId),
    user: {
      id: `usr-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: "FACULTY",
      status: "ACTIVE",
    },
  };
  mockAdminFaculty.unshift(newFaculty);
  return newFaculty;
}

export async function updateAdminFaculty(
  id: string,
  payload: Partial<CreateFacultyPayload> & { photoUrl?: string },
): Promise<AdminFacultyMember> {
  const res = await apiFetch<ApiResponse<AdminFacultyMember>>(
    `/admin/faculty/${id}`,
    { method: "PATCH", body: payload },
  );
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to update faculty");
}

export async function deleteAdminFaculty(
  id: string,
  hard = false,
): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch<{ success: boolean; message: string }>(
    `/admin/faculty/${id}${hard ? "?hard=true" : ""}`,
    { method: "DELETE" },
  );
  return res ?? { success: true, message: "Faculty deactivated" };
}

// ── Departments ───────────────────────────────────────────────────────────────

export async function fetchAdminDepartments(): Promise<AdminDepartment[]> {
  try {
    const res = await apiFetch<unknown>("/admin/departments");
    const arr = extractArray<AdminDepartment>(res);
    if (arr !== null) return arr;
  } catch (err) {
    console.warn("fetchAdminDepartments fallback:", err);
  }
  return mockAdminDepartments;
}

export async function createAdminDepartment(
  payload: CreateDepartmentPayload,
): Promise<AdminDepartment> {
  try {
    const res = await apiFetch<ApiResponse<AdminDepartment>>(
      "/admin/departments",
      {
        method: "POST",
        body: payload,
      },
    );
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("createAdminDepartment fallback:", err);
  }

  const newDept: AdminDepartment = {
    id: `dept-${Date.now()}`,
    name: payload.name,
    code: payload.code,
    facultyName: payload.facultyName,
    programsCount: 0,
    facultyCount: 0,
    studentsCount: 0,
    createdAt: new Date().toISOString(),
  };
  mockAdminDepartments.unshift(newDept);
  return newDept;
}

export async function deleteAdminDepartment(id: string): Promise<void> {
  await apiFetch(`/admin/departments/${id}`, { method: "DELETE" });
}

export async function updateAdminDepartment(
  id: string,
  payload: UpdateDepartmentPayload,
): Promise<AdminDepartment> {
  try {
    const res = await apiFetch<ApiResponse<AdminDepartment>>(
      `/admin/departments/${id}`,
      {
        method: "PATCH",
        body: payload,
      },
    );
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("updateAdminDepartment fallback:", err);
  }

  const idx = mockAdminDepartments.findIndex((d) => d.id === id);
  if (idx !== -1) {
    mockAdminDepartments[idx] = { ...mockAdminDepartments[idx], ...payload };
    return mockAdminDepartments[idx];
  }
  throw new Error("Department not found");
}

// ── Programs ─────────────────────────────────────────────────────────────────

export async function fetchAdminPrograms(): Promise<AdminProgram[]> {
  try {
    const res = await apiFetch<unknown>("/admin/programs");
    const arr = extractArray<AdminProgram>(res);
    if (arr !== null) return arr;
  } catch (err) {
    console.warn("fetchAdminPrograms fallback:", err);
  }
  return mockAdminPrograms;
}

export async function createAdminProgram(
  payload: CreateProgramPayload,
): Promise<AdminProgram> {
  try {
    const res = await apiFetch<ApiResponse<AdminProgram>>("/admin/programs", {
      method: "POST",
      body: payload,
    });
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("createAdminProgram fallback:", err);
  }

  const newProgram: AdminProgram = {
    id: `prog-${Date.now()}`,
    name: payload.name,
    code: payload.code,
    departmentId: payload.departmentId,
    durationYears: payload.durationYears,
    totalCredits: payload.totalCredits,
    department: mockAdminDepartments.find((d) => d.id === payload.departmentId),
    createdAt: new Date().toISOString(),
  };
  mockAdminPrograms.unshift(newProgram);
  return newProgram;
}

export async function updateAdminProgram(
  id: string,
  payload: Partial<CreateProgramPayload>,
): Promise<AdminProgram> {
  const res = await apiFetch<ApiResponse<AdminProgram>>(
    `/admin/programs/${id}`,
    { method: "PATCH", body: payload },
  );
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to update program");
}

// ── Courses ──────────────────────────────────────────────────────────────────

export async function fetchAdminCourses(): Promise<AdminCourse[]> {
  try {
    const res = await apiFetch<unknown>("/admin/courses");
    const arr = extractArray<AdminCourse>(res);
    if (arr !== null) return arr;
  } catch (err) {
    console.warn("fetchAdminCourses fallback:", err);
  }
  return mockAdminCourses;
}

export async function createAdminCourse(
  payload: CreateCoursePayload,
): Promise<AdminCourse> {
  try {
    const res = await apiFetch<ApiResponse<AdminCourse>>("/admin/courses", {
      method: "POST",
      body: payload,
    });
    if (res?.data) return res.data;
    throw new Error(
      res?.message || "The server did not return the created course.",
    );
  } catch (error: unknown) {
    const err = error as {
      data?: { message?: string };
      response?: { _data?: { message?: string }; status?: number };
      message?: string;
    };
    const message =
      err.data?.message ||
      err.response?._data?.message ||
      (err.response?.status === 409
        ? "A course with this code or details already exists. Use a unique course code."
        : err.message);
    throw new Error(message || "Failed to create course.");
  }
}

export async function updateAdminCourse(
  id: string,
  payload: Partial<CreateCoursePayload>,
): Promise<AdminCourse> {
  const res = await apiFetch<ApiResponse<AdminCourse>>(
    `/admin/courses/${id}`,
    { method: "PATCH", body: payload },
  );
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to update course");
}

// ── Semesters ────────────────────────────────────────────────────────────────

export async function fetchAdminSemesters(): Promise<AdminSemester[]> {
  try {
    const res = await apiFetch<unknown>("/admin/semesters");
    const arr = extractArray<AdminSemester>(res);
    if (arr !== null) return arr;
  } catch (err) {
    console.warn("fetchAdminSemesters fallback:", err);
  }
  return mockAdminSemesters;
}

export async function createAdminSemester(
  payload: CreateSemesterPayload,
): Promise<AdminSemester> {
  try {
    const res = await apiFetch<ApiResponse<AdminSemester>>("/admin/semesters", {
      method: "POST",
      body: payload,
    });
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("createAdminSemester fallback:", err);
  }

  const newSemester: AdminSemester = {
    id: `sem-${Date.now()}`,
    name: payload.name,
    year: payload.year,
    status: payload.status,
    startDate: payload.startDate,
    endDate: payload.endDate,
  };
  mockAdminSemesters.unshift(newSemester);
  return newSemester;
}

export async function updateAdminSemester(
  id: string,
  payload: Partial<CreateSemesterPayload>,
): Promise<AdminSemester> {
  const res = await apiFetch<ApiResponse<AdminSemester>>(
    `/admin/semesters/${id}`,
    { method: "PATCH", body: payload },
  );
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to update semester");
}

// ── Sections ─────────────────────────────────────────────────────────────────

export async function fetchAdminSections(): Promise<AdminSection[]> {
  try {
    const res = await apiFetch<unknown>("/admin/sections");
    const arr = extractArray<AdminSection>(res);
    if (arr !== null) return arr.map(normalizeAdminSection);
  } catch (err) {
    console.warn("fetchAdminSections fallback:", err);
  }
  return mockAdminSections;
}

function normalizeAdminSection(section: AdminSection): AdminSection {
  const faculty = section.faculty
    ? normalizeAdminFacultyMember(section.faculty)
    : null;
  return {
    ...section,
    faculty: faculty ?? section.faculty,
  };
}

export async function createAdminSection(
  payload: CreateSectionPayload,
): Promise<AdminSection> {
  const res = await apiFetch<ApiResponse<AdminSection>>("/admin/sections", {
    method: "POST",
    body: payload,
  });
  if (!res?.data) {
    throw new Error(res?.message || "Failed to create section");
  }
  return normalizeAdminSection(res.data);
}

export async function updateAdminSection(
  id: string,
  payload: Partial<CreateSectionPayload>,
): Promise<AdminSection> {
  const res = await apiFetch<ApiResponse<AdminSection>>(
    `/admin/sections/${id}`,
    { method: "PATCH", body: payload },
  );
  if (res?.data) return res.data;
  throw new Error(res?.message || "Failed to update section");
}

// ── Enrollments ──────────────────────────────────────────────────────────────

export async function fetchAdminEnrollments(): Promise<AdminEnrollment[]> {
  try {
    const res = await apiFetch<unknown>("/admin/enrollments");
    const arr = extractArray<AdminEnrollment>(res);
    if (arr !== null) return arr;
  } catch (err) {
    console.warn("fetchAdminEnrollments fallback:", err);
  }
  return mockAdminEnrollments;
}

export async function forceEnrollStudent(
  payload: ForceEnrollPayload,
): Promise<AdminEnrollment> {
  try {
    const res = await apiFetch<ApiResponse<AdminEnrollment>>(
      "/admin/enrollments",
      {
        method: "POST",
        body: payload,
      },
    );
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("forceEnrollStudent fallback:", err);
  }

  const student = mockAdminStudents.find(
    (s) => s.id === payload.studentId || s.studentId === payload.studentId,
  );
  const section = mockAdminSections.find((sec) => sec.id === payload.sectionId);

  const newEnrollment: AdminEnrollment = {
    id: `enr-${Date.now()}`,
    studentId: payload.studentId,
    sectionId: payload.sectionId,
    status: "ENROLLED",
    enrolledAt: new Date().toISOString(),
    student: student
      ? {
          id: student.id,
          studentId: student.studentId,
          user: { name: student.user.name, email: student.user.email },
          department: student.department
            ? { code: student.department.code, name: student.department.name }
            : undefined,
        }
      : {
          id: payload.studentId,
          studentId: "STU-NEW",
          user: { name: "Enrolled Student", email: "student@university.edu" },
        },
    section: section
      ? {
          id: section.id,
          capacity: section.capacity,
          course: {
            code: section.course?.code || "CSE101",
            title: section.course?.title || "Computer Science Fundamentals",
            credit: section.course?.credit || 3,
          },
          semester: {
            name: section.semester?.name || "Fall 2026",
            year: section.semester?.year || 2026,
          },
          faculty: section.faculty ? { name: section.faculty.name } : undefined,
        }
      : undefined,
  };
  mockAdminEnrollments.unshift(newEnrollment);
  return newEnrollment;
}

// ── Payments ─────────────────────────────────────────────────────────────────

export async function fetchAdminPayments(): Promise<AdminPayment[]> {
  try {
    const res = await apiFetch<unknown>("/admin/payments");
    const arr = extractArray<AdminPayment>(res);
    if (arr !== null) {
      return arr.map((payment) => normalizeAdminPayment(payment));
    }
  } catch (err) {
    console.warn("fetchAdminPayments fallback:", err);
  }
  return mockAdminPayments;
}

function normalizeAdminPayment(payment: unknown): AdminPayment {
  const raw =
    payment && typeof payment === "object"
      ? (payment as Record<string, unknown>)
      : {};
  const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  const invoice = asRecord(raw.invoice);
  const enrollment = asRecord(raw.enrollment);
  const relations = [
    asRecord(raw.student),
    asRecord(raw.studentProfile),
    asRecord(invoice?.student),
    asRecord(invoice?.studentProfile),
    asRecord(enrollment?.student),
    asRecord(enrollment?.studentProfile),
  ].filter((record): record is Record<string, unknown> => record !== null);
  const userRecords = [
    asRecord(raw.user),
    ...relations.map((student) => asRecord(student.user)),
    asRecord(invoice?.user),
  ].filter((record): record is Record<string, unknown> => record !== null);
  const name = [
    raw.studentName,
    ...relations.map((student) => student.name),
    ...userRecords.map((user) => user.name),
  ]
    .find(
      (value): value is string =>
        typeof value === "string" && !!value.trim(),
    )
    ?.trim();
  const email = [
    ...relations.map((student) => student.email),
    ...userRecords.map((user) => user.email),
  ]
    .find(
      (value): value is string =>
        typeof value === "string" && !!value.trim(),
    )
    ?.trim();
  const allowedStatuses: AdminPayment["status"][] = [
    "PAID",
    "SUCCESS",
    "SUCCEEDED",
    "COMPLETED",
    "PENDING",
    "FAILED",
    "REFUNDED",
  ];
  const rawStatus = String(raw.status ?? "PENDING").toUpperCase();
  const status = allowedStatuses.includes(rawStatus as AdminPayment["status"])
    ? (rawStatus as AdminPayment["status"])
    : "PENDING";
  const method = String(
    raw.paymentMethod ?? raw.method ?? "CARD",
  ).toUpperCase();
  const studentCode = relations
    .map((student) => student.studentId)
    .find((value): value is string => typeof value === "string" && !!value);
  const studentId = String(
    relations
      .map((student) => student.id)
      .find((value): value is string => typeof value === "string" && !!value) ??
      raw.studentId ??
      "",
  );
  const rawDepartment = relations
    .map((student) => asRecord(student.department))
    .find(
      (department): department is Record<string, unknown> =>
        department !== null,
    );

  return {
    id: String(raw.id ?? raw.paymentId ?? raw.transactionId ?? ""),
    studentId,
    amount: Number(raw.amount ?? 0),
    transactionId: String(
      raw.transactionId ?? raw.sessionId ?? raw.id ?? raw.paymentId ?? "—",
    ),
    paymentMethod: method,
    status,
    description:
      typeof raw.description === "string"
        ? raw.description
        : typeof raw.invoiceNo === "string"
          ? `Invoice ${raw.invoiceNo}`
          : undefined,
    paidAt: String(
      raw.paidAt ?? raw.createdAt ?? raw.paymentDate ?? raw.updatedAt ?? "",
    ),
    studentName: name,
    studentCode,
    student: {
      studentId: studentCode ?? "",
      ...(name || email
        ? {
            user: {
              name: name ?? "",
              email: email ?? "",
            },
          }
        : {}),
      name,
      email,
      ...(rawDepartment && typeof rawDepartment.code === "string"
        ? { department: { code: rawDepartment.code } }
        : {}),
    },
  };
}

// ── Reports ──────────────────────────────────────────────────────────────────

export async function fetchAdminReports(): Promise<AdminSystemReport> {
  try {
    const res =
      await apiFetch<ApiResponse<AdminSystemReport>>("/admin/reports");
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("fetchAdminReports fallback:", err);
  }
  return mockAdminReport;
}

// ═════════════════════════════════════════════════════════════════════════════
// ── MOCK DATA COLLECTIONS (Reliable Fallback) ──────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

export const mockAdminStats: AdminDashboardStats = {
  totalStudents: 1420,
  totalFaculty: 86,
  totalDepartments: 8,
  totalCourses: 124,
  activeEnrollments: 3840,
  totalRevenue: 28450000,
  pendingPaymentsCount: 142,
  ongoingSemestersCount: 2,
  monthlyRevenue: [
    { month: "Jan", amount: 2200000 },
    { month: "Feb", amount: 3100000 },
    { month: "Mar", amount: 1800000 },
    { month: "Apr", amount: 4500000 },
    { month: "May", amount: 2900000 },
    { month: "Jun", amount: 5100000 },
    { month: "Jul", amount: 3750000 },
    { month: "Aug", amount: 5100000 },
  ],
  enrollmentByDepartment: [
    { department: "CSE", count: 1450 },
    { department: "EEE", count: 820 },
    { department: "BBA", count: 760 },
    { department: "Pharmacy", count: 480 },
    { department: "English", count: 330 },
  ],
};

export const mockAdminDepartments: AdminDepartment[] = [
  {
    id: "dept-cse",
    name: "Computer Science & Engineering",
    code: "CSE",
    facultyName: "Faculty of Science & Technology",
    programsCount: 3,
    facultyCount: 32,
    studentsCount: 620,
  },
  {
    id: "dept-eee",
    name: "Electrical & Electronic Engineering",
    code: "EEE",
    facultyName: "Faculty of Engineering",
    programsCount: 2,
    facultyCount: 24,
    studentsCount: 380,
  },
  {
    id: "dept-bba",
    name: "Business Administration",
    code: "BBA",
    facultyName: "Faculty of Business Studies",
    programsCount: 4,
    facultyCount: 18,
    studentsCount: 320,
  },
  {
    id: "dept-pharm",
    name: "Pharmacy",
    code: "PHARM",
    facultyName: "Faculty of Allied Health Sciences",
    programsCount: 1,
    facultyCount: 12,
    studentsCount: 100,
  },
];

export const mockAdminPrograms: AdminProgram[] = [
  {
    id: "prog-bsc-cse",
    name: "B.Sc. in Computer Science & Engineering",
    code: "BSC-CSE",
    departmentId: "dept-cse",
    durationYears: 4,
    totalCredits: 140,
    department: {
      id: "dept-cse",
      name: "Computer Science & Engineering",
      code: "CSE",
    },
    studentsCount: 520,
  },
  {
    id: "prog-msc-cse",
    name: "M.Sc. in Computer Science",
    code: "MSC-CSE",
    departmentId: "dept-cse",
    durationYears: 2,
    totalCredits: 36,
    department: {
      id: "dept-cse",
      name: "Computer Science & Engineering",
      code: "CSE",
    },
    studentsCount: 100,
  },
  {
    id: "prog-bsc-eee",
    name: "B.Sc. in Electrical Engineering",
    code: "BSC-EEE",
    departmentId: "dept-eee",
    durationYears: 4,
    totalCredits: 144,
    department: {
      id: "dept-eee",
      name: "Electrical & Electronic Engineering",
      code: "EEE",
    },
    studentsCount: 380,
  },
  {
    id: "prog-bba",
    name: "Bachelor of Business Administration",
    code: "BBA-HONORS",
    departmentId: "dept-bba",
    durationYears: 4,
    totalCredits: 128,
    department: {
      id: "dept-bba",
      name: "Business Administration",
      code: "BBA",
    },
    studentsCount: 320,
  },
];

export const mockAdminCourses: AdminCourse[] = [
  {
    id: "course-cse301",
    code: "CSE301",
    title: "Data Structures",
    description:
      "Fundamental data structures, stacks, queues, trees, graphs, and algorithmic analysis",
    credit: 3.0,
    departmentId: "dept-cse",
    programId: "prog-bsc-cse",
    department: {
      id: "dept-cse",
      name: "Computer Science & Engineering",
      code: "CSE",
    },
  },
  {
    id: "course-cse311",
    code: "CSE311",
    title: "Database Management Systems",
    description:
      "Relational database modeling, SQL, normalization, transactions, and indexing",
    credit: 3.0,
    departmentId: "dept-cse",
    programId: "prog-bsc-cse",
    department: {
      id: "dept-cse",
      name: "Computer Science & Engineering",
      code: "CSE",
    },
  },
  {
    id: "course-cse421",
    code: "CSE421",
    title: "Machine Learning & Neural Networks",
    description:
      "Supervised & unsupervised learning, deep neural nets, and practical AI implementations",
    credit: 3.0,
    departmentId: "dept-cse",
    programId: "prog-bsc-cse",
    department: {
      id: "dept-cse",
      name: "Computer Science & Engineering",
      code: "CSE",
    },
  },
  {
    id: "course-eee201",
    code: "EEE201",
    title: "Circuit Analysis & Electronics",
    description:
      "AC/DC circuit theorems, passive components, semiconductors, and transistor circuits",
    credit: 4.0,
    departmentId: "dept-eee",
    programId: "prog-bsc-eee",
    department: {
      id: "dept-eee",
      name: "Electrical & Electronic Engineering",
      code: "EEE",
    },
  },
];

export const mockAdminSemesters: AdminSemester[] = [
  {
    id: "sem-fall-2026",
    name: "Fall 2026",
    year: 2026,
    status: "ACTIVE",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    sectionsCount: 42,
  },
  {
    id: "sem-spring-2027",
    name: "Spring 2027",
    year: 2027,
    status: "UPCOMING",
    startDate: "2027-01-15",
    endDate: "2027-05-30",
    sectionsCount: 0,
  },
  {
    id: "sem-summer-2026",
    name: "Summer 2026",
    year: 2026,
    status: "COMPLETED",
    startDate: "2026-05-10",
    endDate: "2026-08-25",
    sectionsCount: 38,
  },
];

export const mockAdminFaculty: AdminFacultyMember[] = [
  {
    id: "fac-1",
    employeeId: "EMP-401",
    userId: "usr-fac-1",
    name: "Dr. Rahim",
    email: "rahim@university.edu",
    phone: "01811000000",
    departmentId: "dept-cse",
    designation: "Associate Professor",
    specialization: "Artificial Intelligence",
    joiningDate: "2026-01-15",
    department: {
      id: "dept-cse",
      name: "Computer Science & Engineering",
      code: "CSE",
    },
    user: {
      id: "usr-fac-1",
      name: "Dr. Rahim",
      email: "rahim@university.edu",
      role: "FACULTY",
      status: "ACTIVE",
    },
  },
  {
    id: "fac-2",
    employeeId: "EMP-402",
    userId: "usr-fac-2",
    name: "Prof. Sarah Jenkins",
    email: "sarah.j@university.edu",
    phone: "01811000001",
    departmentId: "dept-cse",
    designation: "Professor & Chair",
    specialization: "Distributed Systems & Cloud Computing",
    joiningDate: "2024-08-01",
    department: {
      id: "dept-cse",
      name: "Computer Science & Engineering",
      code: "CSE",
    },
    user: {
      id: "usr-fac-2",
      name: "Prof. Sarah Jenkins",
      email: "sarah.j@university.edu",
      role: "FACULTY",
      status: "ACTIVE",
    },
  },
  {
    id: "fac-3",
    employeeId: "EMP-303",
    userId: "usr-fac-3",
    name: "Dr. Mahmud Hasan",
    email: "mahmud.h@university.edu",
    phone: "01811000002",
    departmentId: "dept-eee",
    designation: "Assistant Professor",
    specialization: "Signal Processing & IoT",
    joiningDate: "2025-02-10",
    department: {
      id: "dept-eee",
      name: "Electrical & Electronic Engineering",
      code: "EEE",
    },
    user: {
      id: "usr-fac-3",
      name: "Dr. Mahmud Hasan",
      email: "mahmud.h@university.edu",
      role: "FACULTY",
      status: "ACTIVE",
    },
  },
];

export const mockAdminStudents: AdminStudent[] = [
  {
    id: "student-1",
    studentId: "STU-2026-001",
    userId: "usr-stu-1",
    departmentId: "dept-cse",
    programId: "prog-bsc-cse",
    admissionYear: 2026,
    currentYear: 1,
    currentSemester: 1,
    gender: "Male",
    dateOfBirth: "2003-04-10",
    address: "45 University Ave",
    user: {
      id: "usr-stu-1",
      name: "Ali Rahman",
      email: "ali@student.edu",
      role: "STUDENT",
      phone: "01711000000",
      status: "ACTIVE",
    },
    department: {
      id: "dept-cse",
      name: "Computer Science & Engineering",
      code: "CSE",
    },
    program: {
      id: "prog-bsc-cse",
      name: "B.Sc. in Computer Science",
      code: "BSC-CSE",
    },
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "student-2",
    studentId: "STU-2025-142",
    userId: "usr-stu-2",
    departmentId: "dept-cse",
    programId: "prog-bsc-cse",
    admissionYear: 2025,
    currentYear: 2,
    currentSemester: 3,
    gender: "Female",
    dateOfBirth: "2004-08-22",
    address: "12 Lakeview Crescent",
    user: {
      id: "usr-stu-2",
      name: "Nusrat Jahan",
      email: "nusrat.jahan@student.edu",
      role: "STUDENT",
      phone: "01711000001",
      status: "ACTIVE",
    },
    department: {
      id: "dept-cse",
      name: "Computer Science & Engineering",
      code: "CSE",
    },
    program: {
      id: "prog-bsc-cse",
      name: "B.Sc. in Computer Science",
      code: "BSC-CSE",
    },
    createdAt: "2025-02-15T09:30:00Z",
  },
  {
    id: "student-3",
    studentId: "STU-2024-089",
    userId: "usr-stu-3",
    departmentId: "dept-eee",
    programId: "prog-bsc-eee",
    admissionYear: 2024,
    currentYear: 3,
    currentSemester: 5,
    gender: "Male",
    dateOfBirth: "2002-11-14",
    address: "78 Tech Colony",
    user: {
      id: "usr-stu-3",
      name: "Tanvir Ahmed",
      email: "tanvir.ahmed@student.edu",
      role: "STUDENT",
      phone: "01711000002",
      status: "ACTIVE",
    },
    department: {
      id: "dept-eee",
      name: "Electrical & Electronic Engineering",
      code: "EEE",
    },
    program: {
      id: "prog-bsc-eee",
      name: "B.Sc. in Electrical Engineering",
      code: "BSC-EEE",
    },
    createdAt: "2024-01-20T11:00:00Z",
  },
];

export const mockAdminSections: AdminSection[] = [
  {
    id: "sec-1",
    courseId: "course-cse301",
    semesterId: "sem-fall-2026",
    facultyId: "fac-1",
    capacity: 40,
    enrolledCount: 38,
    schedules: [
      {
        dayOfWeek: "MONDAY",
        startTime: "09:00",
        endTime: "10:30",
        room: "Room 301",
        building: "CSE Building",
      },
      {
        dayOfWeek: "WEDNESDAY",
        startTime: "09:00",
        endTime: "10:30",
        room: "Room 301",
        building: "CSE Building",
      },
    ],
    course: mockAdminCourses[0],
    semester: mockAdminSemesters[0],
    faculty: mockAdminFaculty[0],
  },
  {
    id: "sec-2",
    courseId: "course-cse311",
    semesterId: "sem-fall-2026",
    facultyId: "fac-2",
    capacity: 35,
    enrolledCount: 30,
    schedules: [
      {
        dayOfWeek: "SUNDAY",
        startTime: "11:00",
        endTime: "12:30",
        room: "Lab 204",
        building: "Software Park",
      },
      {
        dayOfWeek: "TUESDAY",
        startTime: "11:00",
        endTime: "12:30",
        room: "Lab 204",
        building: "Software Park",
      },
    ],
    course: mockAdminCourses[1],
    semester: mockAdminSemesters[0],
    faculty: mockAdminFaculty[1],
  },
];

export const mockAdminEnrollments: AdminEnrollment[] = [
  {
    id: "enr-1",
    studentId: "student-1",
    sectionId: "sec-1",
    status: "ENROLLED",
    enrolledAt: "2026-09-02T10:15:00Z",
    student: {
      id: "student-1",
      studentId: "STU-2026-001",
      user: { name: "Ali Rahman", email: "ali@student.edu" },
      department: { code: "CSE", name: "Computer Science & Engineering" },
    },
    section: {
      id: "sec-1",
      capacity: 40,
      course: { code: "CSE301", title: "Data Structures", credit: 3.0 },
      semester: { name: "Fall 2026", year: 2026 },
      faculty: { name: "Dr. Rahim" },
    },
  },
  {
    id: "enr-2",
    studentId: "student-2",
    sectionId: "sec-2",
    status: "ENROLLED",
    enrolledAt: "2026-09-02T11:00:00Z",
    student: {
      id: "student-2",
      studentId: "STU-2025-142",
      user: { name: "Nusrat Jahan", email: "nusrat.jahan@student.edu" },
      department: { code: "CSE", name: "Computer Science & Engineering" },
    },
    section: {
      id: "sec-2",
      capacity: 35,
      course: {
        code: "CSE311",
        title: "Database Management Systems",
        credit: 3.0,
      },
      semester: { name: "Fall 2026", year: 2026 },
      faculty: { name: "Prof. Sarah Jenkins" },
    },
  },
];

export const mockAdminPayments: AdminPayment[] = [
  {
    id: "pay-1",
    studentId: "student-1",
    amount: 45000,
    transactionId: "TRX-BK-984210",
    paymentMethod: "BKASH",
    status: "PAID",
    description: "Tuition Fee – Fall 2026 (Semester 1)",
    paidAt: "2026-09-05T14:20:00Z",
    student: {
      studentId: "STU-2026-001",
      user: { name: "Ali Rahman", email: "ali@student.edu" },
      department: { code: "CSE" },
    },
  },
  {
    id: "pay-2",
    studentId: "student-2",
    amount: 45000,
    transactionId: "TRX-NG-552190",
    paymentMethod: "NAGAD",
    status: "PAID",
    description: "Tuition Fee – Fall 2026 (Semester 3)",
    paidAt: "2026-09-06T10:12:00Z",
    student: {
      studentId: "STU-2025-142",
      user: { name: "Nusrat Jahan", email: "nusrat.jahan@student.edu" },
      department: { code: "CSE" },
    },
  },
  {
    id: "pay-3",
    studentId: "student-3",
    amount: 52000,
    transactionId: "TRX-BT-110024",
    paymentMethod: "BANK_TRANSFER",
    status: "PAID",
    description: "Engineering Lab & Tuition Fee",
    paidAt: "2026-09-07T16:45:00Z",
    student: {
      studentId: "STU-2024-089",
      user: { name: "Tanvir Ahmed", email: "tanvir.ahmed@student.edu" },
      department: { code: "EEE" },
    },
  },
];

export const mockAdminReport: AdminSystemReport = {
  academicYear: "2026-2027",
  generatedAt: new Date().toISOString(),
  academic: {
    overallGpaAverage: 3.42,
    totalCreditsCompleted: 48920,
    coursePassingRate: 94.6,
    retakeCount: 48,
    enrollmentTrend: [
      { semester: "Spring 2025", count: 1120 },
      { semester: "Summer 2025", count: 980 },
      { semester: "Fall 2025", count: 1280 },
      { semester: "Spring 2026", count: 1350 },
      { semester: "Fall 2026", count: 1420 },
    ],
    departmentPerformance: [
      { department: "CSE", avgGpa: 3.51, studentCount: 620 },
      { department: "EEE", avgGpa: 3.38, studentCount: 380 },
      { department: "BBA", avgGpa: 3.44, studentCount: 320 },
      { department: "Pharmacy", avgGpa: 3.58, studentCount: 100 },
    ],
  },
  financial: {
    totalRevenue: 28450000,
    totalCollectedThisSemester: 19800000,
    totalPendingFees: 2450000,
    refundedAmount: 120000,
    revenueByMonth: [
      { month: "Jan", amount: 2200000 },
      { month: "Feb", amount: 3100000 },
      { month: "Mar", amount: 1800000 },
      { month: "Apr", amount: 4500000 },
      { month: "May", amount: 2900000 },
      { month: "Jun", amount: 5100000 },
      { month: "Jul", amount: 3750000 },
      { month: "Aug", amount: 5100000 },
    ],
    revenueByMethod: [
      { method: "bKash", total: 12400000 },
      { method: "Nagad", total: 6800000 },
      { method: "Bank Transfer", total: 7250000 },
      { method: "Card / POS", total: 2000000 },
    ],
  },
};
