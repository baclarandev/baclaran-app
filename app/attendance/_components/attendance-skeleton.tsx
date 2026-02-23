"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function AttendanceSkeleton({ user }: any) {
  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200 animate-pulse">
      <Sidebar user={user} isOpen={false} onOpenChange={() => {}} />

      <div className="flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => {}} />

        <div className="p-6 space-y-6">
          <div className="h-6 w-48 bg-neutral-800 rounded" />

          <div className="flex gap-3">
            <div className="h-10 w-40 bg-neutral-800 rounded" />
            <div className="h-10 w-32 bg-neutral-800 rounded" />
            <div className="h-10 w-48 bg-neutral-800 rounded" />
            <div className="h-10 w-28 bg-neutral-800 rounded" />
          </div>

          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-neutral-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
