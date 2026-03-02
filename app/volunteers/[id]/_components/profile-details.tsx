"use client";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Briefcase,
  Calendar,
} from "lucide-react";

export function ProfileDetails({ volunteer }: { volunteer: any }) {
  // ✅ Get ACTIVE ministry history
  const activeHistory = volunteer.ministryHistories?.find(
    (history: any) => history.status === "ACTIVE",
  );

  const ministry = activeHistory?.ministry;

  // ✅ Determine main + sub ministry
  const mainMinistry = ministry?.parent ?? ministry;
  const subMinistry = ministry?.parent ? ministry : null;

  // ==============================
  // Personal Details
  // ==============================
  const personalDetails = [
    { icon: Mail, label: "Email", value: volunteer.email || "-" },
    { icon: Phone, label: "Phone", value: volunteer.phone || "-" },
    { icon: MapPin, label: "Address", value: volunteer.address || "-" },
    { icon: User, label: "Occupation", value: volunteer.occupation || "-" },
    {
      icon: Calendar,
      label: "Date of Birth",
      value: volunteer.dateOfBirth
        ? new Date(volunteer.dateOfBirth).toLocaleDateString()
        : "-",
    },
    { icon: User, label: "Civil Status", value: volunteer.civilStatus || "-" },
  ];

  // ==============================
  // Ministry Details
  // ==============================
  const ministryDetails = [
    {
      icon: Briefcase,
      label: "Main Ministry",
      value: mainMinistry?.name?.trim() || "-",
    },
    ...(subMinistry
      ? [
          {
            icon: Briefcase,
            label: "Sub Ministry",
            value: subMinistry?.name?.trim(),
          },
        ]
      : []),
    {
      icon: Award,
      label: "Volunteer Code",
      value: volunteer.volunteerCode || "-",
    },
    {
      icon: Calendar,
      label: "Joined Shrine",
      value: volunteer.joinedYearShrine || "-",
    },
    {
      icon: Calendar,
      label: "Joined Ministry",
      value: volunteer.joinedYearMinistry || "-",
    },
    {
      icon: Award,
      label: "Classification",
      value: volunteer.classification || "-",
    },
    {
      icon: Award,
      label: "Status",
      value: volunteer.status || "-",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ============================== */}
      {/* Personal Section */}
      {/* ============================== */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalDetails.map((detail, index) => {
            const Icon = detail.icon;

            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg"
              >
                <Icon className="h-5 w-5 text-slate-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    {detail.label}
                  </p>
                  <p className="text-slate-100 font-medium">{detail.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================== */}
      {/* Ministry Section */}
      {/* ============================== */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Ministry & Volunteer Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ministryDetails.map((detail, index) => {
            const Icon = detail.icon;

            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg"
              >
                <Icon className="h-5 w-5 text-slate-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    {detail.label}
                  </p>
                  <p className="text-slate-100 font-medium">{detail.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================== */}
      {/* Sacraments Section */}
      {/* ============================== */}
      {volunteer.sacraments?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Sacraments
          </h3>

          <div className="flex flex-wrap gap-2">
            {volunteer.sacraments.map((sacrament: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {sacrament.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
