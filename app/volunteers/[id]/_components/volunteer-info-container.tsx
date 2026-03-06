"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit2 } from "lucide-react";

import { useVolunteerById, useUpdateVolunteer } from "@/app/services/volunteer";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import { EditProfileDialog } from "./edit-profile";
import { ProfileDetails } from "./profile-details";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function VolunteerProfile({ user }: { user: any }) {
  const router = useRouter();
  const params = useParams();

  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const volunteerId = id && !isNaN(Number(id)) ? id : undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    data: volunteer,
    isLoading,
    isError,
    error,
  } = useVolunteerById(volunteerId);

  const updateVolunteer = useUpdateVolunteer();

  const handleSave = (updated: Partial<typeof volunteer>) => {
    if (!volunteer) return;

    updateVolunteer.mutate(
      { id: volunteer.id.toString(), payload: updated },
      {
        onSuccess: () => {
          toast.success("Profile updated");
          setEditOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Update failed");
        },
      },
    );
  };

  function getAvatarUrl(volunteer: any) {
    if (volunteer.profilePicture) {
      return volunteer.profilePicture;
    }

    const seed = `${volunteer.firstName}-${volunteer.lastName}`;

    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      seed,
    )}&backgroundColor=3b82f6&textColor=ffffff`;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !volunteer) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        {error?.message || "Volunteer not found"}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className=" w-full p-4  py-6 md:p-8 space-y-8">
          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Hero Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-blue-500/40 shadow-lg">
              <AvatarImage src={getAvatarUrl(volunteer)} />
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {volunteer.firstName?.[0]}
                {volunteer.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-bold text-white">
                {volunteer.firstName} {volunteer.lastName}
              </h1>

              <p className="text-sm sm:text-base text-white italic">
                Ministry: {volunteer.ministryName || "Not assigned"}
              </p>

              {volunteer.volunteerCode && (
                <p className="text-xs text-gray-300">
                  Code: {volunteer.volunteerCode}
                </p>
              )}
            </div>
          </div>

          {/* Profile Card */}
          <Card className="w-full border-none  text-white">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  View and manage your volunteer profile
                </CardDescription>
              </div>

              {/* Desktop Edit Button */}
              <Button
                onClick={() => setEditOpen(true)}
                className="hidden bg-blue-500/20 cursor-pointer  sm:flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            </CardHeader>

            <CardContent>
              <ProfileDetails volunteer={volunteer} />
            </CardContent>
          </Card>
        </main>

        {/* Mobile Floating Edit Button */}
        <Button
          onClick={() => setEditOpen(true)}
          className="sm:hidden bg-blue-500/20 fixed bottom-6 right-6 z-50 shadow-xl flex items-center gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>

        {/* Edit Dialog */}
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          volunteer={volunteer}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
