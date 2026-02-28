"use client";

import React from "react";
import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";

// Hooks and services
import { useMinistries } from "@/app/services/ministries";
import { useCreateVolunteer, useVolunteers } from "@/app/services/volunteer";
import { useUploadImage } from "@/app/services/upload";

// Types and utilities
import { steps, TimelineType } from "@/app/types/volunteer";
import { CURRENT_YEAR, sacramentMap, YEARS } from "@/app/utils/helper";
import { Volunteer } from "@/lib/data";
import { StepIndicator } from "./step-indicator";
import { ExistingVolunteerSelector } from "./existing-volunteer";
import { PersonalInfoStep } from "./personal-info";
import { ProfilePictureUpload } from "./profile-picture-upload";
import { Ministry, MinistrySelector } from "./ministry-selector";
import { SacramentsCheckboxes } from "./sacrament-checkbox";
import { TimelinesSection } from "./timeline-section";
import { FormationsSection } from "./formation-section";
import { ReviewStep } from "./review-step";
import { DialogActions } from "./dialog-actions";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

interface FormData {
  lastName: string;
  firstName: string;
  middleInitial: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  sex: string;
  joinedYearShrine?: string;
  ministryIds: number[];
  sacraments: string[];
  profilePicture: string;
  civilStatus: string;
  occupation: string;
  marriageType?: "CHURCH" | "CIVIL" | "";
  nickname: string;
  selectedSubMinistryId?: number; // ✅ add this
  joinedYearMinistry?: string; // ✅ add this
  classification?: "REGULAR" | "SEASONAL";
}

interface AddVolunteerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: Staff;
  onSuccess?: () => void;
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
  organization: string;
  parish?: string;
  startYear: number;
  endYear?: number;
  totalYears: number;
  type: TimelineType;
}

const FormDataSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  sex: z.enum(["male", "female"], "Please select sex"),
  civilStatus: z.string().min(1, "Civil status is required"),
  ministryIds: z.array(z.number()).min(1, "Select at least one ministry"),
  formations: z.array(
    z.object({
      name: z.string().min(1, "Formation name required"),
      year: z
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear(), "Invalid year"),
    }),
  ),
  nickname: z.string().optional(),
  timelines: z.array(
    z.object({
      parish: z.string().optional(),
      organization: z.string().min(1, "Organization required"),
      startYear: z
        .number()
        .min(1900)
        .max(new Date().getFullYear(), "Invalid start year"),
      endYear: z
        .number()
        .min(1900)
        .max(new Date().getFullYear(), "Invalid end year")
        .optional(),
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
  // Data fetching
  const { data: ministries = [] } = useMinistries();

  const createVolunteer = useCreateVolunteer();

  // Step management
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Volunteer selection
  const [isExistingVolunteer, setIsExistingVolunteer] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null,
  );
  const [updateVolunteerId, setUpdateVolunteerId] = useState<number | null>(
    null,
  );
  const [openCombobox, setOpenCombobox] = useState(false);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    lastName: "",
    firstName: "",
    middleInitial: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    sex: "",
    joinedYearShrine: "",
    joinedYearMinistry: "",
    nickname: "",
    civilStatus: "",
    occupation: "",
    ministryIds: [],
    sacraments: [],
    profilePicture: "",
    marriageType: "",
    classification: "REGULAR",
  });

  // Image upload
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Ministry selection
  const [openMinistryBox, setOpenMinistryBox] = useState(false);

  // Formations and timelines
  const [formations, setFormations] = useState<
    { name: string; year: number | "" }[]
  >([{ name: "", year: "" }]);
  const [shrineTimelines, setShrineTimelines] = useState<Timeline[]>([]);
  const [outsideTimelines, setOutsideTimelines] = useState<Timeline[]>([]);

  // Admin status
  const isAdmin = user?.role === "ADMIN";
  const currentMinistry = user?.ministry?.name;
  const staffMinistryIds = useMemo(
    () => (user?.ministry ? [user.ministry.id] : []),
    [user?.ministry?.id],
  );

  // Form data update helpers
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

  // Mode toggle for existing volunteer
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
        joinedYearMinistry: "",
        nickname: "",
        civilStatus: "",
        occupation: "",
        ministryIds: [],
        sacraments: [],
        profilePicture: "",
        joinedYearShrine: "",
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
      joinedYearShrine: volunteer.joinedYearShrine
        ? String(volunteer.joinedYearShrine)
        : "",
      joinedYearMinistry: volunteer.joinedYearMinistry
        ? String(volunteer.joinedYearMinistry)
        : "",
      sex: volunteer.sex.toLowerCase(),
      ministryIds: [],
      nickname: volunteer.nickname || "",
      sacraments: volunteer.sacraments.map((s) => {
        const reverseMap: Record<string, string> = {
          BAPTISM: "Baptism",
          EUCHARIST: "First Communion",
          CONFIRMATION: "Confirmation",
          MATRIMONY: "Matrimony",
        };
        return reverseMap[s] || s;
      }),
      profilePicture: volunteer.profilePicture || "",
    });
    setOpenCombobox(false);
  };

  // Formation management
  const addFormation = () =>
    setFormations([...formations, { name: "", year: "" }]);

  const updateFormation = (
    index: number,
    field: "name" | "year",
    value: any,
  ) => {
    const copy = [...formations];
    copy[index] = { ...copy[index], [field]: value };
    setFormations(copy);
  };

  const removeFormation = (index: number) => {
    setFormations(formations.filter((_, i) => i !== index));
  };

  // Timeline management
  const computeTotal = (start: number, end?: number) =>
    end ? end - start + 1 : new Date().getFullYear() - start + 1;

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

  const updateTimeline = (
    list: Timeline[],
    setList: (list: Timeline[]) => void,
    index: number,
    field: "organization" | "parish" | "startYear" | "endYear",
    value: any,
  ) => {
    const copy = [...list];

    copy[index] = {
      ...copy[index],
      [field]: value,
      totalYears:
        field === "startYear" || field === "endYear"
          ? computeTotal(
              field === "startYear" ? value : copy[index].startYear,
              field === "endYear" ? value : copy[index].endYear,
            )
          : copy[index].totalYears,
    };

    setList(copy);
  };

  const addTimeline = (type: TimelineType) => {
    const newTimeline: Timeline = {
      organization: "",
      parish: "", // ✅ add this
      startYear: new Date().getFullYear(),
      endYear: undefined,
      totalYears: 1,
      type,
    };

    if (type === "SHRINE") {
      setShrineTimelines([...shrineTimelines, newTimeline]);
    } else {
      setOutsideTimelines([...outsideTimelines, newTimeline]);
    }
  };

  const removeTimeline = (
    list: Timeline[],
    setList: (list: Timeline[]) => void,
    index: number,
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  // Auto-select all sacraments for married individuals
  useEffect(() => {
    if (formData.civilStatus === "Married") {
      const allSacraments = Object.keys(sacramentMap);
      const missing = allSacraments.filter(
        (s) => !formData.sacraments.includes(s),
      );

      if (missing.length > 0) {
        setFormData((prev) => ({
          ...prev,
          sacraments: allSacraments,
        }));
      }
    }
  }, [formData.civilStatus, formData.sacraments]);

  // Sync ministry IDs for staff
  useEffect(() => {
    if (!isAdmin && staffMinistryIds.length > 0) {
      setFormData((prev) => {
        const same =
          prev.ministryIds.length === staffMinistryIds.length &&
          prev.ministryIds.every((id, i) => id === staffMinistryIds[i]);

        if (same) return prev;

        return {
          ...prev,
          ministryIds: staffMinistryIds,
        };
      });
    }
  }, [staffMinistryIds, isAdmin]);

  // Step validation
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
      const ministriesValid = isAdmin
        ? formData.ministryIds.length > 0
        : staffMinistryIds.length > 0;

      const joinedYearShrineValid =
        formData.joinedYearShrine !== "" && formData.joinedYearShrine !== null;

      const joinedYearMinistryValid =
        formData.joinedYearMinistry !== "" &&
        formData.joinedYearMinistry !== null;

      return (
        ministriesValid && joinedYearShrineValid && joinedYearMinistryValid
      );
    }
    return true;
  }, [currentStep, formData, isExistingVolunteer, selectedVolunteer]);

  // Navigation
  const handleNext = () => {
    if (!isStepValid) {
      toast.warning("Please complete required fields first");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Submit form
  const ministryIds: number[] = isAdmin
    ? formData.ministryIds
    : user?.ministry?.id
      ? [user.ministry.id]
      : [];
  const computeYearsFromJoined = (year?: string | number | null) => {
    if (!year) return 0;
    const parsed = Number(year);
    if (isNaN(parsed)) return 0;
    return CURRENT_YEAR - parsed + 1;
  };
  const handleSubmit = async () => {
    // Determine ministry IDs for payload
    const mainMinistryId: number | undefined = isAdmin
      ? formData.ministryIds[0] // first selected ministry
      : user?.ministry?.id;

    const subMinistryId: number | undefined = formData.selectedSubMinistryId;

    if (!mainMinistryId) {
      toast.warning("No ministry selected");
      return;
    }

    // Prepare volunteer payload
    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleInitial: formData.middleInitial || null,
      email: formData.email,
      joinedYearShrine: formData.joinedYearShrine
        ? Number(formData.joinedYearShrine)
        : null,
      joinedYearMinistry: formData.joinedYearMinistry
        ? Number(formData.joinedYearMinistry)
        : null,
      sex:
        formData.sex === "male"
          ? "Male"
          : formData.sex === "female"
            ? "Female"
            : null,
      classification: formData.classification ?? "REGULAR",
      civilStatus: formData.civilStatus,
      occupation: formData.occupation || null,
      status: "ACTIVE",
      phone: formData.phone || null,
      address: formData.address || null,
      dateOfBirth: formData.dob ? new Date(formData.dob) : null,
      ministryIds,
      subMinistryId: subMinistryId, // optional sub-ministry
      sacraments: formData.sacraments
        .map((s) => sacramentMap[s])
        .filter(Boolean),
      profilePicture: formData.profilePicture || "",
    };

    // Attach formations if valid
    if (validFormations.length > 0) {
      payload.formations = validFormations.map((f) => ({
        name: f.name.trim(),
        year: Number(f.year),
      }));
    }

    // Attach timelines if valid
    if (validTimelines.length > 0) {
      payload.timelines = validTimelines.map((t) => ({
        parish: t.parish?.trim() || null,
        organization: t.organization.trim(),
        startYear: Number(t.startYear),
        endYear: t.endYear ? Number(t.endYear) : undefined,
        totalYears: computeTotal(t.startYear, t.endYear),
        type: t.type,
      }));
    }

    try {
      if (updateVolunteerId) return; // update flow handled separately

      createVolunteer.mutate(payload, {
        onSuccess: () => {
          toast.success("Volunteer saved successfully");
          setIsOpen(false);
          resetForm();
          setShrineTimelines([]);
          setOutsideTimelines([]);
          setFormations([{ name: "", year: "" }]);
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

  const resetForm = () => {
    setCurrentStep(1);
    setIsExistingVolunteer(false);
    setSelectedVolunteer(null);
    setPreviewImage(null);

    setFormData({
      lastName: "",
      firstName: "",
      middleInitial: "",
      email: "",
      phone: "",
      address: "",
      dob: "",
      sex: "",
      nickname: "",
      civilStatus: "",
      occupation: "",
      ministryIds: isAdmin ? [] : staffMinistryIds,
      sacraments: [],
      profilePicture: "",
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const getMinistryNames = (ids: number[]) =>
    ministries
      .filter((m: any) => ids.includes(m.id))
      .map((m: any) => m.name)
      .join(", ");

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 cursor-pointer bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md">
          <Plus className="w-4 h-4" />
          Add Volunteer
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full lg:max-w-2xl px-6 max-h-[90vh] overflow-y-auto bg-blue-400/10 border-blue-500/30 border text-white backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Add New Volunteer</DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete the following steps to add a new volunteer.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        <div className="mt-6 min-h-75">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div>
              {/* <ExistingVolunteerSelector
                volunteers={volunteers}
                isExistingVolunteer={isExistingVolunteer}
                selectedVolunteer={selectedVolunteer}
                openCombobox={openCombobox}
                onModeToggle={handleModeToggle}
                onSelectVolunteer={handleVolunteerSelect}
                onOpenComboboxChange={setOpenCombobox}
              /> */}

              {!isExistingVolunteer && (
                <div className="space-y-4 mt-4 animate-in fade-in duration-300">
                  <ProfilePictureUpload
                    firstName={formData.firstName}
                    lastName={formData.lastName}
                    previewImage={previewImage}
                    profilePicture={formData.profilePicture}
                    onImageUpload={(url) =>
                      updateFormData("profilePicture", url)
                    }
                  />

                  <PersonalInfoStep
                    formData={formData}
                    onFieldChange={
                      updateFormData as (field: string, value: string) => void
                    }
                    selectedSacraments={formData.sacraments}
                    toggleSacrament={toggleSacrament}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Ministry & Timelines */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <MinistrySelector
                parentMinistry={
                  ministries.find(
                    (m: any) => m.id === formData.ministryIds[0],
                  ) ?? ministries[0]!
                }
                ministries={ministries}
                selectedMinistryIds={formData.ministryIds}
                selectedSubMinistryId={formData.selectedSubMinistryId}
                isAdmin={isAdmin}
                openMinistryBox={openMinistryBox}
                currentMinistry={currentMinistry}
                onOpenChange={setOpenMinistryBox}
                onSelectMinistry={(id) => updateFormData("ministryIds", [id])}
                onSelectSubMinistry={(subId) =>
                  updateFormData("selectedSubMinistryId", subId)
                }
              />

              {/* {!isExistingVolunteer && ( */}
              <>
                <div>
                  <label>Volunteer Classification</label>
                  <NativeSelect
                    value={formData.classification}
                    onChange={(e) =>
                      updateFormData("classification", e.target.value)
                    }
                    className="bg-gray-700 border border-gray-600"
                  >
                    <NativeSelectOption value="REGULAR">
                      Regular
                    </NativeSelectOption>

                    <NativeSelectOption value="SEASONAL">
                      Seasonal
                    </NativeSelectOption>
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="joinedYearShrine"
                    className="text-sm font-medium"
                  >
                    Joined Year on Shrine
                  </label>

                  <div className="flex items-center gap-3">
                    <select
                      id="joinedYearShrine"
                      value={formData.joinedYearShrine ?? ""}
                      onChange={(e) =>
                        updateFormData(
                          "joinedYearShrine",
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                      className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-1 text-gray-100"
                    >
                      <option value="">Select Year</option>
                      {YEARS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    {formData.joinedYearShrine && (
                      <span className="text-sm text-blue-400 whitespace-nowrap">
                        {computeYearsFromJoined(formData.joinedYearShrine)} yrs
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="joinedYearMinistry"
                    className="text-sm font-medium"
                  >
                    Joined Year on Ministry
                  </label>

                  <div className="flex items-center gap-3">
                    <select
                      id="joinedYearMinistry"
                      value={formData.joinedYearMinistry ?? ""}
                      onChange={(e) =>
                        updateFormData(
                          "joinedYearMinistry",
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                      className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-1 text-gray-100"
                    >
                      <option value="">Select Year</option>
                      {YEARS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    {formData.joinedYearMinistry && (
                      <span className="text-sm text-blue-400 whitespace-nowrap">
                        {computeYearsFromJoined(formData.joinedYearMinistry)}{" "}
                        yrs
                      </span>
                    )}
                  </div>
                </div>

                <FormationsSection
                  formations={formations}
                  onAddFormation={addFormation}
                  onUpdateFormation={updateFormation}
                  onRemoveFormation={removeFormation}
                />

                <TimelinesSection
                  timelines={shrineTimelines}
                  type="SHRINE"
                  label="Shrine Timeline"
                  onAddTimeline={() => addTimeline("SHRINE")}
                  onUpdateTimeline={(index, field, value) =>
                    updateTimeline(
                      shrineTimelines,
                      setShrineTimelines,
                      index,
                      field,
                      value,
                    )
                  }
                  onRemoveTimeline={(index) =>
                    removeTimeline(shrineTimelines, setShrineTimelines, index)
                  }
                />

                <TimelinesSection
                  timelines={outsideTimelines}
                  type="OUTSIDE"
                  label="Other Affiliations"
                  onAddTimeline={() => addTimeline("OUTSIDE")}
                  onUpdateTimeline={(index, field, value) =>
                    updateTimeline(
                      outsideTimelines,
                      setOutsideTimelines,
                      index,
                      field,
                      value,
                    )
                  }
                  onRemoveTimeline={(index) =>
                    removeTimeline(outsideTimelines, setOutsideTimelines, index)
                  }
                />
              </>
              {/* )} */}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <ReviewStep
              isExistingVolunteer={isExistingVolunteer}
              formData={formData}
              ministryIds={formData.ministryIds}
              getMinistryNames={getMinistryNames}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <DialogActions
          currentStep={currentStep}
          totalSteps={3}
          isLoading={createVolunteer.isPending}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
