"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { CURRENT_YEAR } from "@/app/utils/helper";

interface Timeline {
  organization: string;
  parish?: string; // ✅ Added parish field
  startYear: number;
  endYear?: number;
  totalYears: number;
  type: "SHRINE" | "OUTSIDE";
}

interface TimelinesSectionProps {
  timelines: Timeline[];
  type: "SHRINE" | "OUTSIDE";
  label: string;
  onAddTimeline: () => void;
  onUpdateTimeline: (
    index: number,
    field: "organization" | "parish" | "startYear" | "endYear",
    value: any,
  ) => void;
  onRemoveTimeline: (index: number) => void;
}

export function TimelinesSection({
  timelines,
  type,
  label,
  onAddTimeline,
  onUpdateTimeline,
  onRemoveTimeline,
}: TimelinesSectionProps) {
  const computeTotal = (start: number, end?: number) =>
    end ? end - start + 1 : CURRENT_YEAR - start + 1;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddTimeline}
          className="gap-2 bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-100"
        >
          <Plus className="w-4 h-4" />
          Add {label}
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        Please indicate any other organization/ministry related to the shrine.
      </p>

      {/* Timeline Items */}
      <div className="space-y-2">
        {timelines.map((timeline, index) => (
          <div
            key={index}
            className="p-3 bg-gray-700 rounded-lg border border-gray-600 space-y-3"
          >
            {/* Organization + Remove */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Organization / Ministry</Label>
                <Input
                  placeholder="Organization name"
                  value={timeline.organization}
                  onChange={(e) =>
                    onUpdateTimeline(index, "organization", e.target.value)
                  }
                  className="bg-gray-600 border-gray-500 text-gray-100"
                />
              </div>

              {timelines.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => onRemoveTimeline(index)}
                  className="p-2 h-9"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* ✅ Parish Field (Only for OUTSIDE) */}
            {type === "OUTSIDE" && (
              <div className="space-y-1">
                <Label className="text-xs">Parish Name</Label>
                <Input
                  placeholder="Parish name"
                  value={timeline.parish || ""}
                  onChange={(e) =>
                    onUpdateTimeline(index, "parish", e.target.value)
                  }
                  className="bg-gray-600 border-gray-500 text-gray-100"
                />
              </div>
            )}

            {/* Years Section */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Start Year</Label>
                <Input
                  type="number"
                  placeholder="Start year"
                  value={timeline.startYear}
                  onChange={(e) =>
                    onUpdateTimeline(
                      index,
                      "startYear",
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  min="1900"
                  max={CURRENT_YEAR}
                  className="bg-gray-600 border-gray-500 text-gray-100"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">End Year (Optional)</Label>
                <Input
                  type="number"
                  placeholder="End year"
                  value={timeline.endYear || ""}
                  onChange={(e) =>
                    onUpdateTimeline(
                      index,
                      "endYear",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  min="1900"
                  max={CURRENT_YEAR}
                  className="bg-gray-600 border-gray-500 text-gray-100"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Total Years</Label>
                <div className="bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-gray-100 text-sm flex items-center">
                  {computeTotal(timeline.startYear, timeline.endYear)} yrs
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}