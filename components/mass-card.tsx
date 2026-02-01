"use client";

import { Badge } from "@/components/ui/badge";
import { Check, Clock, Users } from "lucide-react";

interface MassCardProps {
  mass: {
    date: string;
    time?: string;
    language?: string;
    type?: string;
  };
  ministry?: {
    name: string;
  };
  volunteer?: {
    name: string;
  };
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  isAdmin?: boolean;
  onConfirm?: () => void;
}

export function MassCard({
  mass,
  ministry,
  volunteer,
  status,
  isAdmin = false,
  onConfirm,
}: MassCardProps) {
  const statusColor =
    status === "CONFIRMED"
      ? "success"
      : status === "PENDING"
        ? "warning"
        : "destructive";

  return (
    <div className="bg-card/40 border border-yellow-500/20 rounded-xl p-4 shadow-lg flex justify-between items-center">
      <div className="flex flex-col gap-1">
        <span className="font-medium text-white">
          {mass.type || "Mass"} — {new Date(mass.date).toLocaleDateString()}
        </span>
        {mass.time && (
          <span className="flex items-center gap-1 text-gray-300 text-sm">
            <Clock className="w-3.5 h-3.5" /> {mass.time}
          </span>
        )}
        {mass.language && (
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            {mass.language}
          </Badge>
        )}
        {ministry && (
          <span className="text-gray-300 text-sm mt-1">
            Ministry: {ministry.name}
          </span>
        )}
        {volunteer && (
          <span className="text-gray-300 text-sm mt-1">
            Volunteer: {volunteer.name}
          </span>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        {/* <Badge variant={statusColor} className="text-xs px-2 py-1">
          {status}
        </Badge> */}

        {isAdmin && status === "PENDING" && onConfirm && (
          <button
            onClick={onConfirm}
            className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-medium hover:bg-yellow-600 transition"
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
}
