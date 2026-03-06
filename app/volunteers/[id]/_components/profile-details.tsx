"use client";

import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Church,
  Heart,
  User,
  BadgeCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  volunteer: any;
};

export function ProfileDetails({ volunteer }: Props) {
  const formatDate = (date: string) => {
    if (!date) return "Not provided";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-400" />
            Personal Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoItem label="First Name" value={volunteer.firstName} />
            <InfoItem label="Last Name" value={volunteer.lastName} />

            <InfoItem
              icon={<Calendar className="h-4 w-4" />}
              label="Date of Birth"
              value={formatDate(volunteer.dateOfBirth)}
            />

            <InfoItem label="Civil Status" value={volunteer.civilStatus} />

            <InfoItem
              icon={<MapPin className="h-4 w-4" />}
              label="Address"
              value={volunteer.address}
              full
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-blue-400" />
            Contact Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoItem
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={volunteer.email}
            />

            <InfoItem
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={volunteer.phone}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ministry Information */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Church className="h-5 w-5 text-blue-400" />
            Ministry Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoItem
              label="Ministry"
              value={volunteer.ministryName || "Not assigned"}
            />

            <InfoItem label="Volunteer Code" value={volunteer.volunteerCode} />

            <InfoItem
              label="Joined Ministry"
              value={volunteer.joinedYearMinistry || "Not provided"}
            />

            <InfoItem
              label="Joined Shrine"
              value={volunteer.joinedYearShrine || "Not provided"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sacraments */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-blue-400" />
            Sacraments
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            {volunteer.sacraments?.length ? (
              volunteer.sacraments.map((s: string, index: number) => (
                <span
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-500/20 border border-blue-500/30"
                >
                  <BadgeCheck className="h-3 w-3" />
                  {s.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-300">
                No sacraments recorded
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------- */
/* Reusable Info Row */
/* -------------------------------- */

function InfoItem({
  icon,
  label,
  value,
  full,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: any;
  full?: boolean;
}) {
  return (
    <div className={`${full ? "sm:col-span-2" : ""}`}>
      <p className="text-xs text-gray-300 mb-1">{label}</p>

      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {value || "Not provided"}
      </div>
    </div>
  );
}
