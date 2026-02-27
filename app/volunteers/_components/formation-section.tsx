"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { CURRENT_YEAR } from "@/app/utils/helper";

interface Formation {
  name: string;
  year: number | "";
}

interface FormationsSectionProps {
  formations: Formation[];
  onAddFormation: () => void;
  onUpdateFormation: (
    index: number,
    field: "name" | "year",
    value: any,
  ) => void;
  onRemoveFormation: (index: number) => void;
}

export function FormationsSection({
  formations,
  onAddFormation,
  onUpdateFormation,
  onRemoveFormation,
}: FormationsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Formations / Seminars</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddFormation}
          className="gap-2 bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-100"
        >
          <Plus className="w-4 h-4" />
          Add Formation
        </Button>
      </div>

      <div className="space-y-2">
        {formations.map((formation, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Formation name"
                value={formation.name}
                onChange={(e) =>
                  onUpdateFormation(index, "name", e.target.value)
                }
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="w-24 space-y-1">
              <Input
                type="number"
                placeholder="Year"
                value={formation.year}
                onChange={(e) =>
                  onUpdateFormation(
                    index,
                    "year",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                min="1900"
                max={CURRENT_YEAR}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            {formations.length > 1 && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => onRemoveFormation(index)}
                className="p-2 h-9"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Add any trainings, seminars, or formation programs attended.
      </p>
    </div>
  );
}
