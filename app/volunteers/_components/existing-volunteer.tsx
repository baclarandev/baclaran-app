"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Volunteer } from "@/lib/data";

interface ExistingVolunteerSelectorProps {
  volunteers: Volunteer[];
  isExistingVolunteer: boolean;
  selectedVolunteer: Volunteer | null;
  openCombobox: boolean;
  onModeToggle: (checked: boolean) => void;
  onSelectVolunteer: (volunteer: Volunteer) => void;
  onOpenComboboxChange: (open: boolean) => void;
}

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const getVolunteerLabel = (v: Volunteer) =>
  `${v.firstName} ${v.lastName} (${v.volunteerCode})`;

export function ExistingVolunteerSelector({
  volunteers,
  isExistingVolunteer,
  selectedVolunteer,
  openCombobox,
  onModeToggle,
  onSelectVolunteer,
  onOpenComboboxChange,
}: ExistingVolunteerSelectorProps) {
  /**
   * ✅ Filter ONLY pastoral ministries
   * Adjust condition depending on your schema:
   * e.g. v.ministryType === "PASTORAL"
   */
  const pastoralVolunteers = useMemo(() => {
    return volunteers.filter((v) =>
      v.ministryName?.toLowerCase().includes("pastoral"),
    );
  }, [volunteers]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Combobox */}
      {isExistingVolunteer && (
        <div className="space-y-2">
          <Label>Select Existing Volunteer</Label>

          <Popover open={openCombobox} onOpenChange={onOpenComboboxChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
              >
                {selectedVolunteer ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage
                        src={selectedVolunteer.profilePicture || undefined}
                      />
                      <AvatarFallback className="text-xs bg-gray-600">
                        {getInitials(
                          selectedVolunteer.firstName,
                          selectedVolunteer.lastName,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span>{getVolunteerLabel(selectedVolunteer)}</span>
                  </div>
                ) : (
                  "Search volunteers..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700">
              <Command className="bg-gray-800">
                <CommandInput placeholder="Search volunteers..." />

                <CommandList className="max-h-[50vh] overflow-y-auto">
                  <CommandEmpty>No pastoral volunteer found.</CommandEmpty>

                  <CommandGroup>
                    {pastoralVolunteers.map((v) => {
                      const isSelected = selectedVolunteer?.id === v.id;

                      return (
                        <CommandItem
                          key={v.id}
                          value={`${v.firstName} ${v.lastName} ${v.volunteerCode}`}
                          onSelect={() => onSelectVolunteer(v)}
                          className="text-gray-100 hover:bg-gray-700"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={v.profilePicture || undefined}
                              />
                              <AvatarFallback className="text-xs bg-gray-600">
                                {getInitials(v.firstName, v.lastName)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <p className="font-medium">
                                {v.firstName} {v.lastName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {v.volunteerCode} • {v.ministryName}
                              </p>
                            </div>

                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Selected Preview */}
          {selectedVolunteer && (
            <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={selectedVolunteer.profilePicture || undefined}
                  />
                  <AvatarFallback className="bg-gray-600">
                    {getInitials(
                      selectedVolunteer.firstName,
                      selectedVolunteer.lastName,
                    )}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="font-semibold">
                    {selectedVolunteer.firstName} {selectedVolunteer.lastName}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {selectedVolunteer.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-gray-600">
                <div>
                  <span className="text-gray-400">Code:</span>
                  <p>{selectedVolunteer.volunteerCode}</p>
                </div>
                <div>
                  <span className="text-gray-400">Ministry:</span>
                  <p>{selectedVolunteer.ministryName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
