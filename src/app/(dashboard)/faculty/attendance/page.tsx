import type { Metadata } from "next";
import { FacultyAttendanceView } from "@/components/faculty/attendance/faculty-attendance-view";

export const metadata: Metadata = {
  title: "Attendance | Faculty Portal",
  description: "Record and manage student attendance.",
};

export default function Page() {
  return <FacultyAttendanceView />;
}
