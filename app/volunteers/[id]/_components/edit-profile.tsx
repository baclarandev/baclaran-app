import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import { CivilStatus, Sex, Volunteer } from "@/lib/data";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteer: Volunteer;
  onSave: (updated: Partial<Volunteer>) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  volunteer,
  onSave,
}: EditDialogProps) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    setTimeout(() => {
      onSave({
        firstName: fd.get("firstName") as string,
        lastName: fd.get("lastName") as string,
        middleInitial: fd.get("middleInitial") as string,
        nickname: fd.get("nickname") as string,
        email: fd.get("email") as string,
        phone: fd.get("phone") as string,
        address: fd.get("address") as string,
        dateOfBirth: fd.get("dateOfBirth")
          ? new Date(fd.get("dateOfBirth") as string)
          : undefined, // handle optional
        sex: fd.get("sex") as Sex,
        civilStatus: fd.get("civilStatus") as CivilStatus,
        occupation: fd.get("occupation") as string,
        joinedYear: (fd.get("joinedYear") as string) || new Date().getFullYear().toString(),
      });
      toast.success("Profile updated successfully");
      setSaving(false);
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] bg-blue-400/10 border-blue-500/30 border text-white backdrop-blur-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First Name"
              name="firstName"
              defaultValue={volunteer.firstName}
            />
            <Field
              label="Last Name"
              name="lastName"
              defaultValue={volunteer.lastName}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Middle Initial"
              name="middleInitial"
              defaultValue={volunteer.middleInitial}
            />
            <Field
              label="Nickname"
              name="nickname"
              defaultValue={volunteer.nickname}
            />
          </div>

          <Field
            label="Email"
            name="email"
            type="email"
            defaultValue={volunteer.email}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" name="phone" defaultValue={volunteer.phone} />
            <Field
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              defaultValue={
                volunteer.dateOfBirth
                  ? new Date(volunteer.dateOfBirth).toISOString().split("T")[0]
                  : ""
              }
            />
          </div>

          <Field
            label="Address"
            name="address"
            defaultValue={volunteer.address}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Sex
              </Label>
              <NativeSelect name="sex" defaultValue={volunteer.sex}>
                <NativeSelectOption value="">
                  Select a Gender
                </NativeSelectOption>

                <NativeSelectOption value="Male">Male</NativeSelectOption>
                <NativeSelectOption value="Female">Female</NativeSelectOption>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Civil Status
              </Label>
              <NativeSelect
                name="civilStatus"
                defaultValue={volunteer.civilStatus}
              >
                <NativeSelectOption value="">
                  Select civil status
                </NativeSelectOption>

                <NativeSelectOption value="Single">Single</NativeSelectOption>
                <NativeSelectOption value="Married">Married</NativeSelectOption>
                <NativeSelectOption value="Widowed">Widowed</NativeSelectOption>
                <NativeSelectOption value="Divorced">
                  Divorced
                </NativeSelectOption>
              </NativeSelect>
            </div>
          </div>

          <Field
            label="Occupation"
            name="occupation"
            defaultValue={volunteer.occupation}
          />
          <Field
            label="Joined Year"
            name="joinedYear"
            type="number"
            defaultValue={
              volunteer.joinedYear ?? new Date().getFullYear().toString()
            }
          />
          <DialogFooter className="pt-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="bg-red-500/20 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-500/10 border-blue-500/30 border text-white backdrop-blur-md"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      <Input name={name} type={type} defaultValue={defaultValue} />
    </div>
  );
}
