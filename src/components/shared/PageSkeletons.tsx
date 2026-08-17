import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

function ShellSkeleton({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl">{children}</div>;
}

export function AdminDashboardSkeleton() {
  return (
    <ShellSkeleton>
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-8 h-72 rounded-xl" />
    </ShellSkeleton>
  );
}

export function TablePageSkeleton() {
  return (
    <ShellSkeleton>
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/5" />
      </div>
      <Skeleton className="mb-4 mt-8 h-11 w-full max-w-md" />
      <div className="overflow-hidden rounded-xl border border-border/70">
        <div className="border-b border-border/70 p-4">
          <Skeleton className="h-5 w-1/4" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 p-4">
              {Array.from({ length: 5 }).map((__, cellIndex) => (
                <Skeleton key={cellIndex} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </ShellSkeleton>
  );
}

export function MastersGridSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
        <div className="mt-6 rounded-xl border border-border/70 p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-20 lg:col-span-3" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CandidateDashboardSkeleton() {
  return (
    <ShellSkeleton>
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-10 h-6 w-64" />
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-xl" />
        ))}
      </div>
    </ShellSkeleton>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="mx-auto max-w-3xl">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-2 h-4 w-80" />
      <Skeleton className="mt-6 h-80 rounded-xl" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}