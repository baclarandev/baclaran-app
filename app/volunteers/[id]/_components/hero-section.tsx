import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Heart, MapPin, Pencil, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { Volunteer } from "@/lib/data";

import imageCompression from "browser-image-compression";
import { toast } from "sonner"; // or your toast library
import { useUploadImage } from "@/app/services/upload";
import { useUpdateVolunteer } from "@/app/services/volunteer";

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
};

interface HeroSectionProps {
  volunteer: Volunteer;
  onEdit: () => void;
}

export function HeroSection({ volunteer, onEdit }: HeroSectionProps) {
  const statusClass =
    statusStyles[volunteer.status.toLowerCase()] ??
    "bg-muted text-muted-foreground border-border";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const uploadMutation = useUploadImage();
  const updateVolunteerMutation = useUpdateVolunteer();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress image client-side
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });

      setPreviewImage(URL.createObjectURL(compressedFile));

      // Step 1: Upload to Cloudinary
      uploadMutation.mutate(compressedFile, {
        onSuccess: (data) => {
          // Step 2: Update volunteer with new profilePicture
          updateVolunteerMutation.mutate(
            {
              id: volunteer.id.toString(),
              payload: { profilePicture: data.url },
            },
            {
              onSuccess: () => {
                toast.success("Profile picture updated!");
                setPreviewImage(null);
                onEdit(); // refresh volunteer state
              },
              onError: (err: any) => {
                console.error("[UPDATE VOLUNTEER ERROR]", err);
                toast.error("Failed to update volunteer profile");
              },
            },
          );
        },
        onError: (err: any) => {
          console.error("[UPLOAD ERROR]", err);
          toast.error(err?.error || "Image upload failed");
        },
      });
    } catch (err) {
      console.error("[PROCESS IMAGE ERROR]", err);
      toast.error("Failed to process image");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-2xl overflow-hidden bg-blue-500/10 border-blue-500/30 border text-white backdrop-blur-md"
    >
      {/* Decorative top band */}
      <div className="h-28 bg-gradient-to-r from-primary/80 via-primary/50 to-accent/40" />

      <div className="px-6 pb-6 md:px-10 md:pb-8 -mt-16 flex flex-col md:flex-row items-center md:items-end gap-6">
        {/* Avatar */}
        <div className="relative flex flex-col items-center">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Avatar
            onClick={handleAvatarClick}
            className="h-28 w-28 md:h-32 md:w-32  cursor-pointer"
          >
            <AvatarImage
              src={
                previewImage ||
                volunteer.profilePicture ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${volunteer.email}`
              }
            />
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground font-heading">
              {volunteer.firstName[0]}
              {volunteer.lastName[0]}
            </AvatarFallback>
          </Avatar>

          {/* Uploading overlay */}
          {uploadMutation.isPending && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white font-bold rounded-full">
              Uploading...
            </div>
          )}

          {/* Change Profile Picture text */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className="mt-2 text-xs text-blue-400 hover:underline"
          >
            Change Profile Picture
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-2 pt-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-heading text-card-foreground">
              {volunteer.firstName} {volunteer.lastName}
            </h1>
            <Badge
              variant="outline"
              className={`text-xs font-medium ${statusClass}`}
            >
              {volunteer.status}
            </Badge>
          </div>

          {volunteer.nickname && (
            <p className="lg:text-2xl text-purple-400 sm:text-sm text-muted-foreground italic">
              &ldquo;{volunteer.nickname}&rdquo;
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-accent" />
              {volunteer.ministryName}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {volunteer.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {volunteer.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {volunteer?.address.split(",").slice(0, 2).join(",")}
            </span>
          </div>

          <Badge variant="secondary" className="text-xs mt-1">
            {volunteer?.volunteerCode}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            className="cursor-pointer bg-blue-500/10 border-blue-500/30 border text-white backdrop-blur-md rounded-full gap-1.5"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            Update profile
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
