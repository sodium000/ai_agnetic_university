import type { Metadata } from "next";
import { FacultySectionsView } from "@/components/faculty/sections/faculty-sections-view";

export const metadata: Metadata = {
  title: "My Sections | Faculty Portal",
  description: "View all course sections assigned to you.",
};

export default function Page() {
  return <FacultySectionsView />;
}
