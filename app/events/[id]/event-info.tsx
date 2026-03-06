"use client";

import { useEffect, useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const numericEventId = Number(eventId);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: event, isLoading, isError } = useEventById(numericEventId);
  const updateAttendance = useUpdateAttendance(eventId);

  const [timeLeft, setTimeLeft] = useState("");
  const attendance = event?.attendance ?? [];

  const totalPages = Math.ceil(attendance.length / pageSize);

  const paginatedAttendance = attendance.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  useEffect(() => {
    if (!event) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
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

  const [editedRows, setEditedRows] = useState<
    Record<number, Partial<VolunteerAttendance>>
  >({});
  const [savingRow, setSavingRow] = useState<number | null>(null);

  const handleFieldChange = (
    id: number,
    field: keyof VolunteerAttendance,
    value: any,
  ) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = (id: number) => {
    const changes = editedRows[id];
    if (!changes) return;

    setSavingRow(id);

    updateAttendance.mutate(
      { attendanceId: id, ...changes },
      {
        onSuccess: () => {
          toast("Attendance updated");

          setEditedRows((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });

          setSavingRow(null);
        },
        onError: () => {
          toast("Update failed");
          setSavingRow(null);
        },
      },
    );
  };

  const handleCancel = (id: number) => {
    setEditedRows((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  /* ======================
     PRINT FUNCTION
  ====================== */

  const handlePrint = () => {
    if (!event) return;

    const attendees = event.attendance.filter(
      (a: VolunteerAttendance) => a.response === "CAN_ATTEND",
    );

    const printWindow = window.open("", "", "width=900,height=700");

    const rows = attendees
      .map(
        (a: VolunteerAttendance, i: number) => `
        <tr>
          <td>${i + 1}</td>
          <td>${a.volunteer.firstName} ${a.volunteer.lastName}</td>
          <td></td>
        </tr>
      `,
      )
      .join("");

    printWindow!.document.write(`
<html>
<head>
<title>Attendance Sheet</title>

<style>
body{
font-family: Arial;
padding:30px;
}

.header{
text-align:center;
margin-bottom:25px;
}

.header h1{
font-size:28px;
font-weight:bold;
margin:0;
}

.header h2{
font-size:22px;
margin-top:4px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:25px;
}

th,td{
border:1px solid black;
padding:14px;
font-size:18px;
}

th{
background:#eee;
}

td:nth-child(1){
width:60px;
text-align:center;
}

td:nth-child(3){
width:320px;
}

.footer{
margin-top:40px;
font-size:14px;
}

@page{
margin:20mm;
}

@media print{
body{
margin:0;
}

table{
page-break-inside:auto;
}

tr{
page-break-inside:avoid;
page-break-after:auto;
}
}
</style>

</head>

<body>

<div class="header">
<h1>National Shrine of Perpetual Help</h1>
<h2>${event.title}</h2>
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
${rows}
</tbody>

</table>

<div class="footer">
<p>Prepared by: _______________________</p>
<p>Date: _______________________</p>
</div>

</body>
</html>
`);

    printWindow!.document.close();
    printWindow!.focus();
    printWindow!.print();
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full text-white">
        <Sidebar
          user={user}
          isOpen={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col md:ml-64">
          <Header
            user={user}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className="flex-1 p-6">
            <EventSkeletonGrid />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400">
        Failed to load event
      </div>
    );
  }

  return (
    <div className="h-screen w-full text-white">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* EVENT INFO */}

        <Card className="mb-6 m-6 p-6 bg-blue-500/10 border border-blue-500/30 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                <Calendar className="inline w-5 h-5 mr-2" />
                {event.title}
              </CardTitle>

              <div className="mt-2 text-sm text-blue-300 bg-blue-800/20 px-3 py-1 rounded-full inline-block">
                {timeLeft}
              </div>
            </div>

            <Button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition"
            >
              <Printer size={16} />
              Print Sheet
            </Button>
          </CardHeader>
        </Card>

        {/* TABLE */}

        <Card className="bg-blue-500/10 m-6 p-6 border border-blue-500/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Volunteers Attendance</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="py-3 px-6 text-left">Volunteer</th>
                    <th className="py-3 px-6 text-left">Session</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">Response</th>
                    <th className="py-3 px-6 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedAttendance.map((a: VolunteerAttendance) => {
                    const isEdited = !!editedRows[a.id];
                    const responseValue =
                      editedRows[a.id]?.response ?? a.response;
                    const statusValue = editedRows[a.id]?.status ?? a.status;
                    const sessionValue = editedRows[a.id]?.session ?? a.session;

                    // Show session only if Response is CAN_ATTEND and Status is CONFIRMED
                    const showSession =
                      responseValue === "CAN_ATTEND" &&
                      statusValue === "CONFIRMED";

                    return (
                      <tr
                        key={a.id}
                        className={`border-t border-white/10 ${isEdited ? "bg-blue-900/20" : ""}`}
                      >
                        {/* Volunteer Name */}
                        <td className="py-4 px-6">
                          {a.volunteer.firstName} {a.volunteer.lastName}
                        </td>

                        {/* Response */}
                        <td className="py-4 px-6">
                          <NativeSelect
                            value={responseValue}
                            onChange={(e) =>
                              handleFieldChange(
                                a.id,
                                "response",
                                e.target.value,
                              )
                            }
                          >
                            {[
                              "ON_LEAVE",
                              "EXCUSE",
                              "CAN_ATTEND",
                              "CANT_ATTEND",
                              "NO_RESPONSE",
                            ].map((r) => (
                              <NativeSelectOption
                                key={r}
                                value={r}
                                className="bg-blue-500/20 text-black"
                              >
                                {r.replace("_", " ")}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <NativeSelect
                            value={statusValue}
                            onChange={(e) =>
                              handleFieldChange(a.id, "status", e.target.value)
                            }
                          >
                            {[
                              "PENDING",
                              "CONFIRMED",
                              "CHECKED_IN",
                              "ABSENT",
                            ].map((s) => (
                              <NativeSelectOption
                                key={s}
                                value={s}
                                className="bg-blue-500/20 text-black"
                              >
                                {s}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                        </td>

                        {/* Session (conditionally visible) */}
                        <td className="py-4 px-6">
                          {showSession ? (
                            <NativeSelect
                              value={sessionValue}
                              onChange={(e) =>
                                handleFieldChange(
                                  a.id,
                                  "session",
                                  e.target.value,
                                )
                              }
                            >
                              <NativeSelectOption
                                value="AM"
                                className="bg-blue-500/20 text-black"
                              >
                                AM
                              </NativeSelectOption>
                              <NativeSelectOption
                                value="PM"
                                className="bg-blue-500/20 text-black"
                              >
                                PM
                              </NativeSelectOption>
                            </NativeSelect>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6">
                          {isEdited ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSave(a.id)}
                                className="px-3 py-1 bg-blue-600 rounded-md"
                              >
                                Save
                              </button>

                              <button
                                onClick={() => handleCancel(a.id)}
                                className="px-3 py-1 bg-gray-600 rounded-md"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-gray-300">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
