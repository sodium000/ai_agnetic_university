import apiFetch from "@/lib/apiClient";
import type {
  GPAHistory,
  GradeDistribution,
  Result,
} from "@/types/student-dashboard";

// ─── API response shapes ──────────────────────────────────────────────────────

export interface StudentResult {
  id: string;
  courseCode: string;
  courseName: string;
  credit: number;
  marks: number;
  grade: string;
  gradePoint: number;
  semester: string;
  semesterYear: number;
  type: "MIDTERM" | "FINAL" | "QUIZ";
}

export interface SemesterGPA {
  semester: string;
  gpa: number;
  cgpa: number;
  creditsEarned: number;
}

export interface GradesApiData {
  cgpa: number;
  totalCreditsEarned: number;
  totalCreditsRequired: number;
  results: StudentResult[];
  semesterGPA: SemesterGPA[];
  gradeDistribution: GradeDistribution[];
}

interface GradesApiResponse {
  success: boolean;
  message?: string;
  data?: GradesApiData;
}

// ─── Mock fallback data ───────────────────────────────────────────────────────

export const mockGradesData: GradesApiData = {
  cgpa: 3.62,
  totalCreditsEarned: 102,
  totalCreditsRequired: 160,
  results: [
    {
      id: "res-301",
      courseCode: "CSE 311",
      courseName: "Database Management Systems",
      credit: 3,
      marks: 91,
      grade: "A+",
      gradePoint: 4.0,
      semester: "Fall 2026",
      semesterYear: 2026,
      type: "MIDTERM",
    },
    {
      id: "res-302",
      courseCode: "CSE 321",
      courseName: "Computer Networks",
      credit: 3,
      marks: 85,
      grade: "A",
      gradePoint: 3.75,
      semester: "Fall 2026",
      semesterYear: 2026,
      type: "MIDTERM",
    },
    {
      id: "res-303",
      courseCode: "CSE 331",
      courseName: "Software Engineering",
      credit: 3,
      marks: 80,
      grade: "A-",
      gradePoint: 3.5,
      semester: "Fall 2026",
      semesterYear: 2026,
      type: "MIDTERM",
    },
    {
      id: "res-201",
      courseCode: "CSE 301",
      courseName: "Data Structures",
      credit: 3,
      marks: 88,
      grade: "A+",
      gradePoint: 4.0,
      semester: "Spring 2026",
      semesterYear: 2026,
      type: "FINAL",
    },
    {
      id: "res-202",
      courseCode: "CSE 302",
      courseName: "Algorithms",
      credit: 3,
      marks: 84,
      grade: "A",
      gradePoint: 3.75,
      semester: "Spring 2026",
      semesterYear: 2026,
      type: "FINAL",
    },
    {
      id: "res-203",
      courseCode: "CSE 303",
      courseName: "Operating Systems",
      credit: 3,
      marks: 80,
      grade: "A-",
      gradePoint: 3.5,
      semester: "Spring 2026",
      semesterYear: 2026,
      type: "FINAL",
    },
    {
      id: "res-204",
      courseCode: "CSE 304",
      courseName: "Computer Architecture",
      credit: 3,
      marks: 76,
      grade: "B+",
      gradePoint: 3.25,
      semester: "Spring 2026",
      semesterYear: 2026,
      type: "FINAL",
    },
    {
      id: "res-101",
      courseCode: "CSE 201",
      courseName: "Discrete Mathematics",
      credit: 3,
      marks: 90,
      grade: "A+",
      gradePoint: 4.0,
      semester: "Fall 2025",
      semesterYear: 2025,
      type: "FINAL",
    },
    {
      id: "res-102",
      courseCode: "CSE 202",
      courseName: "Digital Electronics",
      credit: 3,
      marks: 78,
      grade: "B+",
      gradePoint: 3.25,
      semester: "Fall 2025",
      semesterYear: 2025,
      type: "FINAL",
    },
    {
      id: "res-103",
      courseCode: "CSE 203",
      courseName: "Object Oriented Programming",
      credit: 3,
      marks: 87,
      grade: "A",
      gradePoint: 3.75,
      semester: "Fall 2025",
      semesterYear: 2025,
      type: "FINAL",
    },
  ],
  semesterGPA: [
    { semester: "Fall 2024", gpa: 3.42, cgpa: 3.42, creditsEarned: 18 },
    { semester: "Spring 2025", gpa: 3.55, cgpa: 3.48, creditsEarned: 18 },
    { semester: "Fall 2025", gpa: 3.62, cgpa: 3.52, creditsEarned: 18 },
    { semester: "Spring 2026", gpa: 3.58, cgpa: 3.54, creditsEarned: 18 },
    { semester: "Fall 2026", gpa: 3.75, cgpa: 3.62, creditsEarned: 9 },
  ],
  gradeDistribution: [
    { grade: "A+", count: 6 },
    { grade: "A", count: 8 },
    { grade: "A-", count: 5 },
    { grade: "B+", count: 4 },
    { grade: "B", count: 2 },
    { grade: "B-", count: 1 },
  ],
};

// ─── API function ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/student/me/results
 * Returns student academic results and GPA data.
 */
function mapResultRow(row: Record<string, unknown>, index: number): StudentResult {
  const course = (row.course ?? {}) as Record<string, unknown>;
  const exam = (row.exam ?? {}) as Record<string, unknown>;
  const type = String(row.type ?? exam.type ?? "FINAL").toUpperCase();

  return {
    id: String(row.id ?? `res-${index}`),
    courseCode: String(row.courseCode ?? course.code ?? "—"),
    courseName: String(row.courseName ?? course.title ?? "Course"),
    credit: Number(row.credit ?? course.credit ?? 0),
    marks: Number(row.marks ?? 0),
    grade: String(row.grade ?? "—"),
    gradePoint: Number(row.gradePoint ?? 0),
    semester: String(row.semester ?? ""),
    semesterYear: Number(row.semesterYear ?? 0),
    type: (type === "MIDTERM" || type === "QUIZ" ? type : "FINAL") as StudentResult["type"],
  };
}

function normalizeGradesPayload(data: unknown): GradesApiData | null {
  if (!data) return null;

  if (Array.isArray(data)) {
    const results = data.map((row, i) =>
      mapResultRow((row ?? {}) as Record<string, unknown>, i),
    );
    const gradeDistribution = Object.entries(
      results.reduce<Record<string, number>>((acc, r) => {
        acc[r.grade] = (acc[r.grade] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([grade, count]) => ({ grade, count }));

    const gpAvg =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.gradePoint, 0) / results.length
        : 0;

    return {
      cgpa: Number(gpAvg.toFixed(2)),
      totalCreditsEarned: results.reduce((sum, r) => sum + (r.credit || 0), 0),
      totalCreditsRequired: 0,
      results,
      semesterGPA: [],
      gradeDistribution,
    };
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.results) || typeof obj.cgpa === "number") {
      const results = Array.isArray(obj.results)
        ? obj.results.map((row, i) =>
            mapResultRow((row ?? {}) as Record<string, unknown>, i),
          )
        : [];
      return {
        cgpa: Number(obj.cgpa ?? 0),
        totalCreditsEarned: Number(obj.totalCreditsEarned ?? 0),
        totalCreditsRequired: Number(obj.totalCreditsRequired ?? 0),
        results,
        semesterGPA: Array.isArray(obj.semesterGPA)
          ? (obj.semesterGPA as SemesterGPA[])
          : [],
        gradeDistribution: Array.isArray(obj.gradeDistribution)
          ? (obj.gradeDistribution as GradeDistribution[])
          : [],
      };
    }
  }

  return null;
}

export async function fetchStudentGrades(): Promise<GradesApiData> {
  const response = await apiFetch<GradesApiResponse | { data: unknown }>(
    "/api/v1/student/me/results",
  );
  const normalized = normalizeGradesPayload(response?.data);
  if (normalized) return normalized;
  throw new Error(
    (response as GradesApiResponse)?.message || "Failed to load grades data",
  );
}

export async function fetchStudentGradeDetail(resultId: string): Promise<StudentResult> {
  const response = await apiFetch<{
    success?: boolean;
    message?: string;
    data?: StudentResult | Record<string, unknown>;
  }>(`/api/v1/student/me/results/${encodeURIComponent(resultId)}`);

  const detail = response?.data;
  if (!detail) {
    throw new Error(response?.message || "Failed to load grade detail");
  }

  if (typeof detail === "object" && !Array.isArray(detail)) {
    return mapResultRow(detail as Record<string, unknown>, 0);
  }

  throw new Error(response?.message || "Failed to load grade detail");
}

export const fetchStudentResult = fetchStudentGradeDetail;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getGradeColor(grade: string): string {
  if (grade === "A+" || grade === "A")
    return "text-emerald-600 dark:text-emerald-400";
  if (grade === "A-" || grade === "B+")
    return "text-blue-600 dark:text-blue-400";
  if (grade === "B" || grade === "B-")
    return "text-amber-600 dark:text-amber-400";
  if (grade === "C+" || grade === "C")
    return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

/** Convert SemesterGPA array to GPAHistory for GPAChart */
export function toGPAHistory(semesterGPA: SemesterGPA[]): GPAHistory[] {
  return semesterGPA.map((s) => ({ semester: s.semester, gpa: s.gpa }));
}

/** Convert StudentResult[] to Result[] used by RecentResults */
export function toResultType(results: StudentResult[]): Result[] {
  return results.map((r) => ({
    courseCode: r.courseCode,
    courseName: r.courseName,
    credit: r.credit,
    marks: r.marks,
    grade: r.grade,
    gradePoint: r.gradePoint,
  }));
}
