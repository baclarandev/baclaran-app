import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const fetchEvents = async () => {
  const res = await fetch("/api/events");
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};
export const updateEvent = async ({ id, ...data }: any) => {
  const res = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
};

export const deleteEvent = async (id: number) => {
  const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
};
export const createEvent = async (data: any) => {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  console.log("📥 API response:", json);
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
};

export const archiveEvent = async (id: number) => {
  const res = await fetch(`/api/events/${id}/archive`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to archive event");
  return res.json();
};

// --------------------
// REACT QUERY HOOK
// --------------------

export function useEvents() {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const archiveEventMutation = useMutation({
    mutationFn: archiveEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
  const updateEventMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,

    createEvent: createEventMutation.mutate,
    archiveEvent: archiveEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,

    creating: createEventMutation.isPending,
    updating: updateEventMutation.isPending,
    deleting: deleteEventMutation.isPending,
  };
}
