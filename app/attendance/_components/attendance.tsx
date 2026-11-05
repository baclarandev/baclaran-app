"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  LogIn,
  LogOut,
  Plus,
  CalendarDays,
  Users,
} from "lucide-react";
import {
  useAttendance,
  VolunteerWithAttendance,
} from "@/app/services/attendance";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useMinistries } from "@/app/services/ministries";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

type MeetingStatus = "PRESENT" | "EXCUSED" | "ABSENT";

type AttendanceService = Omit<
  VolunteerWithAttendance["days"][number]["services"][number],
  "timeIn"
> & {
  id: number;
  timeIn: Date | string | null;
  timeOut: Date | string | null;
};

type AttendanceMember = Omit<VolunteerWithAttendance, "days"> & {
  days: {
    day: number;
    services: AttendanceService[];
  }[];
};

function formatAttendanceTime(value: Date | string | null | undefined) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMemberName(member: AttendanceMember) {
  return (
    `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
    "Unnamed member"
  );
}

export default function Attendance({ user }: any) {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  const today = new Date();

  const [page, setPage] = useState(1);

  const [selectedDate, setSelectedDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const [month, setMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<AttendanceMember[]>([]);

  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");

  const [ministryId, setMinistryId] = useState("all");

  const [saving, setSaving] = useState<number | null>(null);

  const limit = 10;

  // ─────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────

  const { data: ministries } = useMinistries();

  const { volunteers, isLoading, addService, isFetching, pagination } =
    useAttendance(
      page,
      limit,
      ministryId === "all" ? undefined : Number(ministryId),
      month.getMonth() + 1,
      month.getFullYear(),
    );

  const totalDays = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  // ─────────────────────────────────────────
  // CALENDAR
  // ─────────────────────────────────────────

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      month.getFullYear(),
      month.getMonth(),
      1,
    ).getDay();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: totalDays }, (_, index) => index + 1),
    ];
  }, [month, totalDays]);

  const isSelected = (day: number) =>
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month.getMonth() &&
    selectedDate.getFullYear() === month.getFullYear();

  const changeMonth = (direction: number) => {
    const nextMonth = new Date(
      month.getFullYear(),
      month.getMonth() + direction,
      1,
    );

    setMonth(nextMonth);
    setSelectedDate(nextMonth);
    setPage(1);
  };

  const selectDate = (day: number) => {
    setSelectedDate(new Date(month.getFullYear(), month.getMonth(), day));
  };

  // ─────────────────────────────────────────
  // NORMALIZE API DATA
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!volunteers) {
      setMembers([]);
      return;
    }

    const normalized = volunteers.map((member: any) => {
      const dayMap = new Map<number, any>();

      if (Array.isArray(member.days)) {
        member.days.forEach((day: any) => {
          dayMap.set(day.day, day);
        });
      }

      const days = Array.from({ length: totalDays }, (_, index) => {
        const dayNumber = index + 1;
        const existingDay = dayMap.get(dayNumber);

        return {
          day: dayNumber,
          services: existingDay?.services ?? [],
        };
      });

      return {
        ...member,
        days,
      };
    });

    setMembers(normalized);
  }, [volunteers, totalDays]);

  // ─────────────────────────────────────────
  // SELECTED DAY SERVICES
  // ─────────────────────────────────────────

  const getDayServices = (member: AttendanceMember) => {
    return (
      member.days?.find((day) => day.day === selectedDate.getDate())
        ?.services ?? []
    );
  };

  // ─────────────────────────────────────────
  // SAVE DAILY ATTENDANCE
  // ─────────────────────────────────────────

  const saveDailyService = async (
    member: AttendanceMember,
    serviceIndex: number,
    field: "timeIn" | "timeOut",
    createNew = false,
  ) => {
    const memberId = member.id;
    const services = getDayServices(member);
    const currentService = services[serviceIndex];

    if (field === "timeOut" && !currentService?.timeIn) {
      toast.error("Record time in first.");
      return;
    }

    const clearing = !createNew && Boolean(currentService?.[field]);

    const now = new Date().toISOString();

    const ministry = member.ministryId ?? user.ministryId;

    if (!ministry) {
      toast.error("Unable to determine the member's ministry.");
      return;
    }

    setSaving(memberId);

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          volunteerId: memberId,
          ministryId: ministry,
          day: selectedDate.getDate(),
          month: selectedDate.getMonth() + 1,
          year: selectedDate.getFullYear(),

          timeIn: field === "timeIn" && !clearing ? now : null,

          timeOut: field === "timeOut" && !clearing ? now : null,

          clearTimeIn: field === "timeIn" && clearing,
          clearTimeOut: field === "timeOut" && clearing,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save attendance.");
      }

      setMembers((previous) =>
        previous.map((item) => {
          if (item.id !== memberId) return item;

          return {
            ...item,
            days: item.days.map((day) => {
              if (day.day !== selectedDate.getDate()) return day;

              let updatedServices = [...day.services];

              // Clearing time in removes the active session.
              if (field === "timeIn" && clearing) {
                updatedServices = updatedServices.filter(
                  (service) => service.id !== currentService.id,
                );
              } else if (result.attendance) {
                const savedService = result.attendance as AttendanceService;

                const existingIndex = updatedServices.findIndex(
                  (service) => service.id === savedService.id,
                );

                if (existingIndex >= 0) {
                  updatedServices[existingIndex] = savedService;
                } else {
                  updatedServices.push(savedService);
                }
              }

              return {
                ...day,
                services: updatedServices.sort(
                  (a, b) => a.serviceOrder - b.serviceOrder,
                ),
              };
            }),
          };
        }),
      );

      toast.success(
        clearing
          ? `${field === "timeIn" ? "Time in" : "Time out"} cleared.`
          : createNew
            ? "New session recorded."
            : field === "timeIn"
              ? "Time in recorded."
              : "Time out recorded.",
      );
    } catch (error) {
      console.error("Attendance error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save attendance.",
      );
    } finally {
      setSaving(null);
    }
  };

  // ─────────────────────────────────────────
  // MONTHLY MEETING
  // ─────────────────────────────────────────

  const updateMonthlyMeeting = async (
    memberId: number,
    value: MeetingStatus,
  ) => {
    const member = members.find((item) => item.id === memberId);

    if (!member) return;

    const previousValue = member.monthlyMeeting;

    // Optimistic update
    setMembers((previous) =>
      previous.map((item) =>
        item.id === memberId ? { ...item, monthlyMeeting: value } : item,
      ),
    );

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "MONTHLY",
          volunteerId: memberId,
          month: month.getMonth() + 1,
          year: month.getFullYear(),
          value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save monthly attendance.");
      }

      toast.success("Monthly attendance updated.");
    } catch (error) {
      console.error(error);

      // Roll back to previous value
      setMembers((previous) =>
        previous.map((item) =>
          item.id === memberId
            ? { ...item, monthlyMeeting: previousValue }
            : item,
        ),
      );

      toast.error("Failed to save monthly attendance.");
    }
  };

  // ─────────────────────────────────────────
  // STATISTICS
  // ─────────────────────────────────────────

  const recordedMembers = members.filter((member) =>
    getDayServices(member).some((service) => service.timeIn),
  ).length;

  const totalSessions = members.reduce(
    (total, member) => total + getDayServices(member).length,
    0,
  );

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <main className="min-h-screen  bg-[#101216]  text-slate-100 ">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-wrap items-center justify-between gap-4 md:mx-4 md:m-6 ">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">
              Attendance Management
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Attendance
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage daily attendance and monthly meeting records.
            </p>
          </div>

          {user.role === "ADMIN" && (
            <div className="w-full sm:w-56">
              <NativeSelect
                value={ministryId}
                onChange={(e) => {
                  setMinistryId(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-white w-full"
              >
                <NativeSelectOption value="all" className="bg-black text-white">
                  All Ministries
                </NativeSelectOption>

                {ministries?.map((ministry: any) => (
                  <NativeSelectOption
                    key={ministry.id}
                    value={String(ministry.id)}
                    className="bg-black text-white"
                  >
                    {ministry.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mx-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#17191f] px-3 py-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isLoading ? "animate-pulse bg-amber-400" : "bg-emerald-400"
              }`}
            />

            <span className="text-xs text-slate-400">
              {isLoading ? "Loading attendance..." : "Attendance connected"}
            </span>
          </div>

          <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-1">
            <button
              onClick={() => setViewMode("daily")}
              className={`rounded-md px-4 py-2 text-xs font-medium transition ${
                viewMode === "daily"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Daily view
            </button>

            <button
              onClick={() => setViewMode("monthly")}
              className={`rounded-md px-4 py-2 text-xs font-medium transition ${
                viewMode === "monthly"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly view
            </button>
          </div>
        </div>

        {/* STATISTICS */}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 mx-4 pt-2">
          <div className="rounded-xl border border-slate-800 bg-[#17191f] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">Total volunteers</span>
              <Users className="h-4 w-4 text-blue-400" />
            </div>

            <p className="text-2xl font-semibold text-white">
              {pagination?.total ?? 0} Volunteers
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#17191f] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Volunteers recorded
              </span>
              <LogIn className="h-4 w-4 text-emerald-400" />
            </div>

            <p className="text-2xl font-semibold text-white">
              {recordedMembers}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#17191f] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">Total sessions</span>
              <Clock3 className="h-4 w-4 text-violet-400" />
            </div>

            <p className="text-2xl font-semibold text-white">{totalSessions}</p>
          </div>
        </div>

        {/* MONTHLY VIEW */}

        {viewMode === "monthly" ? (
          <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#17191f] mx-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">Monthly attendance</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select a date to view its attendance records.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  aria-label="Previous month"
                  onClick={() => changeMonth(-1)}
                  className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="min-w-32 text-center text-sm font-medium text-white">
                  {formatMonth(month)}
                </span>

                <button
                  aria-label="Next month"
                  onClick={() => changeMonth(1)}
                  className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="sticky left-0 z-10 bg-slate-900 px-5 py-4">
                      Member
                    </th>

                    <th className="px-4 py-4">Monthly meeting</th>

                    {calendarDays.map((day, index) => (
                      <th key={index} className="px-2 py-4 text-center">
                        {day ?? ""}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-900/40">
                      <td className="sticky left-0 z-10 bg-[#17191f] px-5 py-4 font-medium text-white">
                        {getMemberName(member)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
                            member.monthlyMeeting === "PRESENT"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : member.monthlyMeeting === "EXCUSED"
                                ? "bg-amber-500/10 text-amber-400"
                                : member.monthlyMeeting === "ABSENT"
                                  ? "bg-rose-500/10 text-rose-400"
                                  : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          {member.monthlyMeeting ?? "Not recorded"}
                        </span>
                      </td>

                      {calendarDays.map((day, index) => {
                        if (!day) {
                          return <td key={index} />;
                        }

                        const services =
                          member.days.find((item) => item.day === day)
                            ?.services ?? [];
                        const totalServe = member.days.reduce(
                          (total, day) =>
                            total +
                            day.services.filter(
                              (service) => service.timeIn !== null,
                            ).length,
                          0,
                        );
                        const hasAttendance = services.some(
                          (service) => service.timeIn,
                        );

                        return (
                          <td key={index} className="px-1 py-3 text-center">
                            <button
                              onClick={() => {
                                selectDate(day);
                                setViewMode("daily");
                              }}
                              className={`mx-auto flex h-8 min-w-8 items-center justify-center rounded-full px-1 text-xs font-medium transition ${
                                isSelected(day)
                                  ? "bg-blue-600 text-white"
                                  : hasAttendance
                                    ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                    : "text-slate-600 hover:bg-slate-800 hover:text-white"
                              }`}
                            >
                              {hasAttendance ? services.length : "·"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {!members.length && !isLoading && (
                    <tr>
                      <td
                        colSpan={calendarDays.length + 2}
                        className="px-5 py-12 text-center text-sm text-slate-500"
                      >
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-slate-800 px-5 py-4">
              <span className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Recorded
              </span>

              <span className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Selected date
              </span>
            </div>
          </section>
        ) : (
          /* DAILY VIEW */

          <section className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] mx-4">
            {/* CALENDAR */}

            <aside className="h-fit rounded-xl border border-slate-800 bg-[#17191f] p-4">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold text-white">
                  {formatMonth(month)}
                </h2>

                <div className="flex gap-1">
                  <button
                    aria-label="Previous month"
                    onClick={() => changeMonth(-1)}
                    className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    aria-label="Next month"
                    onClick={() => changeMonth(1)}
                    className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-medium uppercase text-slate-500">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <span key={index} className="py-2">
                    {day}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <span key={index} />;
                  }

                  const hasAttendance = members.some((member) =>
                    (
                      member.days.find((item) => item.day === day)?.services ??
                      []
                    ).some((service) => service.timeIn),
                  );

                  return (
                    <button
                      key={index}
                      onClick={() => selectDate(day)}
                      className={`relative aspect-square rounded-lg text-sm transition ${
                        isSelected(day)
                          ? "bg-blue-600 font-semibold text-white"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {day}

                      {hasAttendance && (
                        <span
                          className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                            isSelected(day) ? "bg-white" : "bg-emerald-400"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Attendance recorded
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Selected date
                </div>
              </div>
            </aside>

            {/* DAILY RECORDS */}

            <section className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-[#17191f]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-5">
                <div>
                  <p className="mb-1 text-xs font-medium text-blue-400">
                    DAILY ATTENDANCE
                  </p>

                  <h2 className="text-lg font-semibold text-white">
                    {formatDate(selectedDate)}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {recordedMembers} of {members.length} members recorded
                  </p>
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                  <CalendarDays className="mr-2 inline h-4 w-4 text-blue-400" />
                  {formatMonth(selectedDate)}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Volunteer</th>
                      <th className="px-5 py-4">Service / session times</th>
                      <th className="px-5 py-4">Monthly meeting</th>
                      <th className="px-5 py-4 text-right">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {members.map((member) => {
                      const services = getDayServices(member);
                      const totalServe = member.days.reduce(
                        (total, day) =>
                          total +
                          day.services.filter(
                            (service) => service.timeIn !== null,
                          ).length,
                        0,
                      );
                      const hasAttendance = services.some(
                        (service) => service.timeIn,
                      );

                      const isSaving = saving === member.id;

                      return (
                        <tr
                          key={member.id}
                          className="align-top transition hover:bg-slate-900/40"
                        >
                          {/* MEMBER */}

                          <td className="px-5 py-5">
                            <p className="font-medium text-white">
                              {getMemberName(member)}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Total Serve:{" "}
                              <span className="font-semibold text-blue-400">
                                {totalServe}
                              </span>
                            </p>
                          </td>

                          {/* SERVICES */}

                          <td className="px-5 py-5">
                            <div className="min-w-[440px] space-y-3">
                              {services.map((service, index) => (
                                <div
                                  key={index}
                                  className="flex flex-wrap items-center gap-2"
                                >
                                  <span className="w-20 text-xs font-medium text-slate-500">
                                    Session {index + 1}
                                  </span>

                                  <span className="w-20 text-xs text-slate-300">
                                    {formatAttendanceTime(service.timeIn)}
                                  </span>

                                  <button
                                    disabled={isSaving}
                                    onClick={() =>
                                      saveDailyService(member, index, "timeIn")
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <LogIn className="h-3.5 w-3.5" />
                                    {service.timeIn ? "Clear" : "Time in"}
                                  </button>

                                  <span className="w-20 text-xs text-slate-300">
                                    {formatAttendanceTime(service.timeOut)}
                                  </span>

                                  <button
                                    disabled={isSaving || !service.timeIn}
                                    onClick={() =>
                                      saveDailyService(member, index, "timeOut")
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <LogOut className="h-3.5 w-3.5" />
                                    {service.timeOut ? "Clear" : "Time out"}
                                  </button>
                                </div>
                              ))}

                              <button
                                disabled={isSaving}
                                onClick={() =>
                                  saveDailyService(
                                    member,
                                    services.length,
                                    "timeIn",
                                    true,
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-md py-1 text-xs font-medium text-slate-500 transition hover:text-blue-300 disabled:opacity-50"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add another session
                              </button>
                            </div>
                          </td>

                          {/* MONTHLY MEETING */}

                          <td className="px-5 py-5">
                            <NativeSelect
                              value={member.monthlyMeeting ?? ""}
                              onChange={(e) =>
                                updateMonthlyMeeting(
                                  member.id,
                                  e.target.value as MeetingStatus,
                                )
                              }
                            >
                              <NativeSelectOption
                                value=""
                                className="bg-black text-white"
                              >
                                Not recorded
                              </NativeSelectOption>

                              <NativeSelectOption
                                value="PRESENT"
                                className="bg-black text-white"
                              >
                                Present
                              </NativeSelectOption>

                              <NativeSelectOption
                                value="EXCUSED"
                                className="bg-black text-white"
                              >
                                Excused
                              </NativeSelectOption>

                              <NativeSelectOption
                                value="ABSENT"
                                className="bg-black text-white"
                              >
                                Absent
                              </NativeSelectOption>
                            </NativeSelect>
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-5 text-right">
                            {hasAttendance ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-500">
                                No record
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {!members.length && !isLoading && (
                      <tr>
                        <td colSpan={4} className="px-5 py-16 text-center">
                          <Users className="mx-auto mb-3 h-8 w-8 text-slate-600" />

                          <p className="text-sm font-medium text-slate-300">
                            No members found
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            There are no attendance records for this ministry.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* PAGINATION */}

              <div className="mt-5 flex flex-col gap-4 rounded-xl border border-slate-800 bg-[#17191f] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    Showing {pagination?.total ? (page - 1) * limit + 1 : 0}
                    {" – "}
                    {Math.min(page * limit, pagination?.total ?? 0)}
                    {" of "}
                    {pagination?.total ?? 0} members
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Page {pagination?.page ?? page} of{" "}
                    {pagination?.totalPages ?? 1}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1 || isFetching}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    First
                  </button>

                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1 || isFetching}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <span className="rounded-lg bg-blue-600/10 px-4 py-2 text-xs font-semibold text-blue-400">
                    {page}
                  </span>

                  <button
                    onClick={() =>
                      setPage((prev) =>
                        Math.min(pagination?.totalPages ?? 1, prev + 1),
                      )
                    }
                    disabled={
                      page >= (pagination?.totalPages ?? 1) || isFetching
                    }
                    className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setPage(pagination?.totalPages ?? 1)}
                    disabled={
                      page >= (pagination?.totalPages ?? 1) || isFetching
                    }
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Last
                  </button>
                </div>
              </div>
            </section>
          </section>
        )}
      </div>
    </main>
  );
}
