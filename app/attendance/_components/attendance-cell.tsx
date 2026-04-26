"use client";
import React from "react";
import { Eye } from "lucide-react";

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
    const getButtonColor = () => {
      if (presentCount > 0) return "bg-green-500 text-white";
      if (isToday) return "bg-yellow-500 text-black";
      if (isPast) return "bg-neutral-600 text-gray-300";
      return "bg-neutral-700 text-gray-200 hover:bg-neutral-600";
    };

    return (
      <div className="relative group inline-flex">
        {/* MAIN CELL (NEVER HIDDEN) */}
        <button
          onClick={onOpenModal}
          className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${getButtonColor()}`}
          title="View attendance"
        >
          {presentCount > 0 ? presentCount : <span className="text-xs">0</span>}
        </button>

        {/* HOVER ACTION ONLY (DOES NOT COVER CONTENT) */}
        <button
          onClick={onOpenModal}
          className="
            absolute inset-0 
            opacity-0 group-hover:opacity-100
            flex items-center justify-center
            bg-black/40 rounded-md
            transition
          "
        >
          <div className="flex flex-col items-center text-white">
            <Eye className="w-4 h-4" />
            <span className="text-[10px]">View</span>
          </div>
        </button>
      </div>
    );
  },
);

AttendanceCell.displayName = "AttendanceCell";
