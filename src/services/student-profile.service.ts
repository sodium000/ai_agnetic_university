import apiFetch from "@/lib/apiClient";
import type {
  StudentProfile,
  StudentProfileApiResponse,
  UpdateStudentProfilePayload,
} from "@/types/student-profile";

export const initialMockProfile: StudentProfile = {
  id: "student-mock-uuid-101",
  studentId: "STU20267027",
  userId: "user-mock-uuid-202",
  admissionYear: 2026,
  currentYear: 1,
  currentSemester: 1,
  gender: "Male",
  address: "45 University Ave, Dhaka",
  phone: "+8801812345678",
  photoUrl: "",
  dateOfBirth: "2003-05-15",
  isProfileComplete: true,
  user: {
    id: "user-mock-uuid-202",
    name: "Raisul Islam Tonmoy",
    email: "tonmoy@example.com",
    role: "STUDENT",
    phone: "+8801812345678",
    photoUrl: "",
    status: "ACTIVE",
    emailVerified: true,
  },
  department: {
    id: "dept-cse-uuid",
    name: "Computer Science & Engineering",
    code: "CSE",
    facultyName: "Faculty of Science & Engineering",
  },
  program: {
    id: "prog-bse-uuid",
    name: "B.Sc. in Computer Science & Engineering",
    code: "BSC-CSE",
    durationYears: 4,
    totalCredits: 144,
  },
};

/**
 * Fetch the authenticated student's profile from the backend.
 * Endpoint: GET /api/v1/student/me
 */
export async function fetchStudentProfile(): Promise<StudentProfile> {
  const response =
    await apiFetch<StudentProfileApiResponse>("/api/v1/student/me");
  if (response?.data) {
    return response.data;
  }
  throw new Error(response?.message || "Invalid profile response from server");
}

/**
 * Update a specific profile field on the backend.
 * Endpoint: PATCH /api/v1/student/me
 * Sends ONLY the single field being updated.
 */
export async function updateStudentProfileField(
  payload: UpdateStudentProfilePayload,
): Promise<StudentProfile> {
  const response = await apiFetch<StudentProfileApiResponse>(
    "/api/v1/student/me",
    {
      method: "PATCH",
      body: payload,
    },
  );

  if (response?.data) {
    return response.data;
  }
  throw new Error(response?.message || "Failed to update profile field");
}

export function extractErrorMessage(err: unknown, defaultMsg: string): string {
  if (typeof err === "object" && err !== null) {
    const errorObj = err as {
      data?: { message?: string };
      message?: string;
    };
    if (errorObj.data?.message) return errorObj.data.message;
    if (errorObj.message) return errorObj.message;
  }
  return defaultMsg;
}
