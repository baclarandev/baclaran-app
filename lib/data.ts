// Mock data for the application

export interface Ministry {
  id: string;
  name: string;
  type: "MAIN" | "SUB_GROUP";
  parentId?: string;
  volunteerCount: number;
  children?: Ministry[];
}
export interface Timeline {
  id: number;
  organization: string;
  startYear: number;
  endYear?: number;
  type: string;
}
export type Sex = "male" | "female";
export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated";
export type VolunteerStatus = "ACTIVE" | "INACTIVE" | "ON LEAVE";
export type MinistryType = "MAIN" | "SUB_GROUP";
export type TaskStatus = "To Do" | "In Progress" | "Completed";
export type TaskPriority = "low" | "medium" | "high";
export interface Volunteer {
  id: number;
  volunteerCode?: string;
  volunteerId?: string;
  firstName: string;
  lastName: string;
  middleInitial?: string;
  nickname?: string;
  email: string;
  phone?: string;
  address: string;
  dateOfBirth?: Date;
  sex: Sex;
  civilStatus: CivilStatus;
  occupation?: string;
  ministryId: string;
  ministryName: string;
  subMinistryName?: string;
  subMinistryId?: string;
  status: VolunteerStatus;
  profilePicture?: string;
  appliedDate?: string;
  regularDuration?: string;
  sacraments: string[];
  formations: { id: number; name: string; year: number }[];
  timelines: Timeline[];
  joinedYearShrine: string;
  joinedYearMinistry?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  ministryId?: string;
  ministryName?: string;
  priority: TaskPriority;
  assignee?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  allowPreRegistration: boolean;
  preRegistrationDeadline?: Date;
  preRegisteredCount: number;
  createdAt: Date;
}
