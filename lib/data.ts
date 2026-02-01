// Mock data for the application

export interface Ministry {
  id: string;
  name: string;
  type: "MAIN" | "SUB_GROUP";
  parentId?: string;
  volunteerCount: number;
  children?: Ministry[];
}

export interface Volunteer {
  id: string;
  volunteerId: string;
  firstName: string;
  lastName: string;
  middleInitial?: string;
  nickname?: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  sex: "male" | "female";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";
  occupation?: string;
  ministryId: string;
  ministryName: string;
  status: "Active" | "Inactive" | "On Leave";
  profilePicture?: string;
  appliedDate?: string;
  regularDuration?: string;
  sacraments: string[];
  formations: { name: string; year: number }[];
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "To Do" | "In Progress" | "Completed";
  dueDate?: Date;
  ministryId?: string;
  ministryName?: string;
  priority: "low" | "medium" | "high";
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

// Mock ministries
export const ministries: Ministry[] = [
  {
    id: "main-1",
    name: "Liturgical Ministries",
    type: "MAIN",
    volunteerCount: 0,
    children: [
      {
        id: "1",
        name: "Lectors & Commentators",
        type: "SUB_GROUP",
        parentId: "main-1",
        volunteerCount: 25,
      },
      {
        id: "2",
        name: "Choir Ministry",
        type: "SUB_GROUP",
        parentId: "main-1",
        volunteerCount: 40,
      },
      {
        id: "3",
        name: "Altar Servers",
        type: "SUB_GROUP",
        parentId: "main-1",
        volunteerCount: 35,
      },
      {
        id: "4",
        name: "Eucharistic Ministers",
        type: "SUB_GROUP",
        parentId: "main-1",
        volunteerCount: 30,
      },
    ],
  },
  {
    id: "main-2",
    name: "Formation Ministries",
    type: "MAIN",
    volunteerCount: 0,
    children: [
      {
        id: "5",
        name: "Youth Ministry",
        type: "SUB_GROUP",
        parentId: "main-2",
        volunteerCount: 60,
      },
      {
        id: "6",
        name: "Catechists",
        type: "SUB_GROUP",
        parentId: "main-2",
        volunteerCount: 45,
      },
      {
        id: "7",
        name: "Family Ministry",
        type: "SUB_GROUP",
        parentId: "main-2",
        volunteerCount: 28,
      },
    ],
  },
  {
    id: "main-3",
    name: "Service Ministries",
    type: "MAIN",
    volunteerCount: 0,
    children: [
      {
        id: "8",
        name: "Hospitality Ministry",
        type: "SUB_GROUP",
        parentId: "main-3",
        volunteerCount: 22,
      },
      {
        id: "9",
        name: "Outreach Ministry",
        type: "SUB_GROUP",
        parentId: "main-3",
        volunteerCount: 18,
      },
      {
        id: "10",
        name: "Environment Ministry",
        type: "SUB_GROUP",
        parentId: "main-3",
        volunteerCount: 15,
      },
    ],
  },
];

// Mock volunteers
export const volunteers: Volunteer[] = [
  {
    id: "1",
    volunteerId: "VOL-2024-001",
    firstName: "Maria",
    lastName: "Santos",
    middleInitial: "C",
    nickname: "Ria",
    email: "maria.santos@email.com",
    phone: "+63 912 345 6789",
    address: "123 Baclaran St, Parañaque City",
    dateOfBirth: new Date("1990-05-15"),
    sex: "female",
    civilStatus: "Single",
    occupation: "Teacher",
    ministryId: "1",
    ministryName: "Lectors & Commentators",
    status: "Active",
    appliedDate: "2022-01",
    regularDuration: "2 yrs 6 mos",
    sacraments: ["Baptism", "First Communion", "Confirmation"],
    formations: [
      { name: "BOS", year: 2022 },
      { name: "Diocesan Basic Formation", year: 2023 },
    ],
    createdAt: new Date("2022-01-15"),
  },
  {
    id: "2",
    volunteerId: "VOL-2024-002",
    firstName: "Juan",
    lastName: "Dela Cruz",
    middleInitial: "P",
    nickname: "Johnny",
    email: "juan.delacruz@email.com",
    phone: "+63 917 654 3210",
    address: "456 Redemptorist Road, Parañaque City",
    dateOfBirth: new Date("1985-08-22"),
    sex: "male",
    civilStatus: "Married",
    occupation: "Engineer",
    ministryId: "5",
    ministryName: "Youth Ministry",
    status: "Active",
    appliedDate: "2020-06",
    regularDuration: "4 yrs 2 mos",
    sacraments: ["Baptism", "First Communion", "Confirmation", "Marriage"],
    formations: [
      { name: "BOS", year: 2020 },
      { name: "Diocesan Basic Formation", year: 2021 },
      { name: "Safeguarding Policy", year: 2022 },
    ],
    createdAt: new Date("2020-06-10"),
  },
  {
    id: "3",
    volunteerId: "VOL-2024-003",
    firstName: "Ana",
    lastName: "Reyes",
    nickname: "Annie",
    email: "ana.reyes@email.com",
    phone: "+63 918 765 4321",
    sex: "female",
    civilStatus: "Single",
    occupation: "Nurse",
    ministryId: "2",
    ministryName: "Choir Ministry",
    status: "Active",
    sacraments: ["Baptism", "First Communion", "Confirmation"],
    formations: [{ name: "BOS", year: 2023 }],
    createdAt: new Date("2023-03-20"),
  },
  {
    id: "4",
    volunteerId: "VOL-2024-004",
    firstName: "Pedro",
    lastName: "Garcia",
    email: "pedro.garcia@email.com",
    sex: "male",
    civilStatus: "Widowed",
    ministryId: "3",
    ministryName: "Altar Servers",
    status: "Inactive",
    sacraments: ["Baptism", "First Communion"],
    formations: [],
    createdAt: new Date("2021-09-05"),
  },
  {
    id: "5",
    volunteerId: "VOL-2024-005",
    firstName: "Rosa",
    lastName: "Mendoza",
    middleInitial: "L",
    email: "rosa.mendoza@email.com",
    sex: "female",
    civilStatus: "Married",
    occupation: "Accountant",
    ministryId: "6",
    ministryName: "Catechists",
    status: "Active",
    sacraments: ["Baptism", "First Communion", "Confirmation", "Marriage"],
    formations: [
      { name: "BOS", year: 2019 },
      { name: "Diocesan Basic Formation", year: 2020 },
    ],
    createdAt: new Date("2019-11-12"),
  },
];

// Mock tasks
export const tasks: Task[] = [
  {
    id: "1",
    title: "Prepare Sunday Mass Schedule",
    description: "Create the volunteer schedule for next month's Sunday masses",
    status: "In Progress",
    dueDate: new Date("2024-12-15"),
    ministryId: "1",
    ministryName: "Lectors & Commentators",
    priority: "high",
    assignee: "Maria Santos",
    createdAt: new Date("2024-11-28"),
  },
  {
    id: "2",
    title: "Youth Retreat Planning",
    description: "Finalize venue and activities for the annual youth retreat",
    status: "To Do",
    dueDate: new Date("2024-12-20"),
    ministryId: "5",
    ministryName: "Youth Ministry",
    priority: "high",
    assignee: "Juan Dela Cruz",
    createdAt: new Date("2024-11-25"),
  },
  {
    id: "3",
    title: "Choir Practice Sessions",
    description: "Schedule extra practice sessions for Christmas Eve mass",
    status: "Completed",
    dueDate: new Date("2024-12-10"),
    ministryId: "2",
    ministryName: "Choir Ministry",
    priority: "medium",
    createdAt: new Date("2024-11-20"),
  },
  {
    id: "4",
    title: "Update Volunteer Database",
    description: "Review and update contact information for all volunteers",
    status: "To Do",
    dueDate: new Date("2024-12-30"),
    priority: "low",
    createdAt: new Date("2024-11-30"),
  },
  {
    id: "5",
    title: "Christmas Decorations Setup",
    description: "Coordinate with environment ministry for church decorations",
    status: "To Do",
    dueDate: new Date("2024-12-18"),
    ministryId: "10",
    ministryName: "Environment Ministry",
    priority: "medium",
    createdAt: new Date("2024-11-29"),
  },
];

// Mock events
export const events: Event[] = [
  {
    id: "1",
    title: "Christmas Eve Mass",
    description: "Annual Christmas Eve celebration with midnight mass",
    date: new Date("2024-12-24"),
    startTime: "22:00",
    endTime: "00:30",
    allowPreRegistration: true,
    preRegistrationDeadline: new Date("2024-12-22"),
    preRegisteredCount: 45,
    createdAt: new Date("2024-11-01"),
  },
  {
    id: "2",
    title: "Youth Ministry Retreat",
    description: "Annual spiritual retreat for youth ministry volunteers",
    date: new Date("2024-12-28"),
    startTime: "08:00",
    endTime: "17:00",
    allowPreRegistration: true,
    preRegistrationDeadline: new Date("2024-12-25"),
    preRegisteredCount: 32,
    createdAt: new Date("2024-11-15"),
  },
  {
    id: "3",
    title: "New Year's Eve Mass",
    description: "Thanksgiving mass to welcome the new year",
    date: new Date("2024-12-31"),
    startTime: "21:00",
    endTime: "23:00",
    allowPreRegistration: true,
    preRegisteredCount: 28,
    createdAt: new Date("2024-11-20"),
  },
  {
    id: "4",
    title: "Volunteer Appreciation Day",
    description: "Recognition event for all church volunteers",
    date: new Date("2025-01-15"),
    startTime: "14:00",
    endTime: "18:00",
    allowPreRegistration: false,
    preRegisteredCount: 0,
    createdAt: new Date("2024-11-25"),
  },
];

// Dashboard metrics
export function getDashboardMetrics() {
  const activeVolunteers = volunteers.filter(
    (v) => v.status === "Active"
  ).length;
  const inactiveVolunteers = volunteers.filter(
    (v) => v.status !== "Active"
  ).length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const totalTasks = tasks.length;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingEvents = events.filter(
    (e) => e.date >= now && e.date <= thirtyDaysFromNow
  ).length;

  const ministryData = ministries
    .flatMap((m) => m.children || [])
    .slice(0, 4)
    .map((m, i) => ({
      name: m.name,
      volunteers: m.volunteerCount,
      color: ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"][
        i
      ],
    }));

  return {
    totalVolunteers: volunteers.length,
    activeVolunteers,
    inactiveVolunteers,
    upcomingEvents,
    taskCompletionRate,
    activeMinistries: ministries.flatMap((m) => m.children || []).length,
    ministryData,
    recentVolunteers: volunteers.slice(0, 5),
    upcomingTasks: tasks.filter((t) => t.status !== "Completed").slice(0, 5),
    todoTasks: tasks.filter((t) => t.status === "To Do").length,
    inProgressTasks: tasks.filter((t) => t.status === "In Progress").length,
    completedTasks,
  };
}
