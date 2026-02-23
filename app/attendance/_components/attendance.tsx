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

export default function AttendanceSheet({ user }: any) {
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState<VolunteerWithAttendance[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ministryId, setMinistryId] = useState<string>("all");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const limit = 10;
  const { data: ministries } = useMinistries();

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

  // Normalize volunteers to local state
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
      return { ...m, days, monthlyMeeting: m.monthlyMeeting ?? false };
    });

    if (JSON.stringify(normalized) !== JSON.stringify(members)) {
      setMembers(normalized);
    }
  }, [volunteers, totalDays]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedYear, ministryId]);

  const incrementDay = (id: number, index: number) => {
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
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, days: m.days.map((v, i) => (i === index ? 0 : v)) }
          : m,
      ),
    );
  };

  const toggleMonthlyMeeting = (id: number) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, monthlyMeeting: !m.monthlyMeeting } : m,
      ),
    );
  };

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
    } catch {
      toast.error("Save failed");
    }
  };

  if (isLoading) return <AttendanceSkeleton user={user} />;

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200">
      {/* Sidebar (hidden in print) */}
      <div className="print-hidden">
        <Sidebar
          user={user}
          isOpen={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
      </div>

      <div className="flex flex-col md:ml-64">
        {/* Header (hidden in print) */}
        <div className="print-hidden">
          <Header
            user={user}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Filters (hidden in print) */}
        <div className="p-6 space-y-4 print-hidden">
          <h1 className="text-xl font-semibold text-white">Attendance Sheet</h1>
          <div className="flex gap-3 flex-wrap">
            <NativeSelect
              value={selectedMonth.toString()}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <NativeSelectOption
                  className="bg-blue-500/20"
                  key={i}
                  value={i.toString()}
                >
                  {new Date(2000, i).toLocaleString("default", {
                    month: "long",
                  })}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            <NativeSelect
              value={selectedYear.toString()}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-blue-500/20"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <NativeSelectOption
                    className="bg-blue-500/20"
                    key={year}
                    value={year.toString()}
                  >
                    {year}
                  </NativeSelectOption>
                );
              })}
            </NativeSelect>

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

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "💾 Save"}
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="print-hidden"
            >
              🖨️ Print
            </Button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="p-6 printable-table print:w-full print:overflow-visible">
          <table className="w-full border-collapse text-sm print:text-xs">
            <thead>
              <tr className="bg-neutral-800 print:bg-neutral-200">
                <th className="sticky left-0 bg-neutral-900 px-2 print:bg-neutral-200">
                  Member
                </th>
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
                  toggleMonthlyMeeting={toggleMonthlyMeeting}
                />
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-4 print:hidden">
              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                variant="outline"
              >
                Prev
              </Button>
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <Button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  variant={page === i + 1 ? "default" : "outline"}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                onClick={() =>
                  setPage((p) => Math.min(p + 1, pagination.totalPages))
                }
                disabled={page === pagination.totalPages}
                variant="outline"
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
