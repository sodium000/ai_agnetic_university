// ── Faculty Profile ───────────────────────────────────────────────────────────

export interface FacultyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  photoUrl?: string | null;
  status?: string;
}

export interface FacultyDepartment {
  id: string;
  name: string;
  code: string;
  facultyName?: string | null;
}

export interface FacultyProfile {
  id: string;
  employeeId: string;
  userId: string;
  departmentId: string;
  designation: string;
  specialization?: string | null;
  joiningDate?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  user: FacultyUser;
  department: FacultyDepartment;
}

export interface FacultyProfileApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: FacultyProfile;
}

export interface UpdateFacultyProfilePayload {
  phone?: string;
  photoUrl?: string;
  designation?: string;
  specialization?: string;
}

// ── Section ───────────────────────────────────────────────────────────────────

export interface SectionCourse {
  id: string;
  code: string;
  title: string;
  credit: number;
  description?: string | null;
  department?: string | null;
}

export interface SectionSemester {
  id: string;
  name: string;
  year: number;
  status: "ONGOING" | "COMPLETED" | "UPCOMING";
}

export interface Section {
  id: string;
  name: string;
  courseId: string;
  semesterId: string;
  facultyId: string;
  capacity: number;
  enrolledCount: number;
  schedule?: string | null;
  room?: string | null;
  course: SectionCourse;
  semester: SectionSemester;
}

export interface SectionsApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Section[];
}

// ── Student (taught by faculty) ───────────────────────────────────────────────

export interface TaughtStudent {
  id: string;
  studentId: string;
  userId: string;
  currentYear: number;
  currentSemester: number;
  user: {
    id: string;
    name: string;
    email: string;
    photoUrl?: string | null;
  };
  enrollments?: {
    id: string;
    sectionId: string;
    status: string;
    section?: { name: string; course?: { code: string; title: string } };
  }[];
}

export interface StudentsApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: TaughtStudent[];
}

// ── Assignment ────────────────────────────────────────────────────────────────

export interface FacultyAssignment {
  id: string;
  sectionId: string;
  title: string;
  description?: string | null;
  deadline: string;
  totalMarks: number;
  section?: { name: string; course?: { code: string; title: string } };
}

export interface AssignmentApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: FacultyAssignment;
}

export interface AssignmentsApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: FacultyAssignment[];
}

export interface CreateAssignmentPayload {
  sectionId: string;
  title: string;
  description?: string;
  deadline: string;
  totalMarks: number;
}

export interface AssignmentSubmission {
  id: string;
  student: { studentId: string; name: string };
  fileUrl?: string | null;
  submittedAt?: string | null;
  marks?: number | null;
  feedback?: string | null;
}

// ── Exam ──────────────────────────────────────────────────────────────────────

export type ExamType = "MIDTERM" | "FINAL" | "QUIZ" | "PRACTICAL";

export interface FacultyExam {
  id: string;
  sectionId: string;
  title: string;
  type: ExamType;
  examDate: string;
  totalMarks: number;
  section?: { name: string; course?: { code: string; title: string } };
}

export interface ExamApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: FacultyExam;
}

export interface CreateExamPayload {
  sectionId: string;
  title: string;
  type: ExamType;
  examDate: string;
  totalMarks: number;
}

// ── Attendance ────────────────────────────────────────────────────────────────

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

export interface RecordAttendancePayload {
  date: string; // YYYY-MM-DD
  records: AttendanceRecord[];
}

export interface AttendanceApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: { recorded: number; date: string };
}

// ── Result ────────────────────────────────────────────────────────────────────

export interface FacultyResult {
  id: string;
  marks: number;
  grade: string;
  gradePoint: number;
}

export interface PostResultPayload {
  enrollmentId: string;
  examId: string;
  marks: number;
}
