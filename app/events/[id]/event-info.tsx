"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Calendar, Printer } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useEventById, useUpdateAttendance } from "@/app/services/event";
import { EventSkeletonGrid } from "../_components/event-skeleton-grid";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const pageSize = 10;

  const {
    data: event,
    isLoading,
    isError,
    refetch,
  } = useEventById(numericEventId);

  const updateAttendance = useUpdateAttendance(numericEventId);
  const ministryOptions = useMemo(() => {
    const ministries = new Set(
      event?.volunteers
        .map((v: any) => v.volunteer.ministry?.name)
        .filter(Boolean),
    );
    return ["ALL", ...Array.from(ministries)]; // add ALL option
  }, [event]);
  /* =========================
     MERGE DATA (FIXED ID)
  ========================= */
  const volunteerWithResponse = event?.volunteers || [];

  const totalPages = Math.ceil(volunteerWithResponse.length / pageSize);

  const paginatedAttendance = volunteerWithResponse.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

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
      let label = "Starts in";

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
    id: number | string,
    field: keyof VolunteerAttendance,
    value: string,
  ) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value as any,
      },
    }));
  };

  const handleSave = (id: number | string) => {
    const changes = editedRows[id];

    if (!changes) {
      toast.info("No changes to save");
      return;
    }

    updateAttendance.mutate(
      {
        attendanceId: Number(id),
        ...changes,
      },
      {
        onSuccess: () => {
          toast.success("Attendance updated");

          setEditedRows((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });

          refetch();
        },
        onError: () => {
          toast.error("Update failed");
        },
      },
    );
  };
  const handlePrint = () => {
    if (!event) return;

    const attendees = volunteerWithResponse.filter(
      (a: any) => a.response === "CAN_ATTEND",
    );

    // GROUP BY MINISTRY
    const grouped: Record<string, VolunteerAttendance[]> = {};

    attendees.forEach((a: any) => {
      const ministry = a.volunteer.ministry?.name || "No Ministry";
      if (!grouped[ministry]) grouped[ministry] = [];
      grouped[ministry].push(a);
    });

    let content = "";

    Object.entries(grouped).forEach(([ministry, volunteers]) => {
      const am = volunteers.filter((v) => v.session === "AM");
      const pm = volunteers.filter((v) => v.session === "PM");

      const amRows = am
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

      const pmRows = pm
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

      content += `
      <div class="header">
        <h1>National Shrine of Perpetual Help</h1>
        <h2>${event.title}</h2>
        <h3>${ministry}</h3>
      </div>

      <h4>AM Session (${am.length})</h4>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Volunteer Name</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          ${amRows}
        </tbody>
      </table>

      <h4 style="margin-top:25px;">PM Session (${pm.length})</h4>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Volunteer Name</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          ${pmRows}
        </tbody>
      </table>

      <div class="page-break"></div>
    `;
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
          .header h1 { font-size: 26px; margin: 0; }
          .header h2 { font-size: 20px; margin: 5px 0; }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          th, td {
            border: 1px solid black;
            padding: 12px;
            font-size: 16px;
          }

          th { background: #eee; }

          td:nth-child(1) {
            width: 60px;
            text-align: center;
          }

          td:nth-child(3) {
            width: 300px;
          }

          .page-break {
            page-break-before: always;
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

            {user.role === "ADMIN" && (
              <Button
                onClick={handlePrint}
                className="bg-green-600 hover:bg-green-700"
              >
                <Printer size={16} /> Print
              </Button>
            )}
          </CardHeader>
        </Card>
        <Card className="m-6 p-6 bg-blue-500/10 border flex-row border-blue-500/30 flex flex-wrap gap-4 items-center">
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
                  {paginatedAttendance.map((a: any) => {
                    const edited = editedRows[a.id] || {};

                    const currentStatus = edited.status ?? a.status;
                    const currentResponse = edited.response ?? a.response;
                    const currentSession = edited.session ?? a.session;

                    const isEdited = !!editedRows[a.id];

                    return (
                      <tr
                        key={a.id}
                        className={`border-t border-white/10 transition ${
                          isEdited ? "bg-blue-500/10" : "hover:bg-white/5"
                        }`}
                      >
                        <td className="px-6 py-4 font-medium">
                          {a.volunteer.firstName} {a.volunteer.lastName}
                        </td>

                        {/* RESPONSE */}
                        <td className="px-6 py-4">
                          <NativeSelect
                            className="bg-black/40 border border-white/20 rounded px-2 py-1"
                            value={currentResponse}
                            onChange={(e) =>
                              handleChange(a.id, "response", e.target.value)
                            }
                          >
                            <NativeSelectOption
                              className="bg-stone-900 text-white"
                              value="CAN_ATTEND"
                            >
                              Can Attend
                            </NativeSelectOption>
                            <NativeSelectOption
                              className="bg-stone-900 text-white"
                              value="CANT_ATTEND"
                            >
                              Can't Attend
                            </NativeSelectOption>
                            <NativeSelectOption
                              className="bg-stone-900 text-white"
                              value="ON_LEAVE"
                            >
                              On Leave
                            </NativeSelectOption>
                            <NativeSelectOption
                              className="bg-stone-900 text-white"
                              value="EXCUSE"
                            >
                              Excuse
                            </NativeSelectOption>
                            <NativeSelectOption
                              className="bg-stone-900 text-white"
                              value="NO_RESPONSE"
                            >
                              No Response
                            </NativeSelectOption>
                          </NativeSelect>
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4">
                          <NativeSelect
                            className="bg-black/40 border border-white/20 rounded px-2 py-1"
                            value={currentStatus}
                            onChange={(e) =>
                              handleChange(a.id, "status", e.target.value)
                            }
                          >
                            <NativeSelectOption
                              className="bg-stone-900 text-white"
                              value="PENDING"
                            >
                              Pending
                            </NativeSelectOption>
                            <NativeSelectOption
                              className="bg-stone-900 text-white"
                              value="CONFIRMED"
                            >
                              Confirmed
                            </NativeSelectOption>
                            <NativeSelectOption
                              className="bg-stone-900 text-white"
                              value="CHECKED_IN"
                            >
                              Checked In
                            </NativeSelectOption>
                            <NativeSelectOption
                              className="bg-stone-900 text-white"
                              value="ABSENT"
                            >
                              Absent
                            </NativeSelectOption>
                          </NativeSelect>
                        </td>

                        {/* SESSION */}
                        <td className="px-6 py-4">
                          {currentStatus === "CONFIRMED" &&
                          currentResponse === "CAN_ATTEND" ? (
                            <NativeSelect
                              className="bg-black/40 border border-white/20 rounded px-2 py-1"
                              value={currentSession}
                              onChange={(e) =>
                                handleChange(a.id, "session", e.target.value)
                              }
                            >
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
                          ) : (
                            <span className="text-gray-500 italic text-xs">
                              Not applicable
                            </span>
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            onClick={() => handleSave(a.id)}
                            disabled={!isEdited}
                            className={`${
                              isEdited
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-gray-600 cursor-not-allowed"
                            }`}
                          >
                            Save
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
