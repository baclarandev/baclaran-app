import { useMutation } from "@tanstack/react-query";

type UploadResponse = {
  url: string;
};

type UploadError = {
  error: string;
  details?: unknown;
};

export function useUploadImage() {
  return useMutation<UploadResponse, UploadError, File>({
    mutationFn: async (file: File) => {
      console.log("[HOOK] Starting upload", file);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/volunteers/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[HOOK] Upload failed", errorData);
        throw errorData;
      }

      const data = await res.json();
      console.log("[HOOK] Upload success", data);

      return data;
    },
  });
}
