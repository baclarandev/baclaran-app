"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { CURRENT_YEAR } from "@/app/utils/helper";

/* ================= TYPES ================= */

export interface Formation {
  name: string;
  year: number | "";
  default?: boolean;
  checked?: boolean;
}

interface FormationsSectionProps {
  defaultFormations: Formation[];
  customFormations: Formation[];

  onChange: (allFormations: Formation[]) => void;

  onAddCustomFormation: () => void;

  onUpdateCustomFormation: (
    index: number,
    field: "name" | "year",
    value: any,
  ) => void;

  onRemoveCustomFormation: (index: number) => void;

  onUpdateDefaultFormation: (
    index: number,
    field: "checked" | "year",
    value: any,
  ) => void;
}

/* ================= DEFAULT FORMATIONS ================= */

export const DEFAULT_FORMATIONS: Formation[] = [
  {
    name: "Basic Orientation Seminar",
    year: "",
    default: true,
    checked: false,
  },
  {
    name: "Safeguarding Policy",
    year: "",
    default: true,
    checked: false,
  },
  {
    name: "Basic Diocesan Formation",
    year: "",
    default: true,
    checked: false,
  },
];

/* ================= COMPONENT ================= */

export function FormationsSection({
  defaultFormations,
  customFormations,
  onChange,
  onAddCustomFormation,
  onUpdateCustomFormation,
  onRemoveCustomFormation,
  onUpdateDefaultFormation,
}: FormationsSectionProps) {
  /* ---------- Combine + Notify Parent ---------- */
  const notifyParent = (
    updatedDefaults = defaultFormations,
    updatedCustoms = customFormations,
  ) => {
    const combined: Formation[] = [
      // include only completed defaults
      ...updatedDefaults.filter((f) => f.checked || f.year),
      ...updatedCustoms.filter((f) => f.name || f.year),
    ];

    onChange(combined);
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label>Formations / Seminars</Label>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddCustomFormation}
          className="gap-2 bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-100"
        >
          <Plus className="w-4 h-4" />
          Add Formation
        </Button>
      </div>

      {/* ================= FORMATIONS LIST ================= */}
      <div className="space-y-2">
        {/* ---------- DEFAULT FORMATIONS ---------- */}
        {defaultFormations.map((formation, index) => (
          <div key={`default-${index}`} className="flex gap-2 items-center">
            <Checkbox
              checked={!!formation.checked}
              onCheckedChange={(checked) => {
                const updated = [...defaultFormations];
                updated[index] = {
                  ...formation,
                  checked: Boolean(checked),
                };

                onUpdateDefaultFormation(index, "checked", checked);
                notifyParent(updated);
              }}
            />

            <span className="text-gray-100 flex-1">{formation.name}</span>

            <Input
              type="number"
              placeholder="Year"
              value={formation.year}
              min={1900}
              max={CURRENT_YEAR}
              className="w-24 bg-gray-700 border-gray-600 text-gray-100"
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : "";

                const updated = [...defaultFormations];
                updated[index] = {
                  ...formation,
                  year: value,
                };

                onUpdateDefaultFormation(index, "year", value);
                notifyParent(updated);
              }}
            />
          </div>
        ))}

        {/* ---------- CUSTOM FORMATIONS ---------- */}
        {customFormations.map((formation, index) => (
          <div key={index} className="flex gap-2 items-end">
            {/* Name */}
            <div className="flex-1">
              <Input
                placeholder="Formation name"
                value={formation.name}
                className="bg-gray-700 border-gray-600 text-gray-100"
                onChange={(e) => {
                  const value = e.target.value;

                  const updated = [...customFormations];
                  updated[index] = { ...formation, name: value };

                  onUpdateCustomFormation(index, "name", value);
                  notifyParent(defaultFormations, updated);
                }}
              />
            </div>

            {/* Year */}
            <div className="w-24">
              <Input
                type="number"
                placeholder="Year"
                value={formation.year}
                min={1900}
                max={CURRENT_YEAR}
                className="bg-gray-700 border-gray-600 text-gray-100"
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : "";

                  const updated = [...customFormations];
                  updated[index] = { ...formation, year: value };

                  onUpdateCustomFormation(index, "year", value);
                  notifyParent(defaultFormations, updated);
                }}
              />
            </div>

            {/* Remove */}
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="p-2 h-9"
              onClick={() => {
                const updated = customFormations.filter((_, i) => i !== index);

                onRemoveCustomFormation(index);
                notifyParent(defaultFormations, updated);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Footer Help */}
      <p className="text-xs text-gray-400">
        Add any trainings, seminars, or formation programs attended. Check the
        default ones if completed and enter the year.
      </p>
    </div>
  );
}
