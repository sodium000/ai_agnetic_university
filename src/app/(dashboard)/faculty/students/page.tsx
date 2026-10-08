import type { Metadata } from "next";
import { FacultyStudentsView } from "@/components/faculty/students/faculty-students-view";

export const metadata: Metadata = {
  title: "Students | Faculty Portal",
  description: "All students enrolled across your sections.",
};

export default function Page() {
  return <FacultyStudentsView />;
}
