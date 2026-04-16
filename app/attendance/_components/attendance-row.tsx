"use client";

import React from "react";
import { AttendanceCell } from "./attendance-cell";
import { VolunteerWithAttendance } from "@/app/services/attendance";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

type Props = {
  member: VolunteerWithAttendance;
  today: number;
  isCurrentMonth: boolean;
  incrementDay: (id: number, index: number) => void;
  resetDay: (id: number, index: number) => void;
  updateMonthlyMeeting: (id: number, value: "P" | "E" | "A") => void;
};

export const AttendanceRow = React.memo(
  ({
    member,
    today,
    isCurrentMonth,
    incrementDay,
    resetDay,
    updateMonthlyMeeting,
  }: Props) => {
    const monthlyValue =
      member.monthlyMeeting === "P" || member.monthlyMeeting === "E" ? 1 : 0;

    const total = member.days.reduce((a, b) => a + b, 0) + monthlyValue;

    return (
      <tr className="border-b border-gray-700">
        {/* Name */}
        <td className="sticky left-0 bg-neutral-900 px-2 py-1 max-w-[180px]">
          <div className="truncate font-medium">
            {member.firstName} {member.lastName}
          </div>
        </td>

        {/* Monthly Meeting Dropdown */}
        <td className="text-center">
          <NativeSelect
            value={member.monthlyMeeting}
            onChange={(e) =>
              updateMonthlyMeeting(member.id, e.target.value as "P" | "E" | "A")
            }
            className={`text-sm font-semibold
              ${
                member.monthlyMeeting === "P"
                  ? "text-green-400"
                  : member.monthlyMeeting === "E"
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
          >
            <NativeSelectOption value="P">P</NativeSelectOption>
            <NativeSelectOption value="E">E</NativeSelectOption>
            <NativeSelectOption value="A">A</NativeSelectOption>
          </NativeSelect>
        </td>

        {/* Days */}
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
