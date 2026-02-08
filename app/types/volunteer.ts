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
export interface Volunteer {
  id: number;
  volunteerCode: string;
  firstName: string;
  lastName: string;
  middleInitial: string | null;
  nickname: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  dateOfBirth: Date | null;
  sex: string;
  civilStatus: string;
  occupation: string | null;
  status: string;
  profilePicture: string | null;
  createdAt: Date;
  sacraments: string[];
  ministryName: string;
  formations: Formation[];
  timelines: Timeline[];
}

export interface VolunteerWithBookings extends Volunteer {
  bookings: MassBooking[];
}
