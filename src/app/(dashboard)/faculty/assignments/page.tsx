import type { Metadata } from "next";
import { FacultyAssignmentsView } from "@/components/faculty/assignments/faculty-assignments-view";

export const metadata: Metadata = {
  title: "Assignments | Faculty Portal",
  description: "Create and manage assignments for your sections.",
};

export default function Page() {
  return <FacultyAssignmentsView />;
}
