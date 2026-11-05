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
      <td className=" z-100 bg-transparent left-0  px-4 py-3 max-w-45">
        <div className="truncate font-medium text-white">
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
          className="bg-transparent text-white w-24"
        >
          <NativeSelectOption
            value="PRESENT"
            className="bg-transparent text-black"
          >
            Present
          </NativeSelectOption>
          <NativeSelectOption
            value="EXCUSED"
            className="bg-transparent text-black"
          >
            Excused
          </NativeSelectOption>
          <NativeSelectOption
            value="ABSENT"
            className="bg-transparent text-black"
          >
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
          <td key={index} className="text-center text-white p-2">
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
      <td className="sticky right-0 z-20 min-w-[80px] border-l border-neutral-700 bg-neutral-900 px-4 py-3 text-center font-semibold text-white">
        {total}
      </td>
    </tr>
  );
});

AttendanceRow.displayName = "AttendanceRow";
