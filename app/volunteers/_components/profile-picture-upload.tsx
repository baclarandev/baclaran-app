"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, User } from "lucide-react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { useUploadImage } from "@/app/services/upload";

interface ProfilePictureUploadProps {
  firstName: string;
  lastName: string;
  previewImage: string | null;
  profilePicture: string;
  onImageUpload: (url: string) => void;
}

export function ProfilePictureUpload({
  firstName,
  lastName,
  previewImage,
  profilePicture,
  onImageUpload,
}: ProfilePictureUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate: uploadImage } = useUploadImage();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadProgress(50);
      };
      reader.readAsDataURL(compressedFile);

      uploadImage(compressedFile, {
        onSuccess: (data) => {
          onImageUpload(data.url);
          setUploadProgress(100);
          setTimeout(() => setUploadProgress(0), 500);
        },
        onError: (err: any) => {
          console.error("[UPLOAD ERROR]", err);
          toast.error(err?.error || "Image upload failed");
          setUploadProgress(0);
        },
      });
    } catch (err) {
      console.error("[UPLOAD ERROR]", err);
      toast.error("Failed to process image");
    }
  };

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-gray-700 rounded-lg border border-gray-600">
      <Avatar className="w-24 h-24">
        <AvatarImage src={previewImage || profilePicture || undefined} />
        <AvatarFallback className="bg-gray-600">
          {firstName && lastName ? (
            getInitials(firstName, lastName)
          ) : (
            <User className="w-10 h-10" />
          )}
        </AvatarFallback>
      </Avatar>

      <Label
        htmlFor="avatar-upload"
        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
      >
        <Upload className="w-4 h-4" />
        Upload Profile Picture
      </Label>
      <Input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {uploadProgress > 0 && (
        <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
          <div
            className="bg-yellow-500 h-2 rounded-full transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
