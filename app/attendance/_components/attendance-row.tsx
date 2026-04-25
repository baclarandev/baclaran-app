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

  selectedMonth?: number;
  selectedYear?: number;

  today: number;
  isCurrentMonth: boolean;

  updateMonthlyMeeting: (id: number, value: "P" | "E" | "A") => void;
  onOpenModal: (member: VolunteerWithAttendance, index: number) => void;
};

export const AttendanceRow = React.memo((props: Props) => {
  const {
    member,

    today,
    isCurrentMonth,
    updateMonthlyMeeting,
    onOpenModal,
  } = props;

  const isMonthlyPresent = member.monthlyMeeting === "P";

  const handleMonthlyChange = (value: "P" | "E" | "A") => {
    updateMonthlyMeeting(member.id, value);
  };

  // Total services for this volunteer (whole month)
  const total = member.days.reduce(
    (acc, d) => acc + (d.services?.length ?? 0),
    0,
  );

  return (
    <tr className="border-b border-neutral-700 hover:bg-neutral-800/50">
      {/* NAME */}
      <td className="sticky left-0 bg-neutral-900 px-4 py-3 max-w-[180px]">
        <div className="truncate font-medium text-gray-100">
          {member.firstName} {member.lastName}
        </div>
      </td>

      {/* MONTHLY */}
      <td className="text-center px-4 py-3">
        <NativeSelect
          value={member.monthlyMeeting}
          onChange={(e) =>
            handleMonthlyChange(e.target.value as "P" | "E" | "A")
          }
          disabled={isMonthlyPresent}
        >
          <NativeSelectOption value="P">Present</NativeSelectOption>
          <NativeSelectOption value="E">Excused</NativeSelectOption>
          <NativeSelectOption value="A">Absent</NativeSelectOption>
        </NativeSelect>
      </td>

      {/* DAYS */}
      {member.days.map((_, index) => {
        const dayNumber = index + 1;

        const isPast = isCurrentMonth && dayNumber < today;
        const isToday = isCurrentMonth && dayNumber === today;
        const dayData = member.days[index];

        const servicesForDay = dayData?.services ?? [];

        const presentCount = servicesForDay.length;

        const latestService =
          servicesForDay.length > 0
            ? servicesForDay[servicesForDay.length - 1]
            : null;
        return (
          <td key={index} className="text-center p-2">
            <AttendanceCell
              isPast={isPast}
              isToday={isToday}
              timeIn={
                latestService?.timeIn ? new Date(latestService.timeIn) : null
              }
              timeOut={
                latestService?.timeOut ? new Date(latestService.timeOut) : null
              }
              presentCount={presentCount}
              onOpenModal={() => onOpenModal(member, index)}
            />
          </td>
        );
      })}

      {/* TOTAL */}
      <td className="text-center font-semibold text-lg px-4 py-3">{total}</td>
    </tr>
  );
});

AttendanceRow.displayName = "AttendanceRow";
