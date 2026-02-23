"use client";

import React from "react";
import { AttendanceCell } from "./attendance-cell";
import { VolunteerWithAttendance } from "@/app/services/attendance";

type Props = {
  member: VolunteerWithAttendance;
  today: number;
  isCurrentMonth: boolean;
  incrementDay: (id: number, index: number) => void;
  resetDay: (id: number, index: number) => void;
  toggleMonthlyMeeting: (id: number) => void;
};

export const AttendanceRow = React.memo(
  ({
    member,
    today,
    isCurrentMonth,
    incrementDay,
    resetDay,
    toggleMonthlyMeeting,
  }: Props) => {
    const total =
      member.days.reduce((a, b) => a + b, 0) + (member.monthlyMeeting ? 1 : 0);

    return (
      <tr className="border-b border-gray-700">
        {/* NAME (TRUNCATED) */}
        <td className="sticky left-0 bg-neutral-900 px-2 py-1 max-w-[180px]">
          <div className="truncate font-medium">
            {member.firstName} {member.lastName}
          </div>
        </td>

        {/* MONTHLY */}
        <td className="text-center">
          <button
            onClick={() => toggleMonthlyMeeting(member.id)}
            className="w-6 h-6 rounded bg-blue-500 text-white"
          >
            {member.monthlyMeeting ? 1 : 0}
          </button>
        </td>

        {/* DAYS */}
        {member.days.map((day, index) => {
          const isPast = isCurrentMonth && index + 1 < today;
          const isToday = isCurrentMonth && index + 1 === today;

          return (
            <td key={index} className="text-center">
              <AttendanceCell
                value={day}
                isPast={isPast}
                isToday={isToday}
                onIncrement={() => incrementDay(member.id, index)}
                onReset={() => resetDay(member.id, index)}
              />
            </td>
          );
        })}

        <td className="text-center font-semibold">{total}</td>
      </tr>
    );
  },
);
