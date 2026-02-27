"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { sacramentMap } from "@/app/utils/helper";

interface SacramentsCheckboxesProps {
  selectedSacraments: string[];
  civilStatus: string;
  onToggleSacrament: (sacrament: string) => void;
}

export function SacramentsCheckboxes({
  selectedSacraments,
  civilStatus,
  onToggleSacrament,
}: SacramentsCheckboxesProps) {
  const isSacramentDisabled = civilStatus === "Married";

  return (
    <div className="space-y-2">
      <Label>Sacraments Received</Label>
      <div className="flex flex-wrap gap-4 pt-2">
        {Object.keys(sacramentMap).map((s) => (
          <label key={s} className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={selectedSacraments.includes(s)}
              onCheckedChange={() => onToggleSacrament(s)}
              disabled={isSacramentDisabled}
              className={isSacramentDisabled ? "opacity-50" : ""}
            />
            {s.charAt(0).toUpperCase() +
              s.slice(1).toLowerCase().replace(/_/g, " ")}
          </label>
        ))}
      </div>
      {isSacramentDisabled && (
        <p className="text-xs text-gray-400">
          All sacraments are automatically selected for married individuals
        </p>
      )}
    </div>
  );
}
