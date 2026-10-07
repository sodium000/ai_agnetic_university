import type { Metadata } from "next";
import { StudentCoursesView } from "@/components/student/courses/student-courses-view";

export const metadata: Metadata = {
  title: "Current Courses | Student Dashboard",
  description: "View and manage all your registered courses for the current semester.",
};

export default function StudentCurrentCoursesPage() {
  return <StudentCoursesView />;
}
