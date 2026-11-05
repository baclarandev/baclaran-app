"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const members = [
  {
    id: 1,
    name: "Alyssa Santos",
    timeIn: "08:02 AM",
    timeOut: "12:04 PM",
    servedToday: true,
    monthlyAttendance: 18,
  },
  {
    id: 2,
    name: "Benjamin Cruz",
    timeIn: "08:15 AM",
    timeOut: "12:10 PM",
    servedToday: true,
    monthlyAttendance: 16,
  },
  {
    id: 3,
    name: "Carla Mendoza",
    timeIn: null,
    timeOut: null,
    servedToday: false,
    monthlyAttendance: 14,
  },
  {
    id: 4,
    name: "Daniel Reyes",
    timeIn: "08:34 AM",
    timeOut: "12:18 PM",
    servedToday: true,
    monthlyAttendance: 19,
  },
  {
    id: 5,
    name: "Elena Garcia",
    timeIn: null,
    timeOut: null,
    servedToday: false,
    monthlyAttendance: 12,
  },
  {
    id: 6,
    name: "Francis Dela Cruz",
    timeIn: "08:08 AM",
    timeOut: "12:03 PM",
    servedToday: true,
    monthlyAttendance: 17,
  },
];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Page() {
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState(members);
  const currentDate = useMemo(
    () => new Date(`${selectedDate}T12:00:00`),
    [selectedDate],
  );
  const filteredMembers = records.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase()),
  );
  const servedCount = records.filter((member) => member.servedToday).length;

  function markTime(memberId: number, field: "timeIn" | "timeOut") {
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setRecords((current) =>
      current.map((member) =>
        member.id === memberId
          ? { ...member, [field]: now, servedToday: true }
          : member,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8 sm:px-8 lg:py-12">
        <header className="mb-8 flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
              <CalendarDays aria-hidden="true" />
              <span>Attendance</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Daily attendance
            </h1>
            <p className="mt-2 text-muted-foreground">
              Review service records for a selected day.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label
              htmlFor="attendance-date"
              className="text-sm font-medium text-muted-foreground"
            >
              Select day
            </label>
            <input
              id="attendance-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </header>

        <section
          aria-label="Attendance summary"
          className="mb-8 grid gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">
              People serving today
            </p>
            <p className="mt-1 text-3xl font-semibold">
              {servedCount}
              <span className="ml-1 text-base font-normal text-muted-foreground">
                / {records.length}
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Check aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">Selected day</p>
            <p className="mt-1 truncate text-lg font-semibold">
              {formatDate(currentDate)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock3 aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">Monthly attendance</p>
            <p className="mt-1 text-3xl font-semibold">
              {records.reduce(
                (sum, member) => sum + member.monthlyAttendance,
                0,
              )}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Service records</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(currentDate)}
              </p>
            </div>
            <label className="relative block sm:w-64">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <span className="sr-only">Search members</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Time in</th>
                  <th className="px-5 py-3 font-medium">Time out</th>
                  <th className="px-5 py-3 font-medium">Serve today</th>
                  <th className="px-5 py-3 text-right font-medium">
                    Monthly attendance
                  </th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <th scope="row" className="px-5 py-4 font-medium">
                      {member.name}
                    </th>
                    <td className="px-5 py-4 text-muted-foreground">
                      {member.timeIn ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {member.timeOut ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      {member.servedToday ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <Check aria-hidden="true" /> Serving
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          No serve today
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-medium">
                      {member.monthlyAttendance}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markTime(member.id, "timeIn")}
                          aria-label={`Set time in for ${member.name}`}
                        >
                          Time in
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markTime(member.id, "timeOut")}
                          aria-label={`Set time out for ${member.name}`}
                        >
                          Time out
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMembers.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No members found.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
