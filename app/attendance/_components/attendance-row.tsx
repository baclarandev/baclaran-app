"use client";

import React from "react";
import { AttendanceCell } from "./attendance-cell";
import { VolunteerWithAttendance } from "@/app/services/attendance";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
export type MeetingStatus = "PRESENT" | "EXCUSED" | "ABSENT";
type Props = {
  member: VolunteerWithAttendance;

  selectedMonth?: number;
  selectedYear?: number;

  today: number;
  isCurrentMonth: boolean;

  updateMonthlyMeeting: (id: number, value: MeetingStatus) => void;
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

  const isMonthlyPresent = member.monthlyMeeting === "PRESENT";

  const handleMonthlyChange = (value: MeetingStatus) => {
    updateMonthlyMeeting(member.id, value);
  };

  // Total services for this volunteer (whole month)
  const monthlyMeetingCount =
    member.monthlyMeeting === "PRESENT" || member.monthlyMeeting === "EXCUSED"
      ? 1
      : 0;

  const total =
    member.days.reduce((acc, d) => acc + (d.services?.length ?? 0), 0) +
    monthlyMeetingCount;

  return (
    <tr className="border-b border-neutral-700 hover:bg-neutral-800/50">
      {/* NAME */}
      <td className="sticky z-100 bg-blue-700 left-0  px-4 py-3 max-w-45">
        <div className="truncate font-medium text-gray-100">
          {member.firstName} {member.lastName}
        </div>
      </td>

      {/* MONTHLY */}
      <td className="text-center px-4 py-3">
        <NativeSelect
          value={member.monthlyMeeting ?? "ABSENT"}
          onChange={(e) =>
            handleMonthlyChange(
              e.target.value as "PRESENT" | "EXCUSED" | "ABSENT",
            )
          }
          disabled={false}
          className="bg-blue-500/20"
        >
          <NativeSelectOption
            value="PRESENT"
            className="bg-blue-500 text-white"
          >
            Present
          </NativeSelectOption>
          <NativeSelectOption
            value="EXCUSED"
            className="bg-green-500 text-white"
          >
            Excused
          </NativeSelectOption>
          <NativeSelectOption value="ABSENT" className="bg-red-500 text-white">
            Absent
          </NativeSelectOption>
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
