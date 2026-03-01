"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Calendar } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useEventById, useUpdateAttendance } from "@/app/services/event";

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
  // In event-info.tsx, at the top of your component:
  const numericEventId = Number(eventId);
  console.log("[v0] eventId prop:", eventId);
  console.log("[v0] numericEventId:", numericEventId);
  console.log("[v0] is NaN:", isNaN(numericEventId));

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useEventById(numericEventId);

  console.log("[v0] useEventById called with:", numericEventId);
  console.log("[v0] event data:", event);
  console.log("[v0] isLoading:", isLoading);
  console.log("[v0] isError:", isError);
  console.log("[v0] error:", error);
  const handleUpdate = (
    id: number,
    field: keyof VolunteerAttendance,
    value: any,
  ) => {
    if (!event) return;

    // Optimistically update cache
    const updatedAttendance = event.attendance.map((a: any) =>
      a.id === id ? { ...a, [field]: value } : a,
    );

    // Update cache immediately
    updateAttendance.mutate(
      { id, [field]: value },
      {
        // onMutate: async () => {
        //   // Cancel any outgoing refetches
        // },
      },
    );

    // Update local cache
    event.attendance = updatedAttendance;
  };

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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="h-screen w-full">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <Card className="mb-6 m-6 p-6 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
          <CardHeader>
            <CardTitle>
              <Calendar className="inline w-5 h-5 mr-2" /> {event?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">{event?.description}</p>
            <p className="mt-2 text-sm text-gray-300">
              {`${new Date(event?.startDate).toLocaleString()} - ${new Date(event?.endDate).toLocaleString()}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 m-6 p-6 border border-blue-500/30 text-white backdrop-blur-md">
          <CardHeader>
            <CardTitle>Volunteers Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
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
                  </tr>
                </thead>
                <tbody>
                  {event?.attendance.map((a: any) => (
                    <tr
                      key={a.id}
                      className="border-t border-white/6 hover:bg-gray-600 transition-colors"
                    >
                      <td className="py-4 px-6">
                        {a.volunteer.firstName} {a.volunteer.lastName}
                        {a.volunteer.email && (
                          <span className="text-gray-400 text-sm">
                            {" "}
                            ({a.volunteer.email})
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <NativeSelect
                          value={a.session}
                          onChange={(e) =>
                            handleUpdate(
                              a.id,
                              "session",
                              e.target.value as "AM" | "PM",
                            )
                          }
                        >
                          <NativeSelectOption value="AM">AM</NativeSelectOption>
                          <NativeSelectOption value="PM">PM</NativeSelectOption>
                        </NativeSelect>
                      </td>
                      <td className="py-4 px-6">
                        <NativeSelect
                          value={a.status}
                          className={statusColors[a.status]}
                          onChange={(e) =>
                            handleUpdate(
                              a.id,
                              "status",
                              e.target.value as VolunteerAttendance["status"],
                            )
                          }
                        >
                          {["PENDING", "CONFIRMED", "CHECKED_IN", "ABSENT"].map(
                            (s) => (
                              <NativeSelectOption key={s} value={s}>
                                {s.replace("_", " ")}
                              </NativeSelectOption>
                            ),
                          )}
                        </NativeSelect>
                      </td>
                      <td className="py-4 px-6">
                        <NativeSelect
                          value={a.response}
                          className={responseColors[a.response]}
                          onChange={(e) =>
                            handleUpdate(
                              a.id,
                              "response",
                              e.target.value as VolunteerAttendance["response"],
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
