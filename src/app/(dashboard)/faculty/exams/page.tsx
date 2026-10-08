import type { Metadata } from "next";
import { FacultyExamsView } from "@/components/faculty/exams/faculty-exams-view";

export const metadata: Metadata = {
  title: "Exams | Faculty Portal",
  description: "Schedule and manage examinations.",
};

export default function Page() {
  return <FacultyExamsView />;
}
