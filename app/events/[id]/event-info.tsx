"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Calendar, Loader2, Printer } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useEventById, useUpdateAttendance } from "@/app/services/event";
import { EventSkeletonGrid } from "../_components/event-skeleton-grid";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMinistries } from "@/app/services/ministries";

interface VolunteerAttendance {
  id: number;
  volunteer: {
    id: number;
    firstName: string;
    lastName: string;
    ministry?: {
      id: number;
      name: string;
    };
  };
  session: "AM" | "PM";
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "ABSENT";
  response:
    | "ON_LEAVE"
    | "EXCUSE"
    | "CAN_ATTEND"
    | "CANT_ATTEND"
    | "NO_RESPONSE";
}

export default function EventInfo({
  eventId,
  user,
}: {
  eventId: string;
  user: any;
}) {
  const numericEventId = Number(eventId);

  const [editedRows, setEditedRows] = useState<
    Record<number | string, Partial<VolunteerAttendance>>
  >({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filterMinistry, setFilterMinistry] = useState("ALL");
  const [filterSession, setFilterSession] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const pageSize = 10;
  const isAdmin = user.role === "ADMIN";
  const { data: ministry } = useMinistries();
  const {
    data: event,
    isLoading,
    isError,
    refetch,
  } = useEventById(numericEventId);
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});
  const updateAttendance = useUpdateAttendance(numericEventId);
  const ministryOptions = useMemo(() => {
    if (!ministry) return ["ALL"];

    return ["ALL", ...ministry.map((m: any) => m.name.trim())];
  }, [ministry]);
  /* =========================
     MERGE DATA (FIXED ID)
  ========================= */
  const volunteerWithResponse = useMemo(() => {
    let data = event?.volunteers || [];

    // 🔁 GROUP BY VOLUNTEER
    const grouped: Record<number, any> = {};

    data.forEach((item: any) => {
      const vid = item.volunteer.id;

      if (!grouped[vid]) {
        grouped[vid] = {
          volunteer: item.volunteer,
          AM: null,
          PM: null,
        };
      }

      grouped[vid][item.session] = item;
    });

    let merged = Object.values(grouped);

    // 🔍 SEARCH
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      merged = merged.filter(
        (v: any) =>
          v.volunteer.firstName.toLowerCase().includes(s) ||
          v.volunteer.lastName.toLowerCase().includes(s),
      );
    }

    // ✅ FILTER MINISTRY
    if (filterMinistry !== "ALL") {
      merged = merged.filter(
        (v: any) =>
          (v.volunteer.ministry?.name || "No Ministry") === filterMinistry,
      );
    }

    // ✅ SORT
    merged = merged.sort((a: any, b: any) => {
      const aMin = (a.volunteer.ministry?.name || "").toLowerCase();
      const bMin = (b.volunteer.ministry?.name || "").toLowerCase();

      if (aMin !== bMin) return aMin.localeCompare(bMin);

      const aLast = a.volunteer.lastName.toLowerCase();
      const bLast = b.volunteer.lastName.toLowerCase();

      return sortOrder === "asc"
        ? aLast.localeCompare(bLast)
        : bLast.localeCompare(aLast);
    });

    return merged;
  }, [event, search, filterMinistry, sortOrder]);

  const totalPages = Math.ceil(volunteerWithResponse.length / pageSize);

  const paginatedAttendance = volunteerWithResponse.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  useEffect(() => {
    setPage(1);
  }, [filterMinistry, filterSession, sortOrder, search]);
  /* =========================
     TIMER
  ========================= */
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!event) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(event.startDate).getTime();
      const end = new Date(event.endDate).getTime();

      let target = start;
      let label = "Pre-registration starts in";

      if (now >= start && now <= end) {
        target = end;
        label = "Ends in";
      }

      const distance = target - now;

      if (distance <= 0) {
        setTimeLeft("Event has ended");
        return;
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const m = Math.floor((distance / (1000 * 60)) % 60);

      setTimeLeft(`${label}: ${d}d ${h}h ${m}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  /* =========================
     EDIT HANDLERS
  ========================= */
  const handleChange = (
    id: number,
    session: "AM" | "PM",
    field: "status" | "response" | "session",
    value: string,
  ) => {
    const key = `${id}-${session}`;

    setEditedRows((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        attendanceId: id,
        [field]: value,
      },
    }));
  };
  const handleSave = (id: number, session: "AM" | "PM") => {
    const key = `${id}-${session}`;
    const changes = editedRows[key];

    if (!changes) {
      toast.info("No changes to save");
      return;
    }

    // Set loading key
    setLoadingKey(key);

    // Optimistic UI: already reflected in `editedRows` state
    updateAttendance.mutate(
      {
        attendanceId: id,
        ...changes,
      },
      {
        onSuccess: () => {
          toast.success(`Attendance updated`);

          // Remove saved changes
          setEditedRows((prev) => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
          });

          refetch();
        },
        onError: () => {
          toast.error("Update failed");
        },
        onSettled: () => {
          // Reset loading key
          setLoadingKey(null);
        },
      },
    );
  };
  const handlePrint = () => {
    if (!event) return;

    // ✅ FILTER: only confirmed attendees
    let attendees = (event.volunteers || []).filter(
      (a: any) => a.response === "CAN_ATTEND",
    );

    // ✅ STAFF: only their ministry
    if (user.role === "STAFF") {
      attendees = attendees.filter(
        (a: any) => a.volunteer.ministry?.name === user.ministry?.name,
      );
    }

    // ✅ GROUP BY MINISTRY
    const grouped: Record<string, any[]> = {};

    attendees.forEach((a: any) => {
      const ministry = (a.volunteer.ministry?.name || "No Ministry").trim();

      if (!grouped[ministry]) grouped[ministry] = [];
      grouped[ministry].push(a);
    });

    let content = "";

    const buildTable = (list: any[]) =>
      list
        .map(
          (v, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${v.volunteer.firstName} ${v.volunteer.lastName}</td>
        <td></td>
      </tr>
    `,
        )
        .join("");

    Object.entries(grouped).forEach(([ministry, volunteers]) => {
      // 🔥 SPLIT AM / PM
      const am = volunteers.filter((v) => v.session === "AM");
      const pm = volunteers.filter((v) => v.session === "PM");

      // ================= AM PAGE =================
      if (am.length > 0) {
        content += `
     <div class="header">
  <img src="${window.location.origin}/logo.svg" />
  <div>
    <strong>National Shrine of Our Mother of Perpetual Help</strong><br/>
    Baclaran Church<br/>
    Redemptorist rd, Parañaque City, Philippines
  </div>

  <h2>${event.title}</h2>
  <h3>${ministry}</h3>
  <h4>AM Session</h4>
</div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Volunteer Name</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          ${buildTable(am)}
        </tbody>
      </table>

      <div class="page-break"></div>
      `;
      }

      // ================= PM PAGE =================
      if (pm.length > 0) {
        content += `
    <div class="header">
    <div class="header-row">
       <img src="${window.location.origin}/logo.svg" />
            <div>
              <strong>National Shrine of Our Mother of Perpetual Help</strong><br/>
              Baclaran Church<br/>
              Redemptorist rd, Parañaque City, Philippines
            </div>
    </div>

    <h2>${event.title}</h2>
    <h3>${ministry}</h3>
    <h4>PM Session</h4>
  </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Volunteer Name</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          ${buildTable(pm)}
        </tbody>
      </table>

      <div class="page-break"></div>
      `;
      }
    });

    const printWindow = window.open("", "", "width=900,height=700");

    printWindow!.document.write(`
    <html>
      <head>
        <title>Attendance Sheet</title>
        <style>
          body {
            font-family: Arial;
            padding: 30px;
          }

          .header {
            text-align: center;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
td {
  text-align: center;
}
          th, td {
            border: 1px solid black;
            padding: 12px;
            font-size: 16px;
              text-align: center;
          }

          th {
            background: #eee;
          }

        
          td:nth-child(3) {
            width: 300px;
          }

          
            @page {
  margin: 10mm;
}

@media print {
  body {
    -webkit-print-color-adjust: exact;
    margin: 0;
  }

  .page-break {
    page-break-before: always;
  }
}
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);

    printWindow!.document.close();
    printWindow!.focus();
    printWindow!.print();
  };

  /* =========================
     LOADING / ERROR
  ========================= */
  if (isLoading) {
    return (
      <div className="min-h-screen w-full text-white">
        {" "}
        <Sidebar
          user={user}
          isOpen={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />{" "}
        <div className="flex-1 flex flex-col md:ml-64">
          {" "}
          <Header
            user={user}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />{" "}
          <div className="m-6 p-6 bg-blue-500/10 border border-blue-500/30 backdrop-blur-md">
            {" "}
            <EventSkeletonGrid />{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }
  if (isError || !event) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400">
        {" "}
        Failed to load event{" "}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* EVENT CARD */}
        <Card className="m-6 p-6 bg-blue-500/10 border border-blue-500/30">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={18} />
                {event.title}
              </CardTitle>
              <div className="text-sm text-blue-300 mt-1">{timeLeft}</div>
            </div>

            {/* {user.role === "ADMIN" && ( */}
            <Button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700"
            >
              <Printer size={16} /> Print
            </Button>
            {/* )} */}
          </CardHeader>
        </Card>
        <Card className="m-6 p-6 bg-blue-500/10 border flex-row border-blue-500/30 flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label className="mr-2">Search:</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name..."
              className="bg-black/40 border border-white/20 rounded px-2 py-1 text-white"
            />
          </div>
          {isAdmin && (
            <div>
              <label className="mr-2">Filter by Ministry:</label>
              <NativeSelect
                value={filterMinistry}
                onChange={(e) => setFilterMinistry(e.target.value)}
              >
                {ministryOptions.map((m: any) => (
                  <NativeSelectOption
                    className="bg-stone-900 text-white"
                    key={m}
                    value={m}
                  >
                    {m}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          )}
          <div>
            <label className="mr-2">Filter by Session:</label>
            <NativeSelect
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
            >
              <NativeSelectOption
                className="bg-stone-900 text-white"
                value="ALL"
              >
                All
              </NativeSelectOption>
              <NativeSelectOption
                className="bg-stone-900 text-white"
                value="AM"
              >
                AM
              </NativeSelectOption>
              <NativeSelectOption
                className="bg-stone-900 text-white"
                value="PM"
              >
                PM
              </NativeSelectOption>
            </NativeSelect>
          </div>

          <div>
            <label className="mr-2">Sort by Last Name:</label>
            <NativeSelect
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            >
              <NativeSelectOption
                className="bg-stone-900 text-white"
                value="asc"
              >
                Ascending
              </NativeSelectOption>
              <NativeSelectOption
                className="bg-stone-900 text-white"
                value="desc"
              >
                Descending
              </NativeSelectOption>
            </NativeSelect>
          </div>
        </Card>
        {/* TABLE */}
        <Card className="m-6 p-6 bg-blue-500/10 border border-blue-500/30">
          <CardHeader>
            <CardTitle>Volunteers Attendance</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left">Volunteer</th>
                    <th className="px-6 py-4 text-left">Response</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Session</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedAttendance.map((row: any) => {
                    const sessionRecord = row.AM || row.PM;
                    const key = `${sessionRecord.id}-${sessionRecord.session}`;
                    const edited = editedRows[key] || {};

                    let displayStatus: VolunteerAttendance["status"] =
                      "PENDING";
                    const response = edited.response ?? sessionRecord.response;
                    if (response === "CAN_ATTEND") displayStatus = "CONFIRMED";
                    else if (response === "NO_RESPONSE")
                      displayStatus = "PENDING";

                    const showSession = response === "CAN_ATTEND";
                    const hasChanges = Object.keys(edited).length > 0;

                    return (
                      <tr key={row.volunteer.id}>
                        {/* NAME */}
                        <td className="px-6 py-4 font-medium">
                          {row.volunteer.firstName} {row.volunteer.lastName}
                        </td>

                        {/* RESPONSE */}
                        <td className="px-6 py-4">
                          <NativeSelect
                            value={response}
                            disabled={loadingKey === key}
                            onChange={(e) =>
                              handleChange(
                                sessionRecord.id,
                                sessionRecord.session,
                                "response",
                                e.target.value,
                              )
                            }
                            className="bg-transparent"
                          >
                            <NativeSelectOption
                              className="bg-stone-800 text-white"
                              value="NO_RESPONSE"
                            >
                              No Response
                            </NativeSelectOption>
                            <NativeSelectOption
                              value="CAN_ATTEND"
                              className="bg-stone-800 text-white"
                            >
                              Can Attend
                            </NativeSelectOption>
                            <NativeSelectOption
                              value="CANT_ATTEND"
                              className="bg-stone-800 text-white"
                            >
                              Can't Attend
                            </NativeSelectOption>
                            <NativeSelectOption
                              value="EXCUSE"
                              className="bg-stone-800 text-white"
                            >
                              Excuse
                            </NativeSelectOption>
                            <NativeSelectOption
                              value="ON_LEAVE"
                              className="bg-stone-800 text-white"
                            >
                              On Leave
                            </NativeSelectOption>
                          </NativeSelect>
                        </td>

                        {/* STATUS (auto) */}
                        <td className="px-6 py-4">{displayStatus}</td>

                        {/* SESSION (only if CAN_ATTEND) */}
                        <td className="px-6 py-4">
                          {showSession ? (
                            <NativeSelect
                              value={edited.session ?? sessionRecord.session}
                              onChange={(e) =>
                                handleChange(
                                  sessionRecord.id,
                                  sessionRecord.session,
                                  "session",
                                  e.target.value,
                                )
                              }
                            >
                              <NativeSelectOption
                                value="AM"
                                className="bg-stone-800 text-white"
                              >
                                AM
                              </NativeSelectOption>
                              <NativeSelectOption
                                value="PM"
                                className="bg-stone-800 text-white"
                              >
                                PM
                              </NativeSelectOption>
                            </NativeSelect>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>

                        {/* ACTION BUTTON */}
                        <td className="px-6 py-4">
                          <Button
                            disabled={!hasChanges || loadingKey === key}
                            onClick={() =>
                              handleSave(
                                sessionRecord.id,
                                sessionRecord.session,
                              )
                            }
                            className={
                              hasChanges && loadingKey !== key
                                ? "bg-green-600 hover:bg-green-700 flex items-center gap-2"
                                : "bg-gray-600 cursor-not-allowed flex items-center gap-2"
                            }
                          >
                            {loadingKey === key && (
                              <Loader2 className="animate-spin" size={16} />
                            )}
                            {loadingKey === key ? "Saving..." : "Save"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>

              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
