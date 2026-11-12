import { useQuery } from "@tanstack/react-query";

export interface ServiceRecord {
  year?: number;
  attended?: number | null;
  absent?: number | null;
  commitment?: number | null;
  memberStatus?: string | null;
}

export interface VolunteerAttendance {
  id?: number;
  month?: number;
  year?: number;
  day?: number | null;
  week?: number | null;
  present?: boolean;
  type?: "DAILY" | "MONTHLY_MEETING" | string;
  totalServe?: number | null;
  monthlyServed?: number | null;
}

export interface MinistryHistory {
  id: number;
  volunteerId: number;
  ministryId: number;
  joinedAt?: string;
  leftAt?: string | null;
  status: string;
  ministry?: {
    id: number;
    name: string;
    icon?: string | null;
    ministryCode?: string | null;
  } | null;
}

export interface DashboardVolunteer {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  email?: string | null;
  phone?: string | null;
  volunteerCode?: string | null;
  dateOfBirth?: string | Date | null;
  status?: string | null;
  applicationStatus?: string | null;

  ministryId?: number | null;

  Ministry?: {
    id: number;
    name: string;
  } | null;

  ministry?: {
    id?: number;
    name?: string;
  } | null;

  ministryHistories?: MinistryHistory[];

  attendances?: VolunteerAttendance[];

  VolunteerServiceRecord?: ServiceRecord[];
  volunteerServiceRecords?: ServiceRecord[];
  serviceRecords?: ServiceRecord[];
}

export interface DashboardMinistry {
  id: number;
  name: string;
  icon?: string | null;
  type?: string;
  ministryCode?: string | null;
  parentId?: number | null;

  volunteers?: DashboardMinistryVolunteer[];
  _count?: {
    Volunteer?: number;
    volunteers?: number;
  };
}
export interface DashboardMinistryVolunteer {
  id: number;
  volunteerId: number;
  ministryId: number;
  status: string;
  joinedAt?: string;
  leftAt?: string | null;
  volunteer: DashboardVolunteer;
}
export interface AttendanceService {
  id: number;
  serviceOrder: number;
  timeIn: string | null;
  presentCount: number;
}

export interface AttendanceDay {
  day: number;
  services: AttendanceService[];
}

export interface DashboardAttendance {
  id: number;
  firstName: string;
  lastName: string;
  ministryId: number | null;
  monthlyMeeting: "PRESENT" | "ABSENT" | "EXCUSED";
  days: AttendanceDay[];
}

export interface AttendanceResponse {
  data: DashboardAttendance[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
async function getApiData<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error || `Request failed (${response.status})`);
  }

  return (
    body && typeof body === "object" && "data" in body ? body.data : body
  ) as T;
}

export function useDashboardVolunteers() {
  return useQuery<DashboardVolunteer[]>({
    queryKey: ["dashboard-volunteers"],
    queryFn: () => getApiData<DashboardVolunteer[]>("/api/volunteers"),
    staleTime: 60_000,
  });
}

export function useDashboardMinistries() {
  return useQuery<DashboardMinistry[]>({
    queryKey: ["dashboard-ministries"],
    queryFn: () => getApiData<DashboardMinistry[]>("/api/ministries"),
    staleTime: 60_000,
  });
}
export function useDashboardAttendance(month: number, year: number) {
  return useQuery<AttendanceResponse>({
    queryKey: ["dashboard-attendance", month, year],
    queryFn: async () => {
      const response = await fetch(
        `/api/attendance?month=${month}&year=${year}&page=1&limit=100`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.error || "Failed to fetch attendance");
      }

      return body as AttendanceResponse;
    },
    staleTime: 30_000,
  });
}
