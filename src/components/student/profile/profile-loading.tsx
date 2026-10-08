import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full animate-pulse">
      {/* Top Breadcrumb & Action bar skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Header Banner Skeleton */}
      <Card className="overflow-hidden border-border/60">
        <Skeleton className="h-28 w-full" />
        <CardContent className="px-6 pb-6 pt-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end -mt-12">
            <Skeleton className="size-28 rounded-2xl border-4 border-background" />
            <div className="flex-1 space-y-2.5 pt-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column: Photo Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/60">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-4">
              <Skeleton className="size-32 rounded-2xl" />
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-9 w-full max-w-xs" />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Details Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Academic Skeleton */}
          <Card className="border-border/60">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Skeleton */}
          <Card className="border-border/60">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-18 rounded-xl" />
              ))}
            </CardContent>
          </Card>

          {/* Contact Skeleton */}
          <Card className="border-border/60">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-60" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-18 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
