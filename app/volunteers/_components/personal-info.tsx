"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sacramentMap } from "@/app/utils/helper";

interface PersonalInfoStepProps {
  formData: {
    firstName: string;
    lastName: string;
    middleInitial: string;
    email: string;
    phone: string;
    address: string;
    dob: string;
    sex: string;
    occupation: string;
    civilStatus: string;
    marriageType?: "CHURCH" | "CIVIL" | "";
    nickname: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

export function PersonalInfoStep({
  formData,
  onFieldChange,
}: PersonalInfoStepProps) {
  return (
    <div className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Dela Cruz"
            value={formData.lastName}
            onChange={(e) => onFieldChange("lastName", e.target.value)}
            className="bg-gray-700 border-gray-600 text-gray-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Juan"
            value={formData.firstName}
            onChange={(e) => onFieldChange("firstName", e.target.value)}
            className="bg-gray-700 border-gray-600 text-gray-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="middleInitial">M.I.</Label>
          <Input
            id="middleInitial"
            placeholder="P"
            value={formData.middleInitial}
            onChange={(e) => onFieldChange("middleInitial", e.target.value)}
            className="bg-gray-700 border-gray-600 text-gray-100"
          />
        </div>
      </div>

      {/* Nickname */}
      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          placeholder="Juanito"
          value={formData.nickname}
          onChange={(e) => onFieldChange("nickname", e.target.value)}
          className="bg-gray-700 border-gray-600 text-gray-100"
        />
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="juan@example.com"
            value={formData.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            className="bg-gray-700 border-gray-600 text-gray-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="+63 912 345 6789"
            value={formData.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            className="bg-gray-700 border-gray-600 text-gray-100"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="123 Main St, City"
          value={formData.address}
          onChange={(e) => onFieldChange("address", e.target.value)}
          className="bg-gray-700 border-gray-600 text-gray-100"
        />
      </div>

      {/* DOB and Occupation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={formData.dob}
            onChange={(e) => onFieldChange("dob", e.target.value)}
            className="bg-gray-700 border-gray-600 text-gray-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            placeholder="Teacher, Engineer, Student..."
            value={formData.occupation}
            onChange={(e) => onFieldChange("occupation", e.target.value)}
            className="bg-gray-700 border-gray-600 text-gray-100"
          />
        </div>
      </div>

      {/* Sex and Civil Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  onChange={(e) => onFieldChange("sex", e.target.value)}
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
            onChange={(e) => onFieldChange("civilStatus", e.target.value)}
            className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-1 text-gray-100"
          >
            <option value="">Select status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </select>
        </div>
      </div>

      {/* Marriage Type (conditional) */}
      {formData.civilStatus === "Married" && (
        <div className="space-y-2">
          <Label>Marriage Type</Label>
          <div className="flex gap-4 pt-2">
            {[
              { label: "Church", value: "CHURCH" },
              { label: "Civil", value: "CIVIL" },
            ].map((m) => (
              <label
                key={m.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="marriageType"
                  value={m.value}
                  checked={formData.marriageType === m.value}
                  onChange={(e) =>
                    onFieldChange("marriageType", e.target.value)
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
  );
}
