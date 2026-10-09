export interface AdminDashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  totalCourses: number;
  activeEnrollments: number;
  totalRevenue: number;
  pendingPaymentsCount?: number;
  ongoingSemestersCount?: number;
  monthlyRevenue?: { month: string; amount: number }[];
  enrollmentByDepartment?: { department: string; count: number }[];
}

export interface AdminDashboardApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AdminDashboardStats;
}

// ── Students ─────────────────────────────────────────────────────────────────

export interface AdminStudentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface AdminDepartmentRef {
  id: string;
  name: string;
  code: string;
  facultyName?: string | null;
}

export interface AdminProgramRef {
  id: string;
  name: string;
  code: string;
  departmentId?: string;
  durationYears?: number;
  totalCredits?: number;
}

export interface AdminStudent {
  id: string;
  studentId: string;
  userId: string;
  departmentId: string;
  programId: string;
  admissionYear: number;
  currentYear: number;
  currentSemester: number;
  gender: string;
  dateOfBirth?: string;
  address?: string;
  user: AdminStudentUser;
  department?: AdminDepartmentRef;
  program?: AdminProgramRef;
  createdAt?: string;
}

export interface CreateStudentPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  departmentId: string;
  programId: string;
  admissionYear: number;
  currentYear: number;
  currentSemester: number;
  gender: string;
  dateOfBirth?: string;
  address?: string;
}

export interface UpdateStudentPayload {
  name?: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  programId?: string;
  admissionYear?: number;
  currentYear?: number;
  currentSemester?: number;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface StudentFilterParams {
  departmentId?: string;
  programId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminStudentsApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AdminStudent[];
}

// ── Faculty ───────────────────────────────────────────────────────────────────

export interface AdminFacultyMember {
  id: string;
  employeeId?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  departmentId: string;
  designation: string;
  specialization?: string;
  joiningDate?: string;
  department?: AdminDepartmentRef;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
}

export interface CreateFacultyPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  departmentId: string;
  designation: string;
  specialization: string;
  joiningDate: string;
}

export interface AdminFacultyApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AdminFacultyMember[];
}

// ── Departments ───────────────────────────────────────────────────────────────

export interface AdminDepartment {
  id: string;
  name: string;
  code: string;
  facultyName?: string;
  programsCount?: number;
  facultyCount?: number;
  studentsCount?: number;
  createdAt?: string;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  facultyName: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  code?: string;
  facultyName?: string;
}

// ── Programs ─────────────────────────────────────────────────────────────────

export interface AdminProgram {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  durationYears: number;
  totalCredits: number;
  department?: AdminDepartmentRef;
  studentsCount?: number;
  createdAt?: string;
}

export interface CreateProgramPayload {
  name: string;
  code: string;
  departmentId: string;
  durationYears: number;
  totalCredits: number;
}

// ── Courses ──────────────────────────────────────────────────────────────────

export interface AdminCourse {
  id: string;
  code: string;
  title: string;
  description?: string;
  credit: number;
  departmentId: string;
  programId?: string;
  department?: AdminDepartmentRef;
  program?: AdminProgramRef;
  createdAt?: string;
}

export interface CreateCoursePayload {
  code: string;
  title: string;
  description: string;
  credit: number;
  departmentId: string;
  programId: string;
}

// ── Semesters ────────────────────────────────────────────────────────────────

export type SemesterStatus = "UPCOMING" | "ACTIVE" | "COMPLETED";

export interface AdminSemester {
  id: string;
  name: string;
  year: number;
  status: SemesterStatus;
  startDate: string;
  endDate: string;
  sectionsCount?: number;
}

export interface CreateSemesterPayload {
  name: string;
  year: number;
  status: SemesterStatus;
  startDate: string;
  endDate: string;
}

// ── Sections & Schedules ─────────────────────────────────────────────────────

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface SectionSchedule {
  id?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  building: string;
}

export interface AdminSection {
  id: string;
  courseId: string;
  semesterId: string;
  facultyId?: string;
  capacity: number;
  enrolledCount?: number;
  schedules: SectionSchedule[];
  course?: AdminCourse;
  semester?: AdminSemester;
  faculty?: AdminFacultyMember;
}

export interface CreateSectionPayload {
  courseId: string;
  semesterId: string;
  facultyId: string;
  capacity: number;
  schedules: SectionSchedule[];
}

// ── Enrollments ──────────────────────────────────────────────────────────────

export interface AdminEnrollment {
  id: string;
  studentId: string;
  sectionId: string;
  status: "ENROLLED" | "DROPPED" | "COMPLETED" | "WAITLISTED";
  enrolledAt: string;
  grade?: string | null;
  student?: {
    id: string;
    studentId: string;
    user: { name: string; email: string };
    department?: { code: string; name: string };
  };
  section?: {
    id: string;
    capacity: number;
    course: { code: string; title: string; credit: number };
    semester: { name: string; year: number };
    faculty?: { name: string };
  };
}

export interface ForceEnrollPayload {
  studentId: string;
  sectionId: string;
}

// ── Payments ─────────────────────────────────────────────────────────────────

export interface AdminPayment {
  id: string;
  studentId: string;
  amount: number;
  transactionId: string;
  paymentMethod: "BKASH" | "NAGAD" | "ROCKET" | "BANK_TRANSFER" | "CARD" | "CASH";
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  description?: string;
  paidAt: string;
  student?: {
    studentId: string;
    user: { name: string; email: string };
    department?: { code: string };
  };
}

// ── Reports ──────────────────────────────────────────────────────────────────

export interface AdminAcademicReport {
  overallGpaAverage: number;
  totalCreditsCompleted: number;
  coursePassingRate: number;
  retakeCount: number;
  enrollmentTrend: { semester: string; count: number }[];
  departmentPerformance: { department: string; avgGpa: number; studentCount: number }[];
}

export interface AdminFinancialReport {
  totalRevenue: number;
  totalCollectedThisSemester: number;
  totalPendingFees: number;
  refundedAmount: number;
  revenueByMonth: { month: string; amount: number }[];
  revenueByMethod: { method: string; total: number }[];
}

export interface AdminSystemReport {
  academic: AdminAcademicReport;
  financial: AdminFinancialReport;
  generatedAt: string;
  academicYear: string;
}
