import { StudentGradesView } from "@/components/student/grades/student-grades-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grades & Results | Student Dashboard",
  description:
    "View your full academic transcript, semester GPA history, grade distribution, and detailed course results.",
};

export default function StudentGradesPage() {
  return <StudentGradesView />;
}
