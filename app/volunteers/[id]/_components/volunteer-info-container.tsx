"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { useVolunteerById, useUpdateVolunteer } from "@/app/services/volunteer";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import { DetailsGrid } from "./details-grid";
import { FormationsTimelines } from "./formations-timeline";
import { EditProfileDialog } from "./edit-profile";
import { HeroSection } from "./hero-section";
import { useMinistries } from "@/app/services/ministries";






export default function VolunteerProfile({ user }: { user: any }) {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const volunteerId = id && !isNaN(Number(id)) ? id : undefined;
  const { data: ministries = [],  } = useMinistries();
  const [editOpen, setEditOpen] = useState(false);

  const { data: volunteer, isLoading, isError, error } = useVolunteerById(volunteerId);
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
      }
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

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar user={user}  />
      <div className="flex-1 flex flex-col w-full md:ml-64 transition-all duration-300">
        <Header user={user} />
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
          <HeroSection volunteer={volunteer} onEdit={() => setEditOpen(true)} />

          {/* Details */}
          <DetailsGrid volunteer={volunteer} />

          {/* Formations & Timelines */}
          <FormationsTimelines volunteer={volunteer} />

          {/* Edit Dialog */}
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
