"use client";

import { studentDashboardData } from "@/data/student-dashboard";
import type { StudentDashboardData } from "@/types/student-dashboard";

import { AssignmentsCard } from "./assignments-card";
import { AttendanceChart } from "./attendance-chart";
import { DashboardStats } from "./dashboard-stats";
import { FeeSummary } from "./fee-summary";
import { GPAChart } from "./gpa-chart";
import { RecentNotifications } from "./recent-notifications";
import { StudentHeader } from "./student-header";
import { UpcomingExams } from "./upcoming-exams";

interface StudentDashboardProps {
  initialData?: StudentDashboardData;
}

export function StudentDashboard({
  initialData = studentDashboardData,
}: StudentDashboardProps) {
  const data = initialData;

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8">
      <StudentHeader student={data.student} />
      <DashboardStats stats={data.overview} />
      <section
        aria-label="Academic progression charts"
        className="grid gap-6 lg:grid-cols-7"
      >
        <div className="lg:col-span-4">
          <GPAChart data={data.gpaHistory} />
        </div>

        <div className="lg:col-span-3">
          <AttendanceChart data={data.attendance} />
        </div>
      </section>

      {/* Coursework Submissions & Scheduled Examinations */}
      <section
        aria-label="Assignments and upcoming exams"
        className="grid gap-6 lg:grid-cols-2"
      >
        <AssignmentsCard assignments={data.assignments} />
        <UpcomingExams exams={data.upcomingExams} />
      </section>

      {/* Tuition Invoices & Official University Notifications */}
      <section
        aria-label="Fee summary and communications"
        className="grid gap-6 lg:grid-cols-7"
      >
        <div className="lg:col-span-4">
          <FeeSummary
            feeSummary={data.invoices}
            recentPayments={data.recentPayments}
          />
        </div>

        <div className="lg:col-span-3">
          <RecentNotifications notifications={data.notifications} />
        </div>
      </section>
    </main>
  );
}
