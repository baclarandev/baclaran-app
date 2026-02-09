"use client";

import React from "react";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Check,
  User,
  Briefcase,
  FileCheck,
  ChevronsUpDown,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMinistries } from "@/app/services/ministries";
import { useCreateVolunteer, useVolunteers } from "@/app/services/volunteer";

import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useUploadImage } from "@/app/services/upload";
import imageCompression from "browser-image-compression";
import { getSession } from "@/lib/auth";
import { Volunteer } from "@/lib/data";

const steps = [
  { id: 1, name: "Personal", icon: User },
  { id: 2, name: "Ministry", icon: Briefcase },
  { id: 3, name: "Review", icon: FileCheck },
];
const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from(
  { length: CURRENT_YEAR - 1900 + 1 },
  (_, i) => CURRENT_YEAR - i,
);
interface FormData {
  lastName: string;
  firstName: string;
  middleInitial: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  sex: string;
  ministryIds: number[];
  sacraments: string[];
  profilePicture: string;
  civilStatus: string;
  occupation: string;
  marriageType?: "CHURCH" | "CIVIL" | "";
}
interface AddVolunteerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user?: Staff;
  onSuccess?: () => void;
}
type TimelineType = "SHRINE" | "OUTSIDE";
export interface Ministry {
  id: number;
  name: string;
}

export interface Staff {
  id: number;
  name: string | null;
  email: string;
  role: "STAFF" | "ADMIN";
  createdAt: string;
  ministry: Ministry | null;
}
interface Timeline {
  organization: string; // Name of the organization or ministry
  startYear: number; // Starting year, can be empty initially
  endYear?: number; // Ending year, optional (empty if present)
  totalYears: number; // Computed total years
  type: TimelineType; // "SHRINE" or "OUTSIDE"
}
const FormDataSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  sex: z.enum(["male", "female", "other"], "Please select sex"),
  civilStatus: z.string().min(1, "Civil status is required"),
  ministryIds: z.array(z.number()).min(1, "Select at least one ministry"),
  formations: z.array(
    z.object({
      name: z.string().min(1, "Formation name required"),
      year: z.number().int().min(1900).max(CURRENT_YEAR),
    }),
  ),
  timelines: z.array(
    z.object({
      organization: z.string().min(1, "Organization required"),
      startYear: z.number().min(1900).max(CURRENT_YEAR),
      endYear: z.number().min(1900).max(CURRENT_YEAR).optional(),
      type: z.enum(["SHRINE", "OUTSIDE"]),
    }),
  ),
});
export function AddVolunteerDialog({
  open,
  setOpen,
  user,
  onSuccess,
}: AddVolunteerDialogProps) {
  const { data: ministries = [] } = useMinistries();
  const { data: volunteers = [] } = useVolunteers();
  const createVolunteer = useCreateVolunteer();
  const [updateVolunteerId, setUpdateVolunteerId] = useState<number | null>(
    null,
  );
  const [timelines, setTimelines] = useState<Timeline[]>([]);

  const [openMinistryBox, setOpenMinistryBox] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isExistingVolunteer, setIsExistingVolunteer] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null,
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [shrineTimelines, setShrineTimelines] = useState<Timeline[]>([]);
  const [outsideTimelines, setOutsideTimelines] = useState<Timeline[]>([]);
  const { mutate: uploadImage } = useUploadImage();

  const [formData, setFormData] = useState<FormData>({
    lastName: "",
    firstName: "",
    middleInitial: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    sex: "",
    civilStatus: "",
    occupation: "",
    ministryIds: [],
    sacraments: [],
    profilePicture: "",
      marriageType: "",
  });
  const staffMinistryIds = user?.ministry ? [user.ministry.id] : [];
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSacrament = (sacrament: string) => {
    setFormData((prev) => ({
      ...prev,
      sacraments: prev.sacraments.includes(sacrament)
        ? prev.sacraments.filter((s) => s !== sacrament)
        : [...prev.sacraments, sacrament],
    }));
  };
  // const isAdmin = user.role === "ADMIN";

  // const selectableMinistries = isAdmin
  //   ? ministries
  //   : ministries.filter((m: any) => m.id === user?.ministryId);
  const handleModeToggle = (checked: boolean) => {
    setIsExistingVolunteer(checked);
    if (!checked) {
      setSelectedVolunteer(null);
      setUpdateVolunteerId(null);
      setFormData({
        lastName: "",
        firstName: "",
        middleInitial: "",
        email: "",
        phone: "",
        address: "",
        dob: "",
        sex: "",
        civilStatus: "",
        occupation: "",
        ministryIds: [],
        sacraments: [],
        profilePicture: "",
      });
    }
  };

  const handleVolunteerSelect = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setUpdateVolunteerId(volunteer.id);
    setFormData({
      lastName: volunteer.lastName,
      firstName: volunteer.firstName,
      middleInitial: volunteer.middleInitial || "",
      email: volunteer.email,
      phone: volunteer.phone || "",
      address: volunteer.address || "",
      dob: volunteer.dateOfBirth
        ? new Date(volunteer.dateOfBirth).toISOString().split("T")[0]
        : "",
      civilStatus: volunteer.civilStatus || "",
      occupation: volunteer.occupation || "",
      sex: volunteer.sex.toLowerCase(),
      ministryIds: [],
      sacraments: volunteer.sacraments.map((s) => {
        const reverseMap: Record<string, string> = {
          BAPTISM: "Baptism",
          EUCHARIST: "First Communion",
          CONFIRMATION: "Confirmation",

          ANOINTING_OF_THE_SICK: "Anointing of the Sick",
        };
        return reverseMap[s] || s;
      }),
      profilePicture: volunteer.profilePicture || "",
    });
    setOpenCombobox(false);
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress / resize the image client-side
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2, // target size ~2MB
        maxWidthOrHeight: 512, // max width/height 512px
        useWebWorker: true,
      });

      // instant preview
      setPreviewImage(URL.createObjectURL(compressedFile));

      uploadImage(compressedFile, {
        onSuccess: (data) => {
          console.log("[UPLOAD SUCCESS]", data.url);
          updateFormData("profilePicture", data.url);
          setUploadProgress(100);
          setTimeout(() => setUploadProgress(0), 500);
        },
        onError: (err: any) => {
          console.error("[UPLOAD ERROR]", err);
          toast.error(err?.error || "Image upload failed");
          setUploadProgress(0);
        },
      });
    } catch (err) {
      console.error("[UPLOAD ERROR]", err);
      toast.error("Failed to process image");
    }
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    if (!isStepValid) {
      toast.warning("Please complete required fields first");
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const sacramentMap: Record<string, string> = {
    Baptism: "BAPTISM",
    "First Communion": "EUCHARIST",
    Confirmation: "CONFIRMATION",

     Matrimony: "MATRIMONY",
  };
  // Fixes included: updateVolunteerId properly set, form reset works, handleSubmit clean
  const DEFAULT_FORMATIONS = [
    "Basic Orientation Seminar (BOS)",
    "Diocesan Basic Formation",
    "Safeguarding Policy",
  ];

  const [formations, setFormations] = useState<
    { name: string; year: number | "" }[]
  >(DEFAULT_FORMATIONS.map((f) => ({ name: f, year: "" })));

  const computeTotal = (start: number, end?: number) =>
    end ? end - start + 1 : new Date().getFullYear() - start + 1;
  const addFormation = () =>
    setFormations([...formations, { name: "", year: "" }]);
  const isValidYear = (year: any) =>
    Number.isInteger(Number(year)) &&
    Number(year) >= 1900 &&
    Number(year) <= new Date().getFullYear();

  const validFormations = formations.filter(
    (f) => f.name.trim() !== "" && isValidYear(f.year),
  );

  const validTimelines = [...shrineTimelines, ...outsideTimelines].filter(
    (t) =>
      t.organization.trim() !== "" &&
      isValidYear(t.startYear) &&
      (!t.endYear || isValidYear(t.endYear)) &&
      (!t.endYear || t.endYear >= t.startYear),
  );

  const handleSubmit = async () => {
    // if (validFormations.length === 0) {
    //   alert("Please add at least one valid formation with a year.");
    //   return;
    // }
useEffect(() => {
  if (formData.civilStatus === "Married") {
    if (!formData.sacraments.includes("Matrimony")) {
      updateFormData("sacraments", [
        ...formData.sacraments,
        "Matrimony",
      ]);
    }
  } else {
    updateFormData(
      "sacraments",
      formData.sacraments.filter((s) => s !== "Matrimony"),
    );
  }
}, [formData.civilStatus]);


    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleInitial: formData.middleInitial || null,
      email: formData.email,
      sex:
        formData.sex === "male"
          ? "Male"
          : formData.sex === "female"
            ? "Female"
            : "Other",
      civilStatus: formData.civilStatus,
      occupation: formData.occupation || null,
      status: "ACTIVE",
      phone: formData.phone || null,
      address: formData.address || null,
      dateOfBirth: formData.dob ? new Date(formData.dob) : null,
      ministryIds:
        formData.ministryIds.length > 0 ? formData.ministryIds : undefined,
      sacraments: formData.sacraments
        .map((s) => sacramentMap[s])
        .filter(Boolean),
      profilePicture: formData.profilePicture || "",
    };
    payload.formations = validFormations.map((f) => ({
      name: f.name.trim(),
      year: Number(f.year),
    }));

    payload.timelines = validTimelines.map((t) => ({
      organization: t.organization.trim(),
      startYear: Number(t.startYear),
      endYear: t.endYear ? Number(t.endYear) : null,
      totalYears: computeTotal(t.startYear, t.endYear),
      type: t.type,
    }));
    console.group("🚀 CREATE VOLUNTEER PAYLOAD");
    console.log("RAW payload:", payload);
    console.log("FormData:", formData);
    console.log("Valid formations:", validFormations);
    console.log("Valid timelines:", validTimelines);
    console.groupEnd();
    // Only add formations if there are any valid ones
    if (validFormations.length > 0) {
      payload.formations = validFormations.map((f) => ({
        name: f.name.trim(),
        year: Number(f.year),
      }));
    }

    // Only add timelines if there are any valid ones
    if (validTimelines.length > 0) {
      payload.timelines = validTimelines.map((t) => ({
        organization: t.organization.trim(),
        startYear: Number(t.startYear),
        endYear: t.endYear ? Number(t.endYear) : undefined,
        totalYears: computeTotal(t.startYear, t.endYear),
        type: t.type,
      }));
    }

    try {
      if (updateVolunteerId) {
        // 🔜 future: update flow
        return;
      }

      createVolunteer.mutate(payload, {
        onSuccess: () => {
          toast.success("Volunteer saved successfully");
          setIsOpen(false);
          resetForm();
          setTimelines([]);
          setFormations(DEFAULT_FORMATIONS.map((f) => ({ name: f, year: "" })));
          onSuccess?.();
        },
        onError: (err: any) =>
          toast(err.message || "Failed to create volunteer"),
      });
    } catch (err: any) {
      console.error(err);
      toast(err.message);
    }
  };

  // Reset form function
  const resetForm = () => {
    setCurrentStep(1);
    setIsExistingVolunteer(false);
    setSelectedVolunteer(null);

    setFormData({
      lastName: "",
      firstName: "",
      middleInitial: "",
      email: "",
      phone: "",
      address: "",
      dob: "",
      sex: "",
      civilStatus: "",
      occupation: "",
      ministryIds: [],
      sacraments: [],
      profilePicture: "",
    });
  };

  // Handle dialog open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const getMinistryNames = (ids: number[]) =>
    ministries
      .filter((m: any) => ids.includes(m.id))
      .map((m: any) => m.name)
      .join(", ");

  const isStepValid = useMemo(() => {
    if (currentStep === 1) {
      if (isExistingVolunteer) return selectedVolunteer !== null;
      return (
        formData.firstName.trim() !== "" &&
        formData.lastName.trim() !== "" &&
        formData.sex !== "" &&
        formData.email.trim() !== ""
      );
    }
    if (currentStep === 2) {
      return formData.ministryIds.length > 0;
    }
    return true;
  }, [currentStep, formData, isExistingVolunteer, selectedVolunteer]);

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  useEffect(() => {
    if (staffMinistryIds.length > 0) {
      setFormData((prev) => ({
        ...prev,
        ministryIds: [...new Set([...prev.ministryIds, ...staffMinistryIds])],
      }));
    }
  }, [staffMinistryIds]);
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gray-800 text-gray-100 hover:bg-gray-700">
          <Plus className="w-4 h-4" />
          Add Volunteer
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full lg:max-w-2xl px-6 max-h-[90vh] overflow-y-auto bg-gray-800 text-gray-100 border-gray-700">
        <DialogHeader>
          <DialogTitle>Add New Volunteer</DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete the following steps to add a new volunteer.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="mt-4 flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    currentStep > step.id
                      ? "bg-green-600 border-green-600 text-white"
                      : currentStep === step.id
                        ? "bg-yellow-500 border-yellow-500 text-gray-900"
                        : "bg-gray-700 border-gray-600 text-gray-400",
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 font-medium",
                    currentStep >= step.id ? "text-gray-100" : "text-gray-500",
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 mb-6",
                    currentStep > step.id ? "bg-green-600" : "bg-gray-600",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mt-6 min-h-[300px]">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                <Checkbox
                  id="existing-volunteer"
                  checked={isExistingVolunteer}
                  onCheckedChange={handleModeToggle}
                />
                <Label htmlFor="existing-volunteer" className="cursor-pointer">
                  Add existing volunteer to a new ministry
                </Label>
              </div>

              {isExistingVolunteer ? (
                <div className="space-y-2">
                  <Label>Select Existing Volunteer</Label>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
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
                                src={
                                  selectedVolunteer.profilePicture || undefined
                                }
                              />
                              <AvatarFallback className="text-xs bg-gray-600">
                                {getInitials(
                                  selectedVolunteer.firstName,
                                  selectedVolunteer.lastName,
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {selectedVolunteer.firstName}{" "}
                              {selectedVolunteer.lastName} (
                              {selectedVolunteer.volunteerCode})
                            </span>
                          </div>
                        ) : (
                          "Search volunteers..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent   className="w-full p-0 bg-gray-800 border-gray-700 max-h-[60vh] overflow-hidden">
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
                                onSelect={() =>
                                  handleVolunteerSelect(volunteer)
                                }
                                className="text-gray-100 hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage
                                      src={
                                        volunteer.profilePicture || undefined
                                      }
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

                  {/* Display selected volunteer info */}
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
                            {selectedVolunteer.firstName}{" "}
                            {selectedVolunteer.lastName}
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
                          <span className="text-gray-400">
                            Current Ministry:
                          </span>
                          <p className="text-gray-100">
                            {selectedVolunteer.ministryName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-3 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src={
                          previewImage || formData.profilePicture || undefined
                        }
                      />
                      <AvatarFallback className="bg-gray-600">
                        {formData.firstName && formData.lastName ? (
                          getInitials(formData.firstName, formData.lastName)
                        ) : (
                          <User className="w-10 h-10" />
                        )}
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

                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Dela Cruz"
                        value={formData.lastName}
                        onChange={(e) =>
                          updateFormData("lastName", e.target.value)
                        }
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={(e) =>
                          updateFormData("firstName", e.target.value)
                        }
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleInitial">M.I.</Label>
                      <Input
                        id="middleInitial"
                        placeholder="P"
                        value={formData.middleInitial}
                        onChange={(e) =>
                          updateFormData("middleInitial", e.target.value)
                        }
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          updateFormData("email", e.target.value)
                        }
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="+63 912 345 6789"
                        value={formData.phone}
                        onChange={(e) =>
                          updateFormData("phone", e.target.value)
                        }
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St, City"
                      value={formData.address}
                      onChange={(e) =>
                        updateFormData("address", e.target.value)
                      }
                      className="bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => updateFormData("dob", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        placeholder="Teacher, Engineer, Student..."
                        value={formData.occupation}
                        onChange={(e) =>
                          updateFormData("occupation", e.target.value)
                        }
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sex</Label>
                      <div className="flex gap-4 pt-2">
                        {["male", "female", "other"].map((sex) => (
                          <label
                            key={sex}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="sex"
                              value={sex}
                              checked={formData.sex === sex}
                              onChange={(e) =>
                                updateFormData("sex", e.target.value)
                              }
                              className="text-yellow-500 focus:ring-yellow-500"
                            />
                            {sex.charAt(0).toUpperCase() + sex.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Civil Status</Label>
                      <select
                        value={formData.civilStatus}
                        onChange={(e) =>
                          updateFormData("civilStatus", e.target.value)
                        }
                        className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-1 text-gray-100"
                      >
                        <option value="">Select status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>
                    {formData.civilStatus === "Married" && (
  <div className="space-y-2">
    <Label>Marriage Type</Label>
    <div className="flex gap-4 pt-2">
      {[
        { label: "Church", value: "CHURCH" },
        { label: "Civil", value: "CIVIL" },
      ].map((m) => (
        <label key={m.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="marriageType"
            value={m.value}
            checked={formData.marriageType === m.value}
            onChange={(e) =>
              updateFormData("marriageType", e.target.value)
            }
            className="text-yellow-500 focus:ring-yellow-500"
          />
          {m.label}
        </label>
      ))}
    </div>
  </div>
)}

                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Ministry & Sacraments */}
          {/* Step 2: Ministry & Timelines */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Ministries */}
              <div className="space-y-2">
                <Label>Ministries</Label>
                <Popover
                  open={openMinistryBox}
                  onOpenChange={setOpenMinistryBox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                    >
                      {formData.ministryIds.length > 0
                        ? getMinistryNames(formData.ministryIds)
                        : "Select ministries..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent   className="w-full p-0 bg-gray-800 border-gray-700 max-h-[60vh] overflow-hidden">
                    <Command className="bg-gray-800">
                      <CommandInput
                        placeholder="Search ministries..."
                        className="text-gray-100"
                      />
                      <CommandList className="max-h-[50vh] overflow-y-auto overscroll-contain touch-pan-y">
                        <CommandEmpty>No ministry found.</CommandEmpty>
                        <CommandGroup>
                          {ministries.map((m: any) => {
                            const isStaffMinistry = staffMinistryIds.includes(
                              m.id,
                            );
                            const selected = formData.ministryIds.includes(
                              m.id,
                            );
                            return (
                              <CommandItem
                                key={m.id}
                                value={m.name}
                                onSelect={() => {
                                  if (isStaffMinistry) return; // cannot deselect staff's ministry
                                  updateFormData(
                                    "ministryIds",
                                    selected
                                      ? formData.ministryIds.filter(
                                          (id) => id !== m.id,
                                        )
                                      : [...formData.ministryIds, m.id],
                                  );
                                }}
                                className={cn(
                                  "text-gray-100 hover:bg-gray-700 ",
                                  isStaffMinistry
                                    ? "opacity-50 cursor-not-allowed"
                                    : "",
                                )}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selected ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {m.name}
                                {isStaffMinistry && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    (Assigned)
                                  </span>
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {!isExistingVolunteer && (
                <div className="space-y-2">
                  <Label>Sacraments Received</Label>
                  <div className="flex flex-wrap gap-4 pt-2">
               {Object.keys(sacramentMap).map((s) => {
  const isMatrimony = s === "Matrimony";

  return (
    <label
      key={s}
      className={cn(
        "flex items-center gap-2",
        isMatrimony && "opacity-50 cursor-not-allowed",
      )}
    >
      <input
        type="checkbox"
        className="rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-500"
        checked={formData.sacraments.includes(s)}
        disabled={isMatrimony}
        onChange={() => toggleSacrament(s)}
      />
      {s}
    </label>
  );
})}

                  </div>
                </div>
              )}
              {/* Formations */}
              <Card>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Formation Received</h3>
                  {formations.map((f, i) => (
                    <div key={i} className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Formation Name"
                        value={f.name}
                        onChange={(e) => {
                          const copy = [...formations];
                          copy[i].name = e.target.value;
                          setFormations(copy);
                        }}
                      />
                      <select
                        value={f.year ?? ""}
                        onChange={(e) => {
                          const copy = [...formations];
                          copy[i].year =
                            e.target.value === "" ? "" : Number(e.target.value);
                          setFormations(copy);
                        }}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-gray-100"
                      >
                        <option value="">Select Year</option>
                        {YEARS.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <Button variant="outline" onClick={addFormation}>
                    <Plus className="w-4 h-4 mr-2" /> Add Other Formation
                  </Button>
                </CardContent>
              </Card>

              {/* Shrine Timelines */}
              <Card>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Volunteer Timeline (Shrine)</h3>
                  <p>
                    Please indicate all Organization/Ministry you belong to in
                    the Shrine
                  </p>
                  {shrineTimelines.map((t, i) => (
                    <div key={i} className="grid grid-cols-4 gap-3">
                      <Input
                        placeholder="Organization / Ministry"
                        value={t.organization}
                        onChange={(e) => {
                          const copy = [...shrineTimelines];
                          copy[i].organization = e.target.value;
                          setShrineTimelines(copy);
                        }}
                      />
                      <select
                        value={t.startYear ?? ""}
                        onChange={(e) => {
                          const copy = [...shrineTimelines];
                          copy[i].startYear = Number(e.target.value);
                          copy[i].totalYears = computeTotal(
                            copy[i].startYear,
                            copy[i].endYear,
                          );
                          setShrineTimelines(copy);
                        }}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-gray-100"
                      >
                        <option value="">Present</option>
                        {YEARS.map((year) => (
                          <option
                            key={year}
                            value={year}
                            disabled={!!(t.startYear && year < t.startYear)}
                          >
                            {year}
                          </option>
                        ))}
                      </select>
                      <select
                        value={t.endYear ?? ""}
                        onChange={(e) => {
                          const copy = [...shrineTimelines];
                          copy[i].endYear = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          copy[i].totalYears = computeTotal(
                            copy[i].startYear,
                            copy[i].endYear,
                          );
                          setShrineTimelines(copy);
                        }}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-gray-100"
                      >
                        <option value="">Present</option>
                        {YEARS.map((year) => (
                          <option
                            key={year}
                            value={year}
                            disabled={!!(t.startYear && year < t.startYear)}
                          >
                            {year}
                          </option>
                        ))}
                      </select>
                      <Input disabled value={t.totalYears} />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setShrineTimelines([
                        ...shrineTimelines,
                        {
                          organization: "",
                          startYear: new Date().getFullYear(),
                          endYear: undefined,
                          totalYears: 1,
                          type: "SHRINE",
                        },
                      ])
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Another Timeline Entry
                  </Button>
                </CardContent>
              </Card>

              {/* Outside Affiliations */}
              <Card>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Other Affiliations</h3>
                  <p>
                    Please indicate any Organization/Ministry outside the Shrine
                  </p>
                  {outsideTimelines.map((t, i) => (
                    <div key={i} className="grid grid-cols-4 gap-3">
                      <Input
                        placeholder="Organization / Ministry"
                        value={t.organization}
                        onChange={(e) => {
                          const copy = [...outsideTimelines];
                          copy[i].organization = e.target.value;
                          setOutsideTimelines(copy);
                        }}
                      />
                      <select
                        value={t.startYear ?? ""}
                        onChange={(e) => {
                          const copy = [...outsideTimelines];
                          copy[i].startYear = Number(e.target.value);
                          copy[i].totalYears = computeTotal(
                            copy[i].startYear,
                            copy[i].endYear,
                          );
                          setOutsideTimelines(copy);
                        }}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-gray-100"
                      >
                        <option value="">Start Year</option>
                        {YEARS.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <select
                        value={t.endYear ?? ""}
                        onChange={(e) => {
                          const copy = [...outsideTimelines];
                          copy[i].endYear = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          copy[i].totalYears = computeTotal(
                            copy[i].startYear,
                            copy[i].endYear,
                          );
                          setOutsideTimelines(copy);
                        }}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-gray-100"
                      >
                        <option value="">Present</option>
                        {YEARS.map((year) => (
                          <option
                            key={year}
                            value={year}
                            disabled={!!(t.startYear && year < t.startYear)}
                          >
                            {year}
                          </option>
                        ))}
                      </select>
                      <Input disabled value={t.totalYears} />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setOutsideTimelines([
                        ...outsideTimelines,
                        {
                          organization: "",
                          startYear: new Date().getFullYear(),
                          endYear: undefined,
                          totalYears: 1,
                          type: "OUTSIDE",
                        },
                      ])
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Another Timeline Entry
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-gray-700 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-yellow-400 border-b border-gray-600 pb-2">
                  {isExistingVolunteer
                    ? "Add Volunteer to Ministry"
                    : "Review Information"}
                </h3>
                <div className="flex items-center gap-4 pb-4 border-b border-gray-600">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={formData.profilePicture || undefined} />
                    <AvatarFallback className="bg-gray-600">
                      {getInitials(formData.firstName, formData.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {formData.firstName}{" "}
                      {formData.middleInitial && `${formData.middleInitial}.`}{" "}
                      {formData.lastName}
                    </h4>
                    <p className="text-sm text-gray-400">{formData.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {!isExistingVolunteer && (
                    <>
                      <div>
                        <span className="text-gray-400">Phone:</span>
                        <p className="text-gray-100">{formData.phone || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Address:</span>
                        <p className="text-gray-100">
                          {formData.address || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Date of Birth:</span>
                        <p className="text-gray-100">{formData.dob || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Sex:</span>
                        <p className="text-gray-100 capitalize">
                          {formData.sex || "—"}
                        </p>
                        <div>
                          <span className="text-gray-400">Civil Status:</span>
                          <p className="text-gray-100">
                            {formData.civilStatus || "—"}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-400">Occupation:</span>
                          <p className="text-gray-100">
                            {formData.occupation || "—"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className={isExistingVolunteer ? "col-span-2" : ""}>
                    <span className="text-gray-400">
                      {isExistingVolunteer ? "New Ministries:" : "Ministries:"}
                    </span>
                    <p className="text-gray-100">
                      {getMinistryNames(formData.ministryIds) || "—"}
                    </p>
                  </div>
                  {!isExistingVolunteer && (
                    <div>
                      <span className="text-gray-400">Sacraments:</span>
                      <p className="text-gray-100">
                        {formData.sacraments.length > 0
                          ? formData.sacraments.join(", ")
                          : "—"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600 disabled:opacity-50"
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                disabled={!isStepValid}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 text-white hover:bg-green-500"
                disabled={!isStepValid}
              >
                {isExistingVolunteer ? "Add to Ministry" : "Save Volunteer"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
