"use client";

import { useState } from "react";
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

export function ExistingVolunteerSelector({
  volunteers,
  isExistingVolunteer,
  selectedVolunteer,
  openCombobox,
  onModeToggle,
  onSelectVolunteer,
  onOpenComboboxChange,
}: ExistingVolunteerSelectorProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
        <Checkbox
          id="existing-volunteer"
          checked={isExistingVolunteer}
          onCheckedChange={onModeToggle}
        />
        <Label htmlFor="existing-volunteer" className="cursor-pointer">
          Add existing volunteer to a new ministry
        </Label>
      </div>

      {isExistingVolunteer && (
        <div className="space-y-2">
          <Label>Select Existing Volunteer</Label>
          <Popover open={openCombobox} onOpenChange={onOpenComboboxChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
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
                    <span>
                      {selectedVolunteer.firstName} {selectedVolunteer.lastName}{" "}
                      ({selectedVolunteer.volunteerCode})
                    </span>
                  </div>
                ) : (
                  "Search volunteers..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700 max-h-[60vh] overflow-hidden">
              <Command className="bg-gray-800">
                <CommandInput
                  placeholder="Search volunteers..."
                  className="text-gray-100"
                />
                <CommandList className="max-h-[50vh] overflow-y-auto overscroll-contain touch-pan-y">
                  <CommandEmpty>No volunteer found.</CommandEmpty>
                  <CommandGroup>
                    {volunteers.map((volunteer) => (
                      <CommandItem
                        key={volunteer.id}
                        value={`${volunteer.firstName} ${volunteer.lastName} ${volunteer.volunteerCode}`}
                        onSelect={() => onSelectVolunteer(volunteer)}
                        className="text-gray-100 hover:bg-gray-700"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={volunteer.profilePicture || undefined}
                            />
                            <AvatarFallback className="text-xs bg-gray-600">
                              {getInitials(
                                volunteer.firstName,
                                volunteer.lastName,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {volunteer.firstName} {volunteer.lastName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {volunteer.volunteerCode} •{" "}
                              {volunteer.ministryName}
                            </p>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedVolunteer?.id === volunteer.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

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
                  <p className="text-gray-100">
                    {selectedVolunteer.volunteerCode}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Current Ministry:</span>
                  <p className="text-gray-100">
                    {selectedVolunteer.ministryName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
