"use client";

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
    return (
      <button
        disabled={isPast}
        onClick={() => !isPast && onIncrement()}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!isPast) onReset();
        }}
        className={`w-6 h-6 rounded ${
          value
            ? "bg-green-500 text-white"
            : isToday
            ? "bg-yellow-500 text-black"
            : isPast
            ? "bg-neutral-600 text-gray-400 cursor-not-allowed"
            : "bg-neutral-700 text-gray-200"
        }`}
      >
        {value}
      </button>
    );
  }
);