import type { Metadata } from "next";
import { FacultyProfileView } from "@/components/faculty/profile/faculty-profile-view";

export const metadata: Metadata = {
  title: "Profile | Faculty Portal",
  description: "View and update your faculty profile.",
};

export default function Page() {
  return <FacultyProfileView />;
}
