"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FormData {
  firstName: string;
  lastName: string;
  middleInitial?: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: string;
  sex?: string;
  occupation?: string;
  civilStatus?: string;
  sacraments?: string[];
  profilePicture: string;
  ministryIds: number[]; // parent ministry IDs
  selectedSubMinistryId?: number; // optional sub-ministry ID
}

interface ReviewStepProps {
  isExistingVolunteer: boolean;
  formData: FormData;
  ministryIds: number[];
  getMinistryNames: (ids: number[]) => string;
}

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

export function ReviewStep({
  isExistingVolunteer,
  formData,
  ministryIds,
  getMinistryNames,
}: ReviewStepProps) {
  // Compute display for parent and sub-ministry
  const parentNames = getMinistryNames(ministryIds) || "—";
  const subName =
    formData.selectedSubMinistryId &&
    getMinistryNames([formData.selectedSubMinistryId]);

  return (
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
          {/* Personal info for new volunteer */}
          {!isExistingVolunteer && (
            <>
              <div>
                <span className="text-gray-400">Phone:</span>
                <p className="text-gray-100">{formData.phone || "—"}</p>
              </div>
              <div>
                <span className="text-gray-400">Address:</span>
                <p className="text-gray-100">{formData.address || "—"}</p>
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
              </div>
              <div>
                <span className="text-gray-400">Civil Status:</span>
                <p className="text-gray-100">{formData.civilStatus || "—"}</p>
              </div>
              <div>
                <span className="text-gray-400">Occupation:</span>
                <p className="text-gray-100">{formData.occupation || "—"}</p>
              </div>
            </>
          )}

          {/* Ministries */}
          <div className={isExistingVolunteer ? "col-span-2" : ""}>
            <span className="text-gray-400">
              {isExistingVolunteer ? "New Ministries:" : "Ministries:"}
            </span>
            <p className="text-gray-100">
              {parentNames}
              {subName ? ` → ${subName}` : ""}
            </p>
          </div>

          {/* Optional sub-ministry label if separate */}
          {/* Uncomment this if you want a separate row */}
          {/* {subName && (
            <div>
              <span className="text-gray-400">Sub-Ministry:</span>
              <p className="text-gray-100">{subName}</p>
            </div>
          )} */}

          {/* Sacraments */}
          {!isExistingVolunteer && (
            <div>
              <span className="text-gray-400">Sacraments:</span>
              <p className="text-gray-100">
                {formData.sacraments && formData.sacraments.length > 0
                  ? formData.sacraments.join(", ")
                  : "—"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
