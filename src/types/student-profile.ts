export interface StudentProfileUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  photoUrl?: string | null;
  status?: string;
  emailVerified?: boolean;
}

export interface StudentProfileDepartment {
  id: string;
  name: string;
  code: string;
  facultyName?: string | null;
}

export interface StudentProfileProgram {
  id: string;
  name: string;
  code: string;
  durationYears?: number | null;
  totalCredits?: number | null;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  userId: string;
  admissionYear: number;
  currentYear: number;
  currentSemester: number;
  gender?: string | null;
  address?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  dateOfBirth?: string | null;
  isProfileComplete: boolean;

  user: StudentProfileUser;
  department: StudentProfileDepartment;
  program: StudentProfileProgram;
}

export interface StudentProfileApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: StudentProfile;
}

export type EditableFieldKey =
  | "phone"
  | "photoUrl"
  | "dateOfBirth"
  | "gender"
  | "address";

export type Gender = "Male" | "Female" | "Other";

export interface UpdateStudentProfilePayload {
  phone?: string;
  photoUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}
