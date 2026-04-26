// services/attendance.ts
import { Volunteer } from "@/lib/data";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { meeting_attendance } from "@prisma/client";
/* =========================================================
   TYPES
========================================================= */

export type MeetingStatus = meeting_attendance;

/**
 * Volunteer with attendance info used by UI table
 */
export interface VolunteerWithAttendance {
  id: number;
  firstName: string;
  lastName: string;
  ministryId: number | null;
  days: {
    day?: number;
    services: {
      serviceOrder: number;
      timeIn: Date | string;
      timeOut: Date | string | null;
      presentCount: number;
    }[];
  }[];
  monthlyMeeting: MeetingStatus;
  remarks?: string;
}

/**
 * Payload sent to backend (SINGLE VOLUNTEER)
 */
export type AttendanceCellPayload = {
  volunteerId: number;
  ministryId: number;
  day: number;
  month: number;
  year: number;
  timeIn?: string;
  timeOut?: string;
};

/**
 * Service Session (individual time in/out)
 */
// export interface AttendanceService {
//   id: number;
//   volunteerId: number;
//   day: number;
//   month: number;
//   year: number;
//   timeIn: Date | string;
//   timeOut: Date | string;
//   createdAt?: Date | string;
// }

/**
 * API Response Shape
 */
export interface AttendanceResponse {
  data: VolunteerWithAttendance[];
  services?: any[];
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

/**
 * FETCH ATTENDANCE (LIST)
 */
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
  });

  if (month !== undefined) params.append("month", String(month));
  if (year !== undefined) params.append("year", String(year));

  if (ministryId !== undefined && ministryId !== null) {
    params.append("ministryId", String(ministryId));
  }

  const res = await fetch(`/api/attendance?${params}`);

  if (!res.ok) {
    throw new Error("Failed to fetch attendance");
  }

  const data: AttendanceResponse = await res.json();
  return data;
};

/**
 * SAVE SINGLE VOLUNTEER ATTENDANCE (LEGACY)
 */
export const saveAttendance = async (payload: AttendanceCellPayload) => {
  const res = await fetch(`/api/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to save attendance");
  }

  return res.json();
};

/**
 * ADD SERVICE SESSION
 */
export const addService = async (payload: {
  volunteerId: number;
  ministryId: number;
  day: number;
  month: number;
  year: number;
  timeIn?: string;
  timeOut?: string;
}) => {
  const res = await fetch(`/api/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to save service");
  }

  return res.json();
};

/**
 * DELETE SERVICE SESSION
 */
export const deleteService = async (payload: {
  serviceId: number;
  volunteerId: number;
  day: number;
  month: number;
  year: number;
}) => {
  const res = await fetch(`/api/attendance/services`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to delete service");
  }

  return res.json();
};

/* =========================================================
   HOOK
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

    placeholderData: keepPreviousData,

    staleTime: 1000 * 60 * 3, // 3 min cache

    refetchOnWindowFocus: false,
  });

  /* -----------------------------
     MUTATION (PER VOLUNTEER SAVE)
  ------------------------------ */

  const saveMutation = useMutation({
    mutationFn: (payload: AttendanceCellPayload) => saveAttendance(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "attendance-volunteers",
      });
    },
  });

  /* -----------------------------
     RETURN
  ------------------------------ */

  /* -------- Service Management -------- */

  const addServiceMutation = useMutation({
    mutationFn: (payload: any) => addService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "attendance-volunteers",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (payload: any) => deleteService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "attendance-volunteers",
      });
    },
  });

  return {
    volunteers: volunteersQuery.data?.data ?? [],
    pagination: volunteersQuery.data?.pagination,

    isLoading: volunteersQuery.isLoading,
    isFetching: volunteersQuery.isFetching,
    error: volunteersQuery.error,

    saveAttendance: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,

    addService: addServiceMutation.mutateAsync,
    deleteService: deleteServiceMutation.mutateAsync,
  };
}
