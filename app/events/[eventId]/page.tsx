"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "lucide-react";

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

interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  attendance: VolunteerAttendance[];
}

// ---------------- API ----------------
const fetchEvent = async (id: string): Promise<Event> => {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
};

const updateAttendanceApi = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<VolunteerAttendance>;
}) => {
  const res = await fetch(`/api/attendance/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update attendance");
  return res.json();
};

// ---------------- Component ----------------
export default function EventAttendance({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  const queryClient = useQueryClient();

  // Fetch Event
  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEvent(eventId),
  });

  // Update Attendance
  const updateAttendanceMutation = useMutation({
    mutationFn: updateAttendanceApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["event", eventId] }),
  });

  const [attendanceList, setAttendanceList] = useState<VolunteerAttendance[]>(
    [],
  );

  useEffect(() => {
    if (event?.attendance) setAttendanceList(event.attendance);
  }, [event]);

  const handleUpdate = (
    id: number,
    field: keyof VolunteerAttendance,
    value: any,
  ) => {
    // Optimistic UI
    setAttendanceList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    );
    updateAttendanceMutation.mutate({ id, data: { [field]: value } });
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

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col md:ml-64 p-6">
      {/* Event Info */}
      <Card className="mb-6 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
        <CardHeader>
          <CardTitle>
            <Calendar className="inline w-5 h-5 mr-2" /> {event?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">{event?.description}</p>
          <p className="mt-2 text-sm text-gray-300">
            {`${new Date(event?.startDate ?? "").toLocaleString()} - ${new Date(
              event?.endDate ?? "",
            ).toLocaleString()}`}
          </p>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
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
                  <th className="py-3 px-6 text-left text-gray-400">Session</th>
                  <th className="py-3 px-6 text-left text-gray-400">Status</th>
                  <th className="py-3 px-6 text-left text-gray-400">
                    Response
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-white/6 hover:bg-gray-600 transition-colors"
                  >
                    <td className="py-4 px-6">
                      {a.volunteer.firstName} {a.volunteer.lastName}{" "}
                      {a.volunteer.email && (
                        <span className="text-gray-400 text-sm">
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
  );
}
