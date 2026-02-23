// services/attendance.ts
import { Volunteer } from "@/lib/data";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

/* =========================================================
   TYPES
========================================================= */

/**
 * Volunteer with attendance info used by UI table
 */
export interface VolunteerWithAttendance extends Omit<Volunteer, "ministryId"> {
  ministryId: number;
  days: number[];
  monthlyMeeting: boolean;
  remarks?: string;
}

/**
 * Payload sent to backend
 */
export type AttendancePayload = {
  volunteerId: number;
  ministryId: number;
  days: number[];
  monthlyMeeting: boolean;
  remarks?: string;
};

/**
 * API Response Shape (VERY IMPORTANT)
 */
export interface AttendanceResponse {
  data: VolunteerWithAttendance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* =========================================================
   API CALLS
========================================================= */

export const fetchAttendance = async (
  page: number,
  limit: number,
  ministryId?: number,
  month?: number,
  year?: number,
): Promise<AttendanceResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    month: String(month ?? ""),
    year: String(year ?? ""),
  });

  if (ministryId) {
    params.append("ministryId", String(ministryId));
  }

  const res = await fetch(`/api/attendance?${params}`);

  if (!res.ok) {
    throw new Error("Failed to fetch attendance");
  }

  return res.json();
};

export const saveAttendance = async (
  volunteers: AttendancePayload[],
  month?: number,
  year?: number,
) => {
  const params = new URLSearchParams();

  if (month) params.append("month", String(month));
  if (year) params.append("year", String(year));

  const res = await fetch(`/api/attendance/batch?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(volunteers),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to save attendance");
  }

  return res.json();
};

/* =========================================================
   HOOK (🔥 OPTIMIZED)
========================================================= */

export function useAttendance(
  page: number,
  limit: number,
  ministryId?: number,
  month?: number,
  year?: number,
) {
  const queryClient = useQueryClient();

  /* -----------------------------
     QUERY
  ------------------------------ */

  const volunteersQuery = useQuery<AttendanceResponse>({
    queryKey: ["attendance-volunteers", page, limit, ministryId, month, year],

    queryFn: () => fetchAttendance(page, limit, ministryId, month, year),

    /**
     * ✅ React Query v5 replacement
     * keeps old table while loading new page
     */
    placeholderData: keepPreviousData,

    /**
     * 🔥 Senior optimization
     * prevents refetch spam while typing/filtering
     */
    staleTime: 1000 * 60 * 3, // 3 mins

    /**
     * 🔥 prevents UI flicker
     */
    refetchOnWindowFocus: false,
  });

  /* -----------------------------
     MUTATION
  ------------------------------ */

  const saveMutation = useMutation({
    mutationFn: (data: AttendancePayload[]) =>
      saveAttendance(data, month, year),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-volunteers"],
      });
    },
  });

  /* -----------------------------
     RETURN (Stable Shape)
  ------------------------------ */

  return {
    volunteers: volunteersQuery.data?.data ?? [],
    pagination: volunteersQuery.data?.pagination,

    isLoading: volunteersQuery.isLoading,
    isFetching: volunteersQuery.isFetching,

    saveAttendance: saveMutation.mutateAsync,
    saving: saveMutation.isPending,
  };
}
