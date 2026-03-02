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

import { useMinistries } from "@/app/services/ministries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileDetails } from "./profile-details";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
export default function VolunteerProfile({ user }: { user: any }) {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const volunteerId = id && !isNaN(Number(id)) ? id : undefined;
  const { data: ministries = [] } = useMinistries();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !volunteer) {
    return (
      <div className="p-6 text-destructive flex items-center gap-2">
        {error?.message || "Volunteer not found"}
      </div>
    );
  }
  function getAvatarUrl(volunteer: any) {
    if (volunteer.profilePicture) {
      return volunteer.profilePicture;
    }

    const seed = `${volunteer.firstName}-${volunteer.lastName}`;

    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      seed,
    )}&backgroundColor=3b82f6&textColor=ffffff`;
  }
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 md:p-8 mx-auto w-full space-y-8">
          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Hero Section */}
          <div className="mb-8">
            <Avatar className="h-24 w-24 ring-4 ring-blue-500/40 shadow-lg">
              <AvatarImage src={getAvatarUrl(volunteer)} />
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {volunteer.firstName?.[0]}
                {volunteer.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <h1 className="text-4xl font-bold text-white mb-2">
              {volunteer.firstName} {volunteer.lastName}
            </h1>
            <p className="text-white italic">
              Ministry: {volunteer.ministryName}
            </p>
          </div>

          {/* Main Card */}
          <Card className="mb-8 shadow-lg bg-blue-500/20 border-blue-500/30 border text-white backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  View and manage your volunteer profile
                </CardDescription>
              </div>
              <Button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent>
              <ProfileDetails volunteer={volunteer} />
            </CardContent>
          </Card>
          <EditProfileDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            volunteer={volunteer}
            onSave={handleSave}
          />
        </main>
      </div>
    </div>
  );
}
