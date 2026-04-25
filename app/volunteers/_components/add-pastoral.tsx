"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { toast } from "sonner";

import { ExistingVolunteerSelector } from "./existing-volunteer";
import { VolunteerWithBookings } from "@/app/types/volunteer";
import { useMinistries } from "@/app/services/ministries";

// 👉 replace with your actual mutation hook
// import { useAssignVolunteerToMinistry } from "@/app/services/volunteer";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  volunteers: VolunteerWithBookings[];
  onSuccess?: () => void;
}

export function AddPastoralAssignmentDialog({
  open,
  setOpen,
  volunteers,
  onSuccess,
}: Props) {
  const { data: ministries = [] } = useMinistries();

  const pastoralMinistries = ministries.filter(
    (m: any) => m.type === "PASTORAL",
  );

  const [selectedVolunteer, setSelectedVolunteer] =
    useState<VolunteerWithBookings | null>(null);
  const [selectedMinistryId, setSelectedMinistryId] = useState<number | null>(
    null,
  );
  const [openCombobox, setOpenCombobox] = useState(false);
  const [loading, setLoading] = useState(false);

  // 👉 replace with real mutation
  const handleAssign = async () => {
    if (!selectedVolunteer || !selectedMinistryId) {
      toast.error("Please select both volunteer and ministry");
      return;
    }

    try {
      setLoading(true);

      // ✅ CALL YOUR API HERE
      // await assignVolunteerToMinistry({
      //   volunteerId: selectedVolunteer.id,
      //   ministryId: selectedMinistryId,
      // });

      console.log("Assigning:", {
        volunteerId: selectedVolunteer.id,
        ministryId: selectedMinistryId,
      });

      toast.success("Volunteer assigned to pastoral ministry");

      // reset
      setSelectedVolunteer(null);
      setSelectedMinistryId(null);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign volunteer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to Pastoral Ministry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Volunteer Selector */}
          {/* <ExistingVolunteerSelector
            volunteers={volunteers}
            isExistingVolunteer={true}
            selectedVolunteer={selectedVolunteer}
            openCombobox={openCombobox}
            onModeToggle={() => {}}
            onSelectVolunteer={setSelectedVolunteer}
            onOpenComboboxChange={setOpenCombobox}
          /> */}

          {/* Ministry Select */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">
              Select Pastoral Ministry
            </label>

            <NativeSelect
              value={selectedMinistryId ?? ""}
              onChange={(e) => setSelectedMinistryId(Number(e.target.value))}
              className="bg-gray-800 border-gray-700"
            >
              <NativeSelectOption value="">
                Choose ministry...
              </NativeSelectOption>

              {pastoralMinistries.map((m: any) => (
                <NativeSelectOption key={m.id} value={m.id}>
                  {m.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAssign}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
