import type { Metadata } from "next";
import { FacultyResultsView } from "@/components/faculty/results/faculty-results-view";

export const metadata: Metadata = {
  title: "Results | Faculty Portal",
  description: "Post and manage academic results.",
};

export default function Page() {
  return <FacultyResultsView />;
}
