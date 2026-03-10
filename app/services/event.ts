"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ---------------- API FUNCTIONS ----------------

export const fetchEvents = async () => {
  const res = await fetch("/api/events");
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

export const createEventApi = async (data: any) => {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
};

export const updateEventApi = async (data: any) => {
  const { id, ...rest } = data;
  const res = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rest),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
};

export const deleteEventApi = async (id: number) => {
  const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
};

export const archiveEventApi = async (id: number) => {
  const res = await fetch(`/api/events/${id}/archive`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to archive event");
  return res.json();
};

// ---------------- HOOK ----------------

export function useEvents() {
  const queryClient = useQueryClient();

  // --------- Queries ---------
  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60, // 1 min
  });

  // --------- Mutations ---------
  const createEventMutation = useMutation({
    mutationFn: createEventApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const updateEventMutation = useMutation({
    mutationFn: updateEventApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEventApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const archiveEventMutation = useMutation({
    mutationFn: archiveEventApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,

    createEvent: createEventMutation.mutate,
    updatingEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    archiveEvent: archiveEventMutation.mutate,

    creating: createEventMutation.isPending,
    updating: updateEventMutation.isPending,
    deleting: deleteEventMutation.isPending,
    archiving: archiveEventMutation.isPending,
  };
}

export function useEventById(id: number) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("No event ID provided");

      const res = await fetch(`/api/events/${id}`);

      // Parse JSON safely
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Error fetching event:", data);
        throw new Error(data?.error || "Failed to fetch event");
      }

      console.log("Fetched event data:", data); // <-- now this will show actual data
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateAttendance(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update attendance");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
}
