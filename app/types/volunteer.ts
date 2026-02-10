import { Volunteer } from "@/lib/data";
import { Briefcase, FileCheck, User } from "lucide-react";
export type TimelineType = "SHRINE" | "OUTSIDE";
// types/volunteer.ts
export interface Mass {
  id: number;
  date: string; // ISO string
  time: string;
}

export interface Ministry {
  id: number;
  name: string;
}

export interface MassBooking {
  id: number;
  status: string; // e.g., "PENDING", "CONFIRMED"
  mass: Mass;
  ministry: Ministry;
}
export interface Formation {
  id: number;
  name: string;
  year: number;
}

export interface Timeline {
  id: number;
  organization: string;
  startYear: number;
  endYear?: number | null;
  totalYears: number;
  type: string; // "SHRINE" | "OUTSIDE"
}


export interface VolunteerWithBookings extends Volunteer {
  bookings: MassBooking[];
}
export const steps = [
  { id: 1, name: "Personal", icon: User },
  { id: 2, name: "Ministry", icon: Briefcase },
  { id: 3, name: "Review", icon: FileCheck },
];