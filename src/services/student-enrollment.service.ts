import apiFetch from "@/lib/apiClient";
import type {
  DropEnrollmentApiResponse,
  EnrolledCourseEnrollment,
  EnrolledCoursesApiResponse,
  EnrollmentActionApiResponse,
  SectionData,
} from "@/types/student-course-enrollment";
import { extractErrorMessage } from "./student-profile.service";

/**
 * Catalog of available course sections for enrollment
 */
export const initialAvailableSections: SectionData[] = [
  {
    id: "sec-cse301-a",
    name: "Section 01",
    courseId: "course-cse301",
    semesterId: "sem-fall-2026",
    facultyId: "fac-101",
    capacity: 40,
    enrolledCount: 36,
    schedule: "Mon, Wed 10:00 AM - 11:30 AM",
    room: "Lab 402, Academic Bldg A",
    course: {
      id: "course-cse301",
      code: "CSE-301",
      title: "Database Management Systems",
      description:
        "Relational database design, SQL querying, indexing, and transaction management.",
      credit: 3.0,
      department: "CSE",
    },
    semester: {
      id: "sem-fall-2026",
      name: "Fall 2026",
      year: 2026,
      status: "ONGOING",
    },
    faculty: {
      id: "fac-101",
      user: {
        id: "usr-fac-101",
        name: "Dr. Sarah Ahmed",
        email: "sarah.ahmed@university.edu",
      },
      designation: "Associate Professor",
    },
  },
  {
    id: "sec-cse301-b",
    name: "Section 02",
    courseId: "course-cse301",
    semesterId: "sem-fall-2026",
    facultyId: "fac-102",
    capacity: 35,
    enrolledCount: 28,
    schedule: "Sun, Tue 02:00 PM - 03:30 PM",
    room: "Room 305, IT Center",
    course: {
      id: "course-cse301",
      code: "CSE-301",
      title: "Database Management Systems",
      description:
        "Relational database design, SQL querying, indexing, and transaction management.",
      credit: 3.0,
      department: "CSE",
    },
    semester: {
      id: "sem-fall-2026",
      name: "Fall 2026",
      year: 2026,
      status: "ONGOING",
    },
    faculty: {
      id: "fac-102",
      user: {
        id: "usr-fac-102",
        name: "Prof. Anisur Rahman",
        email: "anisur.rahman@university.edu",
      },
      designation: "Professor",
    },
  },
  {
    id: "sec-cse311-a",
    name: "Section 01",
    courseId: "course-cse311",
    semesterId: "sem-fall-2026",
    facultyId: "fac-103",
    capacity: 40,
    enrolledCount: 39,
    schedule: "Mon, Wed 01:00 PM - 02:30 PM",
    room: "Software Lab 201",
    course: {
      id: "course-cse311",
      code: "CSE-311",
      title: "Web & Enterprise Application Development",
      description:
        "Full-stack development with React, Next.js, Node.js, RESTful APIs, and modern DevOps.",
      credit: 3.0,
      department: "CSE",
    },
    semester: {
      id: "sem-fall-2026",
      name: "Fall 2026",
      year: 2026,
      status: "ONGOING",
    },
    faculty: {
      id: "fac-103",
      user: {
        id: "usr-fac-103",
        name: "Farhan Tanvir",
        email: "farhan.tanvir@university.edu",
      },
      designation: "Assistant Professor",
    },
  },
  {
    id: "sec-cse421-a",
    name: "Section 01",
    courseId: "course-cse421",
    semesterId: "sem-fall-2026",
    facultyId: "fac-104",
    capacity: 35,
    enrolledCount: 22,
    schedule: "Sun, Tue 11:30 AM - 01:00 PM",
    room: "AI Research Lab 501",
    course: {
      id: "course-cse421",
      code: "CSE-421",
      title: "Machine Learning & Neural Networks",
      description:
        "Supervised and unsupervised learning, gradient descent, deep learning architectures.",
      credit: 3.0,
      department: "CSE",
    },
    semester: {
      id: "sem-fall-2026",
      name: "Fall 2026",
      year: 2026,
      status: "ONGOING",
    },
    faculty: {
      id: "fac-104",
      user: {
        id: "usr-fac-104",
        name: "Dr. Kazi Mahbub",
        email: "kazi.mahbub@university.edu",
      },
      designation: "Associate Professor",
    },
  },
  {
    id: "sec-cse325-a",
    name: "Section 01",
    courseId: "course-cse325",
    semesterId: "sem-fall-2026",
    facultyId: "fac-105",
    capacity: 40,
    enrolledCount: 30,
    schedule: "Mon, Wed 08:30 AM - 10:00 AM",
    room: "Networking Lab 304",
    course: {
      id: "course-cse325",
      code: "CSE-325",
      title: "Computer Networks & Security",
      description:
        "OSI model, TCP/IP protocol suite, routing protocols, cryptography, and network defense.",
      credit: 3.0,
      department: "CSE",
    },
    semester: {
      id: "sem-fall-2026",
      name: "Fall 2026",
      year: 2026,
      status: "ONGOING",
    },
    faculty: {
      id: "fac-105",
      user: {
        id: "usr-fac-105",
        name: "Engr. Nabila Islam",
        email: "nabila.islam@university.edu",
      },
      designation: "Lecturer",
    },
  },
  {
    id: "sec-mat201-a",
    name: "Section 01",
    courseId: "course-mat201",
    semesterId: "sem-fall-2026",
    facultyId: "fac-106",
    capacity: 45,
    enrolledCount: 42,
    schedule: "Sun, Tue 09:00 AM - 10:30 AM",
    room: "Auditorium Hall B",
    course: {
      id: "course-mat201",
      code: "MAT-201",
      title: "Linear Algebra & Differential Equations",
      description:
        "Vector spaces, matrices, eigenvalues, linear transformations, and applications in engineering.",
      credit: 3.0,
      department: "MAT",
    },
    semester: {
      id: "sem-fall-2026",
      name: "Fall 2026",
      year: 2026,
      status: "ONGOING",
    },
    faculty: {
      id: "fac-106",
      user: {
        id: "usr-fac-106",
        name: "Dr. Shamsul Huda",
        email: "shamsul.huda@university.edu",
      },
      designation: "Professor",
    },
  },
  {
    id: "sec-cse435-a",
    name: "Section 01",
    courseId: "course-cse435",
    semesterId: "sem-fall-2026",
    facultyId: "fac-107",
    capacity: 30,
    enrolledCount: 18,
    schedule: "Tue, Thu 03:30 PM - 05:00 PM",
    room: "Cloud Computing Lab 405",
    course: {
      id: "course-cse435",
      code: "CSE-435",
      title: "Cloud Computing & Distributed Systems",
      description:
        "Microservices architecture, AWS/GCP, Docker, Kubernetes, and scalable systems.",
      credit: 3.0,
      department: "CSE",
    },
    semester: {
      id: "sem-fall-2026",
      name: "Fall 2026",
      year: 2026,
      status: "ONGOING",
    },
    faculty: {
      id: "fac-107",
      user: {
        id: "usr-fac-107",
        name: "Tariqul Hasan",
        email: "tariqul.hasan@university.edu",
      },
      designation: "Assistant Professor",
    },
  },
];

/**
 * Initial mock enrollments for offline development fallback
 */
export const initialMockEnrollments: EnrolledCourseEnrollment[] = [
  {
    id: "enr-mock-1",
    studentId: "stu-current-id",
    sectionId: "sec-cse301-a",
    status: "ENROLLED",
    enrolledAt: "2026-09-01T08:00:00.000Z",
    section: initialAvailableSections[0] as SectionData,
  },
  {
    id: "enr-mock-2",
    studentId: "stu-current-id",
    sectionId: "sec-cse311-a",
    status: "ENROLLED",
    enrolledAt: "2026-09-02T09:30:00.000Z",
    section: initialAvailableSections[2] as SectionData,
  },
  {
    id: "enr-mock-3",
    studentId: "stu-current-id",
    sectionId: "sec-mat201-a",
    status: "ENROLLED",
    enrolledAt: "2026-09-03T11:15:00.000Z",
    section: initialAvailableSections[5] as SectionData,
  },
];

/**
 * GET /api/v1/student/me/courses
 * Returns all courses the student is enrolled in.
 */
export async function fetchEnrolledCourses(
  status?: string,
): Promise<EnrolledCourseEnrollment[]> {
  const url = status
    ? `/api/v1/student/me/courses?status=${encodeURIComponent(status)}`
    : "/api/v1/student/me/courses";

  const response = await apiFetch<EnrolledCoursesApiResponse>(url);
  if (response?.data) {
    return response.data;
  }
  throw new Error(response?.message || "Failed to load enrolled courses");
}

export async function fetchStudentCourseDetail(
  courseId: string,
): Promise<EnrolledCourseEnrollment> {
  const response = await apiFetch<{ data?: EnrolledCourseEnrollment; message?: string }>(
    `/api/v1/student/me/courses/${encodeURIComponent(courseId)}`,
  );

  if (response?.data) return response.data;
  throw new Error(response?.message || "Failed to load course detail");
}

export const fetchStudentCourse = fetchStudentCourseDetail;

/**
 * POST /api/v1/student/me/enrollments
 * Enrolls the student in a specific course section. Duplicate enrollments are rejected.
 */
export async function enrollCourseSection(
  sectionId: string,
): Promise<EnrolledCourseEnrollment> {
  const response = await apiFetch<EnrollmentActionApiResponse>(
    "/api/v1/student/me/enrollments",
    {
      method: "POST",
      body: { sectionId },
    },
  );

  if (response?.data) {
    return response.data;
  }
  throw new Error(response?.message || "Failed to enroll in course section");
}

/**
 * DELETE /api/v1/student/me/enrollments/:id
 * Drops the student from a course section.
 */
export async function dropCourseEnrollment(
  id: string,
): Promise<{ id: string; status: string }> {
  const response = await apiFetch<DropEnrollmentApiResponse>(
    `/api/v1/student/me/enrollments/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );

  if (response?.data) {
    return response.data;
  }
  throw new Error(response?.message || "Failed to drop enrollment");
}

/**
 * GET /api/v1/student/me/enrollments
 * Returns all enrollments for the student
 */
export async function fetchStudentEnrollments() {
  const response = await apiFetch<{ success: boolean; data: EnrolledCourseEnrollment[] }>(
    "/api/v1/student/me/enrollments",
  );
  return response?.data || [];
}

export async function fetchStudentEnrollmentDetail(
  enrollmentId: string,
): Promise<EnrolledCourseEnrollment> {
  const response = await apiFetch<{
    success?: boolean;
    message?: string;
    data?: EnrolledCourseEnrollment;
  }>(`/api/v1/student/me/enrollments/${encodeURIComponent(enrollmentId)}`);

  if (response?.data) return response.data;
  throw new Error(response?.message || "Failed to load enrollment detail");
}

export const fetchStudentEnrollment = fetchStudentEnrollmentDetail;

/**
 * GET /api/v1/student/me/schedule
 * Returns class and exam schedules
 */
export async function fetchStudentSchedule() {
  const response = await apiFetch<{ success: boolean; data: unknown }>(
    "/api/v1/student/me/schedule",
  );
  return response?.data;
}

/**
 * GET /api/v1/student/me/attendance
 * Returns attendance records
 */
export async function fetchStudentAttendance() {
  const response = await apiFetch<{ success: boolean; data: unknown }>(
    "/api/v1/student/me/attendance",
  );
  return response?.data;
}

/**
 * GET /api/v1/student/me/transcript
 * Returns full transcript with CGPA
 */
export async function fetchStudentTranscript() {
  const response = await apiFetch<{ success: boolean; data: unknown }>(
    "/api/v1/student/me/transcript",
  );
  return response?.data;
}

/**
 * GET /api/v1/student/me/assignments
 * View student assignments
 */
export async function fetchStudentAssignments() {
  const response = await apiFetch<{ success: boolean; data: unknown[] }>(
    "/api/v1/student/me/assignments",
  );
  return response?.data || [];
}

export async function fetchStudentAssignmentDetail(assignmentId: string) {
  const response = await apiFetch<{ success?: boolean; message?: string; data?: unknown }>(
    `/api/v1/student/me/assignments/${encodeURIComponent(assignmentId)}`,
  );

  if (response?.data) return response.data;
  throw new Error(response?.message || "Failed to load assignment detail");
}

/**
 * POST /api/v1/student/me/assignments/:id/submit
 */
export async function submitStudentAssignment(
  assignmentId: string,
  fileUrl: string,
) {
  const response = await apiFetch<{ success: boolean; data: unknown }>(
    `/api/v1/student/me/assignments/${encodeURIComponent(assignmentId)}/submit`,
    {
      method: "POST",
      body: { fileUrl },
    },
  );
  return response?.data;
}


export { extractErrorMessage };

