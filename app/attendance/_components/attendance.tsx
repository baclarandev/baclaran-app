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

import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AttendanceRow } from "./attendance-row";
import { AttendanceModal } from "./attendance-modal";

export default function AttendanceSheet({ user }: any) {
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState<VolunteerWithAttendance[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ministryId, setMinistryId] = useState<string>("all");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hasChanges, setHasChanges] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<VolunteerWithAttendance | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(
    null,
  );
  const limit = 10;

  const { data: ministries } = useMinistries();

  const userMinistry = user?.ministry;

  const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const today = new Date().getDate();
  const isCurrentMonth =
    selectedMonth === new Date().getMonth() &&
    selectedYear === new Date().getFullYear();

  const {
    volunteers,
    isLoading,
    saveAttendance,
    addService,
    // deleteService,
    // isSaving,
    // isDeletingService,
    pagination,
  } = useAttendance(
    page,
    limit,
    ministryId === "all" ? undefined : Number(ministryId),
    selectedMonth + 1,
    selectedYear,
  );

  useEffect(() => {
    if (!volunteers) return;

    const normalized = volunteers.map((m: any) => {
      // Ensure days array has all month days
      const dayMap = new Map<number, any>();

      if (Array.isArray(m.days)) {
        m.days.forEach((dayObj: any) => {
          dayMap.set(dayObj.day, dayObj);
        });
      }

      // Fill in missing days
      const days = Array.from({ length: totalDays }, (_, i) => {
        const dayNum = i + 1;
        return dayMap.get(dayNum) || { day: dayNum, services: [] };
      });

      return {
        ...m,
        days,
      };
    });

    setMembers(normalized);
  }, [volunteers, totalDays]);

  /* =========================
     Reset page on filters
  ========================= */
  useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedYear, ministryId]);

  const handleOpenModal = (member: VolunteerWithAttendance, index: number) => {
    setSelectedMember(member);
    setSelectedDateIndex(index);
    setModalOpen(true);

    requestAnimationFrame(() => {
      setModalOpen(true);
    });
  };

  const selectedDay =
    selectedMember && selectedDateIndex !== null ? selectedDateIndex + 1 : null;

  const selectedDayData =
    selectedMember && selectedDateIndex !== null
      ? selectedMember.days?.[selectedDateIndex]
      : null;
  const updateMonthlyMeeting = async (
    id: number,
    value: "PRESENT" | "EXCUSED" | "ABSENT",
  ) => {
    // optimistic UI
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, monthlyMeeting: value } : m)),
    );

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MONTHLY",
          volunteerId: id,
          month: selectedMonth + 1,
          year: selectedYear,
          value,
        }),
      });
    } catch (err) {
      toast.error("Failed to save monthly meeting");
    }
  };
  const serviceHistory =
    selectedDayData?.services?.map((s) => ({
      timeIn: new Date(s.timeIn),
      timeOut: s.timeOut ? new Date(s.timeOut) : undefined,
      order: s.serviceOrder,
    })) ?? [];
  const optimisticAddService = (
    memberId: number,
    dayIndex: number,
    newService: any,
  ) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        const days = [...m.days];
        const day = days[dayIndex];

        return {
          ...m,
          days: days.map((d, i) =>
            i === dayIndex
              ? {
                  ...d,
                  services: [...(d.services || []), newService],
                }
              : d,
          ),
        };
      }),
    );
  };
  const selectedDate =
    selectedMember && selectedDateIndex !== null
      ? new Date(selectedYear, selectedMonth, selectedDateIndex + 1)
      : null;

  const isReadOnly = selectedDate
    ? selectedDate < new Date(new Date().setHours(0, 0, 0, 0))
    : false;
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
                <NativeSelectOption
                  className="bg-blue-950 text-white"
                  key={i}
                  value={i.toString()}
                >
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
                  <NativeSelectOption
                    className="bg-blue-950 text-white"
                    key={year}
                    value={year.toString()}
                  >
                    {year}
                  </NativeSelectOption>
                );
              })}
            </NativeSelect>

            {/* Ministry */}
            {user.role === "ADMIN" && (
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
            )}

            {/* Save */}

            {/* Print */}
            {/* <Button onClick={() => window.print()} variant="outline">
              🖨️ Print
            </Button> */}

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
        <div className="p-6 space-y-4 ">
          <div className="overflow-x-auto border border-neutral-700 rounded-lg ">
            <table className="w-full table-auto  text-sm bg-blue-500/10 border-blue-500/30 border backdrop-blur-md">
              <thead>
                <tr className="bg-blue-500/20 border-b border-neutral-700">
                  <th className="sticky left-0 bg-blue-600 z-100  px-4 py-3 text-left font-semibold">
                    Member
                  </th>
                  <th className="px-4 py-3 text-center font-semibold min-w-30">
                    Monthly
                  </th>
                  {Array.from({ length: totalDays }).map((_, i) => (
                    <th key={i} className="px-2 py-3 text-center font-semibold">
                      {i + 1}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold min-w-15">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <AttendanceRow
                    key={member.id}
                    member={member}
                    today={today}
                    isCurrentMonth={isCurrentMonth}
                    onOpenModal={handleOpenModal}
                    updateMonthlyMeeting={updateMonthlyMeeting}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {modalOpen && selectedMember && selectedDateIndex !== null && (
            <AttendanceModal
              readOnly={isReadOnly}
              serviceHistory={serviceHistory}
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              volunteerId={selectedMember.id}
              volunteerName={`${selectedMember.firstName} ${selectedMember.lastName}`}
              date={
                new Date(selectedYear, selectedMonth, selectedDateIndex + 1)
              }
              initialTimeIn={serviceHistory.at(-1)?.timeIn ?? null}
              initialTimeOut={serviceHistory.at(-1)?.timeOut ?? null}
              onSave={async (timeIn, timeOut) => {
                if (!selectedMember || selectedDateIndex === null) return;

                const tempService = {
                  timeIn,
                  timeOut,
                  serviceOrder: Date.now(), // temp id
                };
                optimisticAddService(
                  selectedMember.id,
                  selectedDateIndex,
                  tempService,
                );
                try {
                  await addService({
                    volunteerId: selectedMember.id,
                    ministryId: selectedMember.ministryId ?? 0,
                    day: selectedDateIndex + 1,
                    month: selectedMonth + 1,
                    year: selectedYear,
                    timeIn,
                    timeOut,
                  });
                  toast.success("Saved");
                } catch (error) {
                  toast.error("Failed to save attendance");
                  // Optionally, you can implement a rollback of the optimistic update here
                }
                if (timeOut) setModalOpen(false);
              }}
            />
          )}
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm text-gray-400">
                Total of {pagination?.total} members
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      className={
                        page === 1
                          ? "pointer-events-none cursor-pointer opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {pagination.totalPages <= 7 ? (
                    Array.from({ length: pagination.totalPages }).map(
                      (_, i) => (
                        <PaginationItem className="" key={i}>
                          <PaginationLink
                            onClick={() => setPage(i + 1)}
                            isActive={page === i + 1}
                            className="active:bg-stone-600 cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )
                  ) : (
                    <>
                      {page > 2 && (
                        <>
                          <PaginationItem>
                            <PaginationLink onClick={() => setPage(1)}>
                              1
                            </PaginationLink>
                          </PaginationItem>
                          {page > 3 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                        </>
                      )}

                      {Array.from({ length: 3 })
                        .map((_, i) => page - 1 + i)
                        .filter((p) => p > 0 && p <= pagination.totalPages)
                        .map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              onClick={() => setPage(p)}
                              isActive={page === p}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                      {page < pagination.totalPages - 1 && (
                        <>
                          {page < pagination.totalPages - 2 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setPage(pagination.totalPages)}
                            >
                              {pagination.totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, pagination.totalPages))
                      }
                      className={
                        page === pagination.totalPages
                          ? "pointer-events-none opacity-50 cursor-pointer"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
