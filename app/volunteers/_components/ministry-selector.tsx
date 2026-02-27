"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Ministry {
  id: number;
  name: string;
  parentId?: number | null;
  subMinistries?: Ministry[];
}

interface MinistrySelectorProps {
  parentMinistry: Ministry;
  ministries: Ministry[];
  selectedMinistryIds: number[];
  selectedSubMinistryId?: number;
  isAdmin: boolean;
  openMinistryBox: boolean;
  currentMinistry: string | undefined;
  onOpenChange: (open: boolean) => void;
  onSelectMinistry: (ministryId: number) => void;
  onSelectSubMinistry?: (subMinistryId: number | undefined) => void;
}

export function MinistrySelector({
  parentMinistry,
  selectedSubMinistryId,
  ministries,
  selectedMinistryIds,
  isAdmin,
  openMinistryBox,
  currentMinistry,
  onOpenChange,
  onSelectMinistry,
  onSelectSubMinistry,
}: MinistrySelectorProps) {
  const [selectedParent, setSelectedParent] = useState<Ministry | null>(
    parentMinistry,
  );
  const [localSubMinistryId, setLocalSubMinistryId] = useState<
    number | undefined
  >(selectedSubMinistryId);

  // Sync prop changes
  useEffect(() => {
    setSelectedParent(parentMinistry);
  }, [parentMinistry]);

  useEffect(() => {
    setLocalSubMinistryId(selectedSubMinistryId);
  }, [selectedSubMinistryId]);

  const getMinistryNames = (ids: number[]) =>
    ministries
      .filter((m) => ids.includes(m.id))
      .map((m) => m.name)
      .join(", ");

  const subMinistries = selectedParent?.subMinistries ?? [];

  const handleParentSelect = (ministry: Ministry) => {
    setSelectedParent(ministry);
    onSelectMinistry(ministry.id);
    // Reset sub-ministry locally and in parent
    setLocalSubMinistryId(undefined);
    onSelectSubMinistry?.(undefined);
  };

  const handleSubMinistryChange = (id: number) => {
    setLocalSubMinistryId(id);
    onSelectSubMinistry?.(id);
  };

  return (
    <div className="space-y-2">
      {/* Parent Ministry */}
      <div className="flex items-center gap-2">
        <Label>Ministries</Label>
        {!isAdmin && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded text-xs text-gray-100">
            <Lock className="w-3 h-3" />
            Auto-assigned
          </div>
        )}
      </div>

      <Popover
        open={openMinistryBox}
        onOpenChange={isAdmin ? onOpenChange : undefined}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between bg-gray-700 border-gray-600 text-gray-100",
              isAdmin
                ? "hover:bg-gray-600 cursor-pointer"
                : "opacity-60 cursor-not-allowed",
            )}
            disabled={!isAdmin}
          >
            {selectedMinistryIds.length > 0
              ? getMinistryNames(selectedMinistryIds)
              : "Select ministries..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        {isAdmin && (
          <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700 max-h-[60vh] overflow-hidden">
            <Command className="bg-gray-800">
              <CommandInput
                placeholder="Search ministries..."
                className="text-gray-100"
              />
              <CommandList className="max-h-[50vh] overflow-y-auto overscroll-contain touch-pan-y">
                <CommandEmpty>No ministry found.</CommandEmpty>
                <CommandGroup>
                  {ministries
                    .filter((m) => !m.parentId)
                    .map((m) => {
                      const selected = selectedMinistryIds.includes(m.id);
                      return (
                        <CommandItem
                          key={m.id}
                          value={m.name}
                          onSelect={() => handleParentSelect(m)}
                          className="text-gray-100 hover:bg-gray-700"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selected ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {m.name}
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>

      {/* Sub-ministry select */}
      <Label>Sub-Ministry</Label>
      {subMinistries.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No sub-ministries under <strong>{selectedParent?.name}</strong>.
        </p>
      ) : (
        <select
          className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-1 text-gray-100"
          value={localSubMinistryId ?? ""}
          onChange={(e) => handleSubMinistryChange(Number(e.target.value))}
        >
          <option value="">Select sub-ministry...</option>
          {subMinistries.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {/* Display current ministry */}
      <p className="text-xs text-gray-400">
        Ministry is automatically set to:{" "}
        <span className="font-medium text-gray-100">
          {selectedMinistryIds.length > 0
            ? getMinistryNames(selectedMinistryIds)
            : currentMinistry || "Not assigned"}
        </span>
      </p>
    </div>
  );
}
