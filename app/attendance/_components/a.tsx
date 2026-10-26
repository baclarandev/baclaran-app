"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const members = [
  {
    name: "Ava Thompson",
    initials: "AT",
    team: "Worship",
    tone: "bg-rose-100 text-rose-700",
    days: [
      2, 1, 0, 2, 1, 0, 2, 1, 0, 1, 2, 0, 1, 1, 0, 2, 1, 0, 1, 1, 0, 2, 1, 0, 1,
      0, 1, 0, 0, 0, 0,
    ],
    total: 21,
  },
  {
    name: "Noah Williams",
    initials: "NW",
    team: "Production",
    tone: "bg-sky-100 text-sky-700",
    days: [
      1, 1, 1, 0, 1, 2, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1,
      1, 0, 0, 0, 0, 0,
    ],
    total: 19,
  },
  {
    name: "Sophia Martinez",
    initials: "SM",
    team: "Kids Ministry",
    tone: "bg-amber-100 text-amber-700",
    days: [
      0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0,
    ],
    total: 16,
  },
  {
    name: "Liam Anderson",
    initials: "LA",
    team: "Welcome Team",
    tone: "bg-violet-100 text-violet-700",
    days: [
      1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 0,
    ],
    total: 14,
  },
  {
    name: "Mia Johnson",
    initials: "MJ",
    team: "Worship",
    tone: "bg-emerald-100 text-emerald-700",
    days: [
      1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ],
    total: 17,
  },
  {
    name: "Ethan Brown",
    initials: "EB",
    team: "Production",
    tone: "bg-blue-100 text-blue-700",
    days: [
      0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ],
    total: 15,
  },
];

const nav = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Attendance", icon: ClipboardCheck, active: true },
  { label: "People", icon: Users },
];

function StatusCell({
  value,
  day,
  onClick,
}: {
  value: number;
  day: number;
  onClick: () => void;
}) {
  const today = day === 15;
  const className =
    value > 0
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      : today
        ? "border-indigo-200 bg-indigo-50 text-indigo-500 ring-2 ring-indigo-100"
        : "border-slate-100 bg-slate-50 text-slate-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-500";
  return (
    <button
      onClick={onClick}
      aria-label={`Day ${day}, ${value ? `${value} services` : "not recorded"}`}
      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition ${className}`}
    >
      {value || "—"}
    </button>
  );
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("March 2025");
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = useMemo(
    () =>
      members.filter((member) =>
        member.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <main className="attendance-shell min-h-screen bg-[#f7f8fc] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200/80 bg-white px-5 py-6 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-semibold tracking-tight">Harbor Church</p>
            <p className="text-xs text-slate-400">Community portal</p>
          </div>
        </div>
        <div className="mt-12 space-y-1">
          {nav.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            >
              <Icon size={18} />
              {label}
              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-indigo-600" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-auto space-y-1">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50">
            <Settings size={18} />
            Settings
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50">
            <CircleHelp size={18} />
            Help center
          </button>
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              JD
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Jordan Davis</p>
              <p className="truncate text-xs text-slate-400">Administrator</p>
            </div>
            <MoreHorizontal size={17} className="ml-auto text-slate-400" />
          </div>
        </div>
      </aside>

      <section className="lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/80 px-5 backdrop-blur lg:px-10">
          <button className="rounded-lg p-2 text-slate-500 lg:hidden">
            <Menu size={20} />
          </button>
          <div className="hidden text-sm text-slate-400 sm:block">
            Workspace <span className="mx-2">/</span>{" "}
            <span className="font-medium text-slate-700">Attendance</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> All
              systems operational
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
              JD
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                <ClipboardCheck size={14} /> Volunteer operations
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Attendance
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Keep a pulse on your team&apos;s presence and participation.
              </p>
            </div>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">
              <Plus size={17} /> Add attendance
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Total volunteers</p>
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Users size={17} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">128</p>
              <p className="mt-2 text-xs text-emerald-600">
                ↑ 8.2% <span className="text-slate-400">vs last month</span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Average attendance</p>
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <Check size={17} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">
                84.6%
              </p>
              <p className="mt-2 text-xs text-emerald-600">
                ↑ 3.4% <span className="text-slate-400">vs last month</span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Services logged</p>
                <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <Clock3 size={17} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">342</p>
              <p className="mt-2 text-xs text-slate-400">Across 6 ministries</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Needs follow-up</p>
                <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                  <Users size={17} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">12</p>
              <p className="mt-2 text-xs text-rose-600">3 new this week</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Monthly attendance
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Click any day to view or update a service record.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search volunteers"
                    className="h-10 w-52 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
                <button className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  {month}
                  <ChevronDown size={15} />
                </button>
                <button className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <span className="hidden sm:inline">All teams</span>
                  <ChevronDown size={15} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-emerald-400" />{" "}
                  Present
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-indigo-200 ring-2 ring-indigo-50" />{" "}
                  Today
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-slate-100" /> No
                  record
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMonth("February 2025")}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  onClick={() => setMonth("April 2025")}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/70 text-xs text-slate-400">
                    <th className="sticky left-0 z-10 min-w-[220px] bg-slate-50/95 px-5 py-3 text-left font-medium">
                      Volunteer
                    </th>
                    <th className="min-w-[112px] px-3 py-3 text-center font-medium">
                      Monthly
                    </th>
                    {days.map((day) => (
                      <th
                        key={day}
                        className={`min-w-[43px] px-1 py-3 text-center font-medium ${day === 15 ? "text-indigo-600" : ""}`}
                      >
                        {day}
                      </th>
                    ))}
                    <th className="sticky right-0 min-w-[76px] bg-slate-50/95 px-4 py-3 text-center font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member) => (
                    <tr
                      key={member.name}
                      className="border-t border-slate-100 transition hover:bg-indigo-50/30"
                    >
                      <td className="sticky left-0 z-10 bg-white px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${member.tone}`}
                          >
                            {member.initials}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {member.name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {member.team}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Present
                        </span>
                      </td>
                      {member.days.map((value, index) => (
                        <td key={index} className="px-1 py-3">
                          <StatusCell
                            value={value}
                            day={index + 1}
                            onClick={() => setSelected(member.name)}
                          />
                        </td>
                      ))}
                      <td className="sticky right-0 bg-white px-4 py-4 text-center">
                        <span className="font-semibold text-slate-800">
                          {member.total}
                        </span>
                        <span className="ml-1 text-xs text-slate-400">
                          / 31
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>Showing {filtered.length} of 128 volunteers</span>
              <div className="flex items-center gap-1">
                <button className="rounded-lg border border-slate-200 p-2 text-slate-400">
                  <ChevronLeft size={14} />
                </button>
                <button className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white">
                  1
                </button>
                <button className="rounded-lg px-3 py-1.5 hover:bg-slate-50">
                  2
                </button>
                <button className="rounded-lg px-3 py-1.5 hover:bg-slate-50">
                  3
                </button>
                <button className="rounded-lg border border-slate-200 p-2 text-slate-500">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-5 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
                  Attendance record
                </p>
                <h2 className="mt-1 text-xl font-semibold">{selected}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  March 15, 2025 · Saturday
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={19} />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">Present</p>
                  <p className="text-xs text-emerald-700">
                    Service record completed
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Time in</p>
                <p className="mt-1 font-semibold">8:42 AM</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Time out</p>
                <p className="mt-1 font-semibold">12:18 PM</p>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
