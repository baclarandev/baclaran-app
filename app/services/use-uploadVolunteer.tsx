import { useUploadImage } from "./upload";
import { useUpdateVolunteer } from "./volunteer";

export function useUploadVolunteerImage(volunteerId: string) {
  const uploadMutation = useUploadImage();
  const updateVolunteer = useUpdateVolunteer();

  const uploadAndUpdate = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      uploadMutation.mutate(file, {
        onSuccess: (data) => {
          updateVolunteer.mutate(
            { id: volunteerId, payload: { profilePicture: data.url } },
            {
              onSuccess: () => resolve(),
              onError: (err) => reject(err),
            },
          );
        },
        onError: (err) => reject(err),
      });
    });
  };

  return { uploadAndUpdate, isUploading: uploadMutation.isPending };
}
