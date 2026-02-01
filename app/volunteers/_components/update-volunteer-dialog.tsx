"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useUpdateVolunteer } from "@/app/services/volunteer";
import { Volunteer } from "@/app/types/volunteer";

interface UpdateVolunteerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  volunteer: Volunteer;
  onSuccess?: () => void;
}

export function UpdateVolunteerDialog({
  open,
  setOpen,
  volunteer,
  onSuccess,
}: UpdateVolunteerDialogProps) {
  const updateVolunteer = useUpdateVolunteer();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    sex: "",
    profilePicture: "",
  });

  useEffect(() => {
    if (volunteer) {
      setFormData({
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        middleInitial: volunteer.middleInitial || "",
        email: volunteer.email,
        phone: volunteer.phone || "",
        address: volunteer.address || "",
        dob: volunteer.dateOfBirth
          ? new Date(volunteer.dateOfBirth).toISOString().split("T")[0]
          : "",
        sex: volunteer.sex.toLowerCase(),
        profilePicture: volunteer.profilePicture || "",
      });
    }
  }, [volunteer]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result as string,
        }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    updateVolunteer.mutate(
      { id: volunteer.id, payload: formData },
      {
        onSuccess: () => {
          setOpen(false);
          onSuccess?.();
        },
        onError: (err: any) =>
          alert(err.message || "Failed to update volunteer"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-md p-6 bg-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle>Update Volunteer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 p-4 bg-gray-700 rounded-lg">
            <Avatar className="w-24 h-24">
              <AvatarImage src={formData.profilePicture || undefined} />
              <AvatarFallback className="bg-gray-600">
                {formData.firstName && formData.lastName
                  ? `${formData.firstName[0]}${formData.lastName[0]}`
                  : "NA"}
              </AvatarFallback>
            </Avatar>
            <Label
              htmlFor="avatar-upload"
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Profile Picture
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label>M.I.</Label>
              <Input
                value={formData.middleInitial}
                onChange={(e) => handleChange("middleInitial", e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="bg-gray-700 border-gray-600 text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="bg-gray-700 border-gray-600 text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="bg-gray-700 border-gray-600 text-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label>Sex</Label>
              <Input
                value={formData.sex}
                onChange={(e) => handleChange("sex", e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 text-white hover:bg-green-500"
            onClick={handleSubmit}
          >
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
