"use client";
import { useLongPress } from "@/app/hooks/useLongPress";
import React from "react";

type Props = {
  value: number;
  isPast: boolean;
  isToday: boolean;
  onIncrement: () => void;
  onReset: () => void;
};

export const AttendanceCell = React.memo(
  ({ value, isPast, isToday, onIncrement, onReset }: Props) => {
    const longPressEvents = useLongPress(onReset, 500); // 500ms for reset

    return (
      <button
        disabled={isPast}
        onClick={() => !isPast && onIncrement()}
        {...longPressEvents}
        className={`w-8 h-8 rounded-md flex items-center justify-center text-base font-medium
          ${
            value
              ? "bg-green-500 text-white"
              : isToday
                ? "bg-yellow-500 text-black"
                : isPast
                  ? "bg-neutral-600 text-gray-400 cursor-not-allowed"
                  : "bg-neutral-700 text-gray-200"
          }
        `}
      >
        {value}
      </button>
    );
  },
);
