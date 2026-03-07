import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VolunteerWithBookings } from "../types/volunteer";
import { Volunteer } from "@/lib/data";

export function useVolunteers() {
  return useQuery<VolunteerWithBookings[]>({
    queryKey: ["volunteers"],
    queryFn: async () => {
      const res = await fetch("/api/volunteers");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch volunteers");
      return json.data;
    },
  });
}

export function useCreateVolunteer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create volunteer");
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["volunteers"] }),
  });
}

// export function useUpdateVolunteer() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
//       const res = await fetch(`/api/volunteers/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to update volunteer");
//       return data.data;
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: ["volunteers"] }),
//   });
// }

export function useDeleteVolunteer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete volunteer");

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    },
  });
}
export function useVolunteerById(id?: string) {
  return useQuery<Volunteer, Error>({
    queryKey: ["volunteer", id],
    queryFn: async () => {
      if (!id) throw new Error("No volunteer ID provided");

      const res = await fetch(`/api/volunteers/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch volunteer");
      return data;
    },
    enabled: !!id, // only fetch if id exists
  });
}
export function useUpdateVolunteer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["volunteer", variables.id],
      });
    },
  });
}
