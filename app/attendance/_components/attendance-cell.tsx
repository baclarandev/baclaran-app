"use client";
import { VolunteerWithAttendance } from "@/app/services/attendance";
import React, { useState } from "react";

type Props = {
  isPast: boolean;
  isToday: boolean;
  onOpenModal: () => void;
  timeIn?: Date | null;
  timeOut?: Date | null;
  presentCount?: number;
};

export const AttendanceCell = React.memo(
  ({
    isPast,
    isToday,
    onOpenModal,
    timeIn,
    timeOut,
    presentCount = 0,
  }: Props) => {
    const getStatusIndicator = () => {
      if (presentCount > 0) {
        return presentCount.toString(); // Show the number of times served
      }
      return "";
    };

    const getButtonColor = () => {
      if (presentCount > 0) {
        return "bg-green-500 text-white"; // Times recorded
      } else if (isToday) {
        return "bg-yellow-500 text-black"; // Today but no time
      } else if (isPast) {
        return "bg-neutral-600 text-gray-400 cursor-not-allowed"; // Past date
      }
      return "bg-neutral-700 text-gray-200 hover:bg-neutral-600"; // Future date
    };

    return (
      <button
        onClick={onOpenModal}
        disabled={isPast}
        className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors
          ${getButtonColor()}
          ${!isPast ? "cursor-pointer" : ""}
        `}
        title={
          timeIn || timeOut
            ? `In: ${timeIn ? new Date(timeIn).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"} | Out: ${timeOut ? new Date(timeOut).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}`
            : "Click to record attendance"
        }
      >
        {getStatusIndicator() || "○"}
      </button>
    );
  },
);

AttendanceCell.displayName = "AttendanceCell";
