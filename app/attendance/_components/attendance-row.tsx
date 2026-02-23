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
        {/* Name */}
        <td className="sticky left-0 bg-neutral-900 print-bg-none px-2 py-1 max-w-[180px]">
          <div className="truncate font-medium">
            {member.firstName} {member.lastName}
          </div>
        </td>

        {/* Monthly meeting */}
        <td className="text-center">
          <button
            onClick={() => toggleMonthlyMeeting(member.id)}
            className="w-8 h-8 rounded-md bg-blue-500 text-white text-base font-medium"
          >
            {member.monthlyMeeting ? 1 : 0}
          </button>
        </td>

        {/* Attendance days */}
        {member.days.map((day, index) => {
          const isPast = isCurrentMonth && index + 1 < today;
          const isToday = isCurrentMonth && index + 1 === today;

          return (
            <td key={index} className="text-center p-1">
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

        {/* Total */}
        <td className="text-center font-semibold text-lg">{total}</td>
      </tr>
    );
  },
);
