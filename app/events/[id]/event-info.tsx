"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Calendar } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useEventById, useUpdateAttendance } from "@/app/services/event";
import { EventSkeletonGrid } from "../_components/event-skeleton-grid";
import { toast } from "sonner";

interface VolunteerAttendance {
  id: number;
  volunteer: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
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

  const { data: event, isLoading, isError } = useEventById(numericEventId);
  const updateAttendance = useUpdateAttendance(eventId);

  /* =========================
     COUNTDOWN
  ========================== */
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!event) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(event.startDate).getTime();
      const end = new Date(event.endDate).getTime();

      let targetTime = start;
      let label = "Starts in";

      if (now >= start && now <= end) {
        targetTime = end;
        label = "Ends in";
      } else if (now > end) {
        setTimeLeft("Event has ended");
        return;
      }

      const distance = targetTime - now;
      if (distance <= 0) {
        setTimeLeft("Event has ended");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${label}: ${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  /* =========================
     ROW EDITING STATE
  ========================== */
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
      {
        attendanceId: id,
        ...changes,
      },
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

  /* =========================
     COLORS
  ========================== */
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-800/20 text-yellow-300",
    CONFIRMED: "bg-blue-800/20 text-blue-300",
    CHECKED_IN: "bg-green-800/20 text-green-300",
    ABSENT: "bg-red-800/20 text-red-300",
  };

  const responseColors: Record<string, string> = {
    ON_LEAVE: "bg-gray-700/40 text-gray-300",
    EXCUSE: "bg-yellow-800/20 text-yellow-300",
    CAN_ATTEND: "bg-green-800/20 text-green-300",
    CANT_ATTEND: "bg-red-800/20 text-red-300",
    NO_RESPONSE: "bg-gray-600/30 text-gray-400",
  };

  /* =========================
     LOADING / ERROR
  ========================== */
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
      <div className="h-screen w-full flex items-center justify-center text-red-400">
        Failed to load event.
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================== */
  return (
    <div className="h-screen w-full text-white">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* EVENT INFO */}
        <Card className="mb-6 m-6 p-6 bg-blue-500/10 border border-blue-500/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle>
              <Calendar className="inline w-5 h-5 mr-2" />
              {event.title}
            </CardTitle>

            <div className="mt-2 text-sm font-medium text-blue-300 bg-blue-800/20 px-3 py-1 rounded-full inline-block">
              {timeLeft}
            </div>
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
                    <th className="py-3 px-6 text-left text-gray-400">
                      Volunteer
                    </th>
                    <th className="py-3 px-6 text-left text-gray-400">
                      Session
                    </th>
                    <th className="py-3 px-6 text-left text-gray-400">
                      Status
                    </th>
                    <th className="py-3 px-6 text-left text-gray-400">
                      Response
                    </th>
                    <th className="py-3 px-6 text-left text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {event.attendance?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-gray-400"
                      >
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    event.attendance.map((a: VolunteerAttendance) => {
                      const isEdited = !!editedRows[a.id];

                      return (
                        <tr
                          key={a.id}
                          className={`border-t border-white/10 hover:bg-gray-600 transition ${
                            isEdited ? "bg-blue-900/20" : ""
                          }`}
                        >
                          <td className="py-4 px-6">
                            {a.volunteer.firstName} {a.volunteer.lastName}
                          </td>

                          <td className="py-4 px-6">
                            <NativeSelect
                              value={editedRows[a.id]?.session ?? a.session}
                              disabled={savingRow === a.id}
                              onChange={(e) =>
                                handleFieldChange(
                                  a.id,
                                  "session",
                                  e.target.value,
                                )
                              }
                            >
                              <NativeSelectOption
                                className="bg-blue text-black"
                                value="AM"
                              >
                                AM
                              </NativeSelectOption>
                              <NativeSelectOption
                                className="bg-blue-500/20 text-black"
                                value="PM"
                              >
                                PM
                              </NativeSelectOption>
                            </NativeSelect>
                          </td>

                          <td className="py-4 px-6">
                            <NativeSelect
                              value={editedRows[a.id]?.status ?? a.status}
                              disabled={savingRow === a.id}
                              className={statusColors[a.status]}
                              onChange={(e) =>
                                handleFieldChange(
                                  a.id,
                                  "status",
                                  e.target.value,
                                )
                              }
                            >
                              {[
                                "PENDING",
                                "CONFIRMED",
                                "CHECKED_IN",
                                "ABSENT",
                              ].map((s) => (
                                <NativeSelectOption
                                  className="text-black bg-blue-500/20"
                                  key={s}
                                  value={s}
                                >
                                  {s.replace("_", " ")}
                                </NativeSelectOption>
                              ))}
                            </NativeSelect>
                          </td>

                          <td className="py-4 px-6">
                            <NativeSelect
                              value={editedRows[a.id]?.response ?? a.response}
                              disabled={savingRow === a.id}
                              className={`${responseColors[a.response]} bg-black`}
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
                                <NativeSelectOption key={r} value={r}>
                                  {r.replace("_", " ")}
                                </NativeSelectOption>
                              ))}
                            </NativeSelect>
                          </td>

                          <td className="py-4 px-6">
                            {isEdited ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSave(a.id)}
                                  disabled={savingRow === a.id}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-sm transition disabled:opacity-50"
                                >
                                  {savingRow === a.id ? "Saving..." : "Save"}
                                </button>

                                <button
                                  onClick={() => handleCancel(a.id)}
                                  disabled={savingRow === a.id}
                                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-md text-sm transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
