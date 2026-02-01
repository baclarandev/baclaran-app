import { useQuery } from "@tanstack/react-query";

export function useArchivedVolunteers() {
  return useQuery({
    queryKey: ["volunteers", "archived"],
    queryFn: async () => {
      const res = await fetch("/api/volunteers/archived");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch archived volunteers");
      return data;
    },
  });
}
