"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { useMinistries } from "@/app/services/ministries";
import {
  useAttendance,
  VolunteerWithAttendance,
} from "@/app/services/attendance";

import { toast } from "sonner";
import { AttendanceSkeleton } from "./attendance-skeleton";
import { AttendanceRow } from "./attendance-row";
import Link from "next/link";

export type AttendancePayload = {
  volunteerId: number;
  ministryId: number;
  days: number[];
  monthlyMeeting: "P" | "E" | "A";
  remarks?: string;
};

export default function AttendanceSheet({ user }: any) {
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState<VolunteerWithAttendance[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ministryId, setMinistryId] = useState<string>("all");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hasChanges, setHasChanges] = useState(false);

  const limit = 10;

  const { data: ministries } = useMinistries();

  const userMinistry = user.ministry;

  const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const today = new Date().getDate();
  const isCurrentMonth =
    selectedMonth === new Date().getMonth() &&
    selectedYear === new Date().getFullYear();

  const { volunteers, isLoading, saveAttendance, saving, pagination } =
    useAttendance(
      page,
      limit,
      ministryId === "all" ? undefined : Number(ministryId),
      selectedMonth + 1,
      selectedYear,
    );
  console.log(pagination, "pagination");
  console.log(volunteers, "data volunteer");
  /* =========================
     Normalize API -> Local
  ========================= */
  useEffect(() => {
    if (!volunteers) return;

    const normalized = volunteers.map((m: any) => {
      let days = m.days ?? [];
      if (days.length !== totalDays) {
        const newDays = Array(totalDays).fill(0);
        for (let i = 0; i < Math.min(days.length, totalDays); i++) {
          newDays[i] = days[i] ?? 0;
        }
        days = newDays;
      }
      return { ...m, days, monthlyMeeting: m.monthlyMeeting ?? "A" };
    });

    if (JSON.stringify(normalized) !== JSON.stringify(members)) {
      setMembers(normalized);
    }
  }, [volunteers, totalDays]);

  /* =========================
     Reset page on filters
  ========================= */
  useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedYear, ministryId]);

  /* =========================
     Day Increment / Reset
  ========================= */
  const incrementDay = (id: number, index: number) => {
    setHasChanges(true);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              days: m.days.map((v, i) =>
                i === index ? Math.min(v + 1, 8) : v,
              ),
            }
          : m,
      ),
    );
  };

  const resetDay = (id: number, index: number) => {
    setHasChanges(true);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, days: m.days.map((v, i) => (i === index ? 0 : v)) }
          : m,
      ),
    );
  };

  /* =========================
     Monthly Meeting Dropdown
  ========================= */
  const updateMonthlyMeeting = (id: number, value: "P" | "E" | "A") => {
    setHasChanges(true);
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, monthlyMeeting: value } : m)),
    );
  };

  /* =========================
     Save Attendance
  ========================= */
  const handleSave = async () => {
    try {
      await saveAttendance(
        members.map((m) => ({
          volunteerId: m.id,
          ministryId: m.ministryId,
          days: m.days,
          monthlyMeeting: m.monthlyMeeting,
        })),
      );
      toast.success("Attendance saved!");
      setHasChanges(false);
    } catch {
      toast.error("Save failed");
    }
  };

  if (isLoading) return <AttendanceSkeleton user={user} />;

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200">
      {/* Sidebar */}
      <div className="print-hidden">
        <Sidebar
          user={user}
          isOpen={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
      </div>

      <div className="flex flex-col md:ml-64">
        {/* Header */}
        <div className="print-hidden">
          <Header
            user={user}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Filters */}
        <div className="p-6 space-y-4 print-hidden">
          <h1 className="text-xl font-semibold text-white">Attendance Sheet</h1>
          <div className="flex gap-3 flex-wrap">
            {/* Month */}
            <NativeSelect
              value={selectedMonth.toString()}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <NativeSelectOption key={i} value={i.toString()}>
                  {new Date(2000, i).toLocaleString("default", {
                    month: "long",
                  })}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            {/* Year */}
            <NativeSelect
              value={selectedYear.toString()}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <NativeSelectOption key={year} value={year.toString()}>
                    {year}
                  </NativeSelectOption>
                );
              })}
            </NativeSelect>

            {/* Ministry */}
            <NativeSelect
              value={ministryId}
              onChange={(e) => setMinistryId(e.target.value)}
            >
              <NativeSelectOption value="all">
                All Ministries
              </NativeSelectOption>
              {ministries?.map((m: any) => (
                <NativeSelectOption key={m.id} value={m.id.toString()}>
                  {m.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            {/* Save */}
            {hasChanges && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "💾 Save"}
              </Button>
            )}

            {/* Print */}
            <Button onClick={() => window.print()} variant="outline">
              🖨️ Print
            </Button>

            <Link href="/attendance/summary">
              <Button variant="outline">Summary of Attendance</Button>
            </Link>
          </div>
        </div>

        {/* Print Header */}
        {user.role === "STAFF" && ministryId !== "all" && (
          <div className="hidden print:block text-center text-lg font-semibold mb-2">
            {userMinistry} Attendance -{" "}
            {new Date(selectedYear, selectedMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </div>
        )}

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-800">
                <th className="sticky left-0 bg-neutral-900 px-2">Member</th>
                <th>Monthly</th>
                {Array.from({ length: totalDays }).map((_, i) => (
                  <th key={i}>{i + 1}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <AttendanceRow
                  key={member.id}
                  member={member}
                  today={today}
                  isCurrentMonth={isCurrentMonth}
                  incrementDay={incrementDay}
                  resetDay={resetDay}
                  updateMonthlyMeeting={updateMonthlyMeeting}
                />
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-400">
                Page {page} of {pagination.totalPages} ({selectedMonth + 1}/
                {selectedYear})
              </span>

              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Prev
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    className={page === i + 1 ? "min-w-10" : "w-10"}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                onClick={() =>
                  setPage((p) => Math.min(p + 1, pagination.totalPages))
                }
                disabled={page === pagination.totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
