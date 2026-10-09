import type { Metadata } from "next";
import { AdminProgramsView } from "@/components/admin/programs/admin-programs-view";

export const metadata: Metadata = {
  title: "Degree Programs | University Admin",
  description: "Academic degree programs, credit distributions, and graduation requirements.",
};

export default function AdminProgramsPage() {
  return <AdminProgramsView />;
}
