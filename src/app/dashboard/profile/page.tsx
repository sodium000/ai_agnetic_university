import type { Metadata } from "next";
import DashboardLayout from "@/app/(dashboard)/layout";
import { StudentProfile } from "@/components/student/profile/student-profile";

export const metadata: Metadata = {
  title: "Student Profile | University Management System",
  description: "View and manage your university student profile information.",
};

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <StudentProfile />
    </DashboardLayout>
  );
}
