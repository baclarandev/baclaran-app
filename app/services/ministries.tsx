import { useQuery } from "@tanstack/react-query";
export interface Volunteer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  volunteerCode?: string | null;
}
export function useMinistries() {
  return useQuery({
    queryKey: ["ministries"],
    queryFn: async () => {
      const res = await fetch("/api/ministries");
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to fetch ministries");
      return json.data;
    },
  });
}
export function useVolunteersByMinistry(ministryId?: string | number) {
  return useQuery<Volunteer[], Error>({
    queryKey: ["volunteers", "ministry", ministryId],
    queryFn: async () => {
      if (!ministryId) throw new Error("No ministry ID provided");

      const res = await fetch(`/api/ministries/${ministryId}/volunteers`);
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to fetch ministry volunteers");

      // flatten nested volunteer object if needed
      return data.map((v: any) => v.volunteer ?? v);
    },
    enabled: !!ministryId,
  });
}

export interface VolunteerMinistry {
  id: number;
  name: string;
}
export function useMinistryByID(id?: string) {
  return useQuery<Volunteer[], Error>({
    queryKey: ["ministry", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`/api/ministries/${id}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to fetch ministry");

      // return volunteers array directly
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
export function useVolunteerMinistries(volunteerId?: number) {
  return useQuery<VolunteerMinistry[], Error>({
    queryKey: ["volunteerMinistries", volunteerId],
    queryFn: async () => {
      if (!volunteerId) return [];

      const res = await fetch(`/api/volunteers/${volunteerId}/ministries`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch volunteer ministries");
      }

      return data.data; // return array of {id, name}
    },
    enabled: !!volunteerId, // only fetch if ID exists
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
