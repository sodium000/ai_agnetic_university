export interface Student {
  name: string;
  studentId: string;
  email: string;
  phone: string;
  photoUrl?: string;
  department: string;
  departmentCode: string;
  program: string;
  programCode: string;
  currentYear: number;
  currentSemester: number;
  admissionYear: number;
}

export interface DashboardStats {
  cgpa: number;
  completedCredits: number;
  totalCredits: number;
  currentCourses: number;
  attendance: number;
}

export interface GPAHistory {
  semester: string;
  gpa: number;
}

export type AttendanceStatus = "Present" | "Late" | "Absent";

export interface AttendanceData {
  status: AttendanceStatus;
  count: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
}

export interface CurrentCourse {
  id: string;
  code: string;
  title: string;
  credit: number;
  section: string;
  faculty: string;
  room: string;
  progress?: number;
}

export interface TodayClass {
  id: string;
  courseCode: string;
  courseName: string;
  faculty: string;
  startTime: string;
  endTime: string;
  room: string;
  building: string;
}

export type AssignmentStatus = "PENDING" | "SUBMITTED" | "LATE" | "OVERDUE";

export interface Assignment {
  id: string;
  title: string;
  course: string;
  deadline: string;
  status: AssignmentStatus;
  marks: number;
}

export type ExamType = "MIDTERM" | "FINAL" | "QUIZ" | "PRACTICAL";

export interface UpcomingExam {
  id: string;
  title: string;
  type: ExamType;
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  room: string;
  totalMarks?: number;
}

export interface Result {
  courseCode: string;
  courseName: string;
  credit: number;
  marks: number;
  grade: string;
  gradePoint: number;
}

export type InvoiceStatus = "PAID" | "PENDING" | "CANCELLED" | "OVERDUE";

export interface Invoice {
  id: string;
  invoiceNo: string;
  title: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

export interface FeeSummaryData {
  total: number;
  paid: number;
  pending: number;
  items?: Invoice[];
}

export type PaymentStatus = "SUCCESS" | "PENDING" | "FAILED";

export interface Payment {
  id: string;
  invoiceNo: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  date: string;
}

export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ALERT";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface StudentDashboardData {
  student: Student;
  overview: DashboardStats;
  gpaHistory: GPAHistory[];
  attendance: AttendanceData[];
  gradeDistribution: GradeDistribution[];
  currentCourses: CurrentCourse[];
  todayClasses: TodayClass[];
  assignments: Assignment[];
  upcomingExams: UpcomingExam[];
  results: Result[];
  invoices: FeeSummaryData;
  recentPayments: Payment[];
  notifications: Notification[];
}
