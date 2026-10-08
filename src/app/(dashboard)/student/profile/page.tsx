import type { Metadata } from "next";
import { StudentProfile } from "@/components/student/profile/student-profile";

export const metadata: Metadata = {
  title: "Profile | Student Dashboard",
  description: "View and manage your university student profile information.",
};

export default function StudentProfilePage() {
  return <StudentProfile />;
}
