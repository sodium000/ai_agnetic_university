"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fetchFacultyStudents } from "@/services/faculty.service";
import type { TaughtStudent } from "@/types/faculty";

function StudentsContent() {
  const searchParams = useSearchParams();
  const initSection = searchParams.get("sectionId") ?? "";
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["faculty-students", initSection, search],
    queryFn: () => fetchFacultyStudents({ sectionId: initSection || undefined, search: search || undefined }),
    retry: 1,
    staleTime: 30000,
  });

  const students: TaughtStudent[] = data ?? [];

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/faculty" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1.5 px-2 text-xs text-muted-foreground cursor-pointer")}>
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Students</h1>
          <p className="text-sm text-muted-foreground">
            All students enrolled in your course sections
            {students.length > 0 && <span className="ml-2 text-primary font-medium">({students.length})</span>}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or student ID..."
          className="pl-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : students.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => {
            const initials = student.user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
            return (
              <Card key={student.id} className="border-border/80 shadow-xs hover:shadow-md transition-all duration-200">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="size-12 border border-primary/20">
                    {student.user.photoUrl && <AvatarImage src={student.user.photoUrl} alt={student.user.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-semibold truncate">{student.user.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs font-mono">{student.studentId}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Yr {student.currentYear}, Sem {student.currentSemester}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{student.user.email}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Users className="size-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm font-medium">{search ? "No matching students" : "No students found"}</p>
            <p className="text-xs text-muted-foreground mt-1">{search ? "Try a different search term." : "Students will appear here once enrolled."}</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

export function FacultyStudentsView() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center p-10"><div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <StudentsContent />
    </Suspense>
  );
}
