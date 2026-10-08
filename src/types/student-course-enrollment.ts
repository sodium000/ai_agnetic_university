export type EnrollmentStatus = "ENROLLED" | "DROPPED" | "COMPLETED";

export interface CourseData {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  credit: number;
  department?: string;
}

export interface SemesterData {
  id: string;
  name: string;
  year: number;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface FacultyUserData {
  id: string;
  name: string;
  email: string;
  photoUrl?: string | null;
}

export interface FacultyData {
  id: string;
  user: FacultyUserData;
  designation?: string;
}

export interface SectionData {
  id: string;
  name: string;
  courseId: string;
  semesterId: string;
  facultyId: string;
  capacity: number;
  enrolledCount?: number;
  schedule?: string;
  room?: string;
  course: CourseData;
  semester: SemesterData;
  faculty: FacultyData;
}

export interface EnrolledCourseEnrollment {
  id: string;
  studentId: string;
  sectionId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  section: SectionData;
}

export interface EnrollCoursePayload {
  sectionId: string;
}

export interface EnrolledCoursesApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: EnrolledCourseEnrollment[];
}

export interface EnrollmentActionApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: EnrolledCourseEnrollment;
}

export interface DropEnrollmentApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    id: string;
    status: EnrollmentStatus;
  };
}
