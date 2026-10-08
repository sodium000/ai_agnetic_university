import type { Metadata } from "next";
import { EnrollmentView } from "@/components/student/enrollment/enrollment-view";

export const metadata: Metadata = {
  title: "Course Enrollment | Student Portal",
  description:
    "Browse academic course sections, check registration status, and enroll or drop courses.",
};

export default function StudentEnrollmentPage() {
  return <EnrollmentView />;
}
