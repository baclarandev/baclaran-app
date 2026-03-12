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
import { Volunteer } from "@/lib/data";

interface VolunteerAttendance {
  id: number;
  volunteer: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
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
    Record<number, Partial<VolunteerAttendance>>
  >({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    data: event,
    isLoading,
    isError,
    refetch,
  } = useEventById(numericEventId);

  const updateAttendance = useUpdateAttendance(numericEventId);
  const volunteerWithResponse =
    event?.volunteers.map((ev: any) => {
      const attendanceRecord = event.attendance?.find(
        (a: any) => a.volunteerId === ev.volunteerId,
      );

      return {
        id: attendanceRecord?.id ?? 0,
        volunteer: {
          id: ev.volunteer.id,
          firstName: ev.volunteer.firstName,
          lastName: ev.volunteer.lastName,
        },
        status: attendanceRecord?.status ?? "PENDING",
        response: attendanceRecord?.response ?? "NO_RESPONSE",
        session: attendanceRecord?.session ?? "AM",
      };
    }) || [];

  const totalPages = Math.ceil(volunteerWithResponse.length / pageSize);

  const paginatedAttendance = volunteerWithResponse.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const [timeLeft, setTimeLeft] = useState("");

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

  /* =========================
      UPDATE ATTENDANCE
  ========================= */

  const handleUpdate = (
    id: number,
    field: keyof VolunteerAttendance,
    value: any,
  ) => {
    updateAttendance.mutate(
      {
        attendanceId: id,
        [field]: value,
      },
      {
        onSuccess: () => {
          toast.success("Attendance updated");
          refetch();
        },
        onError: () => {
          toast.error("Update failed");
        },
      },
    );
  };
  const handleChange = (
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

    if (!changes) {
      toast.info("No changes to save");
      return;
    }

    updateAttendance.mutate(
      {
        attendanceId: id,
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
  /* =========================
      PRINT SHEET
  ========================= */

  const handlePrint = () => {
    if (!event) return;

    const attendees = event.attendance.filter(
      (a: VolunteerAttendance) => a.response === "CAN_ATTEND",
    );

    // GROUP BY MINISTRY
    const grouped: Record<string, VolunteerAttendance[]> = {};

    attendees.forEach((a: any) => {
      const ministry = a.volunteer.ministry?.name || "No Ministry";

      if (!grouped[ministry]) {
        grouped[ministry] = [];
      }

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
</tr>`,
        )
        .join("");

      const pmRows = pm
        .map(
          (v, i) => `
<tr>
<td>${i + 1}</td>
<td>${v.volunteer.firstName} ${v.volunteer.lastName}</td>
<td></td>
</tr>`,
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

body{
font-family:Arial;
padding:30px;
}

.header{
text-align:center;
margin-bottom:20px;
}

.header h1{
font-size:26px;
margin:0;
}

.header h2{
font-size:20px;
margin:5px 0;
}

table{
width:100%;
border-collapse:collapse;
margin-top:10px;
}

th,td{
border:1px solid black;
padding:12px;
font-size:16px;
}

th{
background:#eee;
}

td:nth-child(1){
width:60px;
text-align:center;
}

td:nth-child(3){
width:300px;
}

.page-break{
page-break-before:always;
}

</style>

</head>

<body>

${content}

</body>
</html>
`);

    printWindow!.document.close();
    printWindow!.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full text-white">
        <Sidebar
          user={user}
          isOpen={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col md:ml-64">
          <Header
            user={user}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />{" "}
          <div className="m-6 p-6 bg-blue-500/10 border border-blue-500/30 backdrop-blur-md">
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
    <div className="min-h-screen w-full text-white">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* EVENT CARD */}

        <Card className="mb-6 m-6 p-6 bg-blue-500/10 border border-blue-500/30 backdrop-blur-md">
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>
                <Calendar className="inline w-5 h-5 mr-2" />
                {event.title}
              </CardTitle>

              <div className="mt-2 text-sm text-blue-300 bg-blue-800/20 px-3 py-1 rounded-full inline-block">
                {timeLeft}
              </div>
            </div>
            {user.role === "ADMIN" && (
              <Button className="bg-blue-500" onClick={handlePrint}>
                <Printer size={16} />
                Print Sheet
              </Button>
            )}
          </CardHeader>
        </Card>

        {/* ATTENDANCE TABLE */}

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
                    <th className="py-3 px-6 text-left">Response</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">Session</th>
                    <th className="py-3 px-6 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedAttendance.map((a: any) => (
                    <tr key={a.id} className="border-t border-white/10">
                      <td className="py-4 px-6">
                        {a.volunteer.firstName} {a.volunteer.lastName}
                      </td>

                      <td className="py-4  px-6">
                        <NativeSelect
                          value={editedRows[a.id]?.status ?? a.status}
                          onChange={(e) =>
                            handleChange(a.id, "status", e.target.value)
                          }
                        >
                          <NativeSelectOption value="PENDING">
                            Pending
                          </NativeSelectOption>
                          <NativeSelectOption value="CONFIRMED">
                            Confirmed
                          </NativeSelectOption>
                          <NativeSelectOption value="CHECKED_IN">
                            Checked In
                          </NativeSelectOption>
                          <NativeSelectOption value="ABSENT">
                            Absent
                          </NativeSelectOption>
                        </NativeSelect>
                      </td>

                      <td className="py-4 px-6">
                        <NativeSelect
                          value={editedRows[a.id]?.response ?? a.response}
                          onChange={(e) =>
                            handleChange(a.id, "response", e.target.value)
                          }
                        >
                          <NativeSelectOption value="CAN_ATTEND">
                            Can Attend
                          </NativeSelectOption>
                          <NativeSelectOption value="CANT_ATTEND">
                            Can't Attend
                          </NativeSelectOption>
                          <NativeSelectOption value="ON_LEAVE">
                            On Leave
                          </NativeSelectOption>
                          <NativeSelectOption value="EXCUSE">
                            Excuse
                          </NativeSelectOption>
                          <NativeSelectOption value="NO_RESPONSE">
                            No Response
                          </NativeSelectOption>
                        </NativeSelect>
                      </td>
                      <td className="py-4 px-6">
                        {a.status === "CONFIRMED" &&
                        a.response === "CAN_ATTEND" ? (
                          <NativeSelect
                            value={editedRows[a.id]?.session ?? a.session}
                            onChange={(e) =>
                              handleChange(a.id, "session", e.target.value)
                            }
                          >
                            <NativeSelectOption value="AM">
                              AM
                            </NativeSelectOption>
                            <NativeSelectOption value="PM">
                              PM
                            </NativeSelectOption>
                          </NativeSelect>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          size="sm"
                          onClick={() => handleSave(a.id)}
                          disabled={!editedRows[a.id]}
                          className="bg-blue-500"
                        >
                          Save
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div className="flex justify-between mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-gray-700 rounded disabled:opacity-40"
              >
                Previous
              </button>

              <span>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
