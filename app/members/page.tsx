"use client";

import { useParams } from "next/navigation";

import {
  useMinistries,
  useVolunteersByMinistry,
} from "@/app/services/ministries";
import { useVolunteers } from "@/app/services/volunteer";
import Members from "./_components/members";

export default function MinistryMembersPage({ user }: any) {
  const params = useParams();
  const ministryId = params.id as string;
  const { data: ministries = [] } = useMinistries();
  const { data: volunteers = [], isLoading } =
    useVolunteersByMinistry(ministryId);

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Members
        user={user}
        volunteers={volunteers}
        ministries={ministries}
        isLoading={isLoading}
      />
    </div>
  );
}
