"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Cake,
  CalendarDays,
  Check,
  ChevronRight,
  Church,
  Command,
  Heart,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Search,
  Settings2,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import {
  DashboardMinistry,
  DashboardVolunteer,
  ServiceRecord,
  useDashboardMinistries,
  useDashboardVolunteers,
  useDashboardAttendance,
} from "@/app/services/dashboard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const avatarColors = [
  "bg-[#e4e8dc] text-[#5e6c51]",
  "bg-[#f6ece5] text-[#b17c5d]",
  "bg-[#eaf0f1] text-[#64828b]",
  "bg-[#f5f0e5] text-[#a48752]",
  "bg-[#f3e3dd] text-[#9b6656]",
  "bg-[#ece5f0] text-[#79658c]",
];
const ministryColors = [
  "bg-[#7d8d62]",
  "bg-[#c48a61]",
  "bg-[#7895a2]",
  "bg-[#b2946b]",
];
const dateFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

function unwrapList<T>(
  value: T[] | { volunteers?: T[]; ministries?: T[] } | undefined,
  key: "volunteers" | "ministries",
): T[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object")
    return (value[key] as T[] | undefined) ?? [];
  return [];
}

function getServiceRecords(volunteer: DashboardVolunteer): ServiceRecord[] {
  return (
    volunteer.VolunteerServiceRecord ??
    volunteer.volunteerServiceRecords ??
    volunteer.serviceRecords ??
    []
  );
}

function getMinistryName(volunteer: DashboardVolunteer) {
  const activeHistory = volunteer.ministryHistories?.find(
    (history) => history.status === "ACTIVE" && !history.leftAt,
  );

  return (
    activeHistory?.ministry?.name ??
    volunteer.Ministry?.name ??
    volunteer.ministry?.name ??
    "Unassigned"
  );
}

function getBirthdayDate(value: DashboardVolunteer["dateOfBirth"], now: Date) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const next = new Date(
    now.getFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  next.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (next < today) next.setFullYear(next.getFullYear() + 1);
  return {
    date: next,
    days: Math.round((next.getTime() - today.getTime()) / 86_400_000),
  };
}

function Avatar({
  initials,
  id = 0,
  large = false,
}: {
  initials: string;
  id?: number;
  large?: boolean;
}) {
  return (
    <div
      aria-label={initials}
      className={`grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${large ? "size-11 text-xs" : ""} ${avatarColors[Math.abs(id) % avatarColors.length]}`}
    >
      {initials}
    </div>
  );
}

function SectionHeading({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="font-serif text-base tracking-tight text-white">
          {title}
        </h2>
        {detail && <p className="mt-1 text-[9px] text-white">{detail}</p>}
      </div>
      {action && (
        <button
          className="flex shrink-0 items-center gap-0.5 py-0.5 text-[9px] text-white"
          type="button"
        >
          {action}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  note,
  tone,
}: {
  icon: typeof Users;
  value: string | number;
  label: string;
  note: string;
  tone: string;
}) {
  return (
    <article className="min-h-[132px] rounded-xl border mx-4 mt-4 border-slate-800 bg-[#17191f] text-white backdrop-blur-md p-4 max-[740px]:min-h-[125px] max-[740px]:p-3">
      <div className="flex items-center justify-between">
        <span
          className={`grid size-[30px] place-items-center rounded-lg ${tone}`}
        >
          <Icon size={17} />
        </span>
      </div>
      <div className="mt-3 font-serif text-[29px] leading-none tracking-tight text-white] max-[740px]:text-[25px]">
        {value}
      </div>
      <div className="mt-1 text-[10px] text-[#6e7168]">{label}</div>
      <div className="mt-3 border-t border-[#f0efe9] pt-2 text-[9px] text-[#96978e] max-[740px]:text-[8px]">
        {note}
      </div>
    </article>
  );
}

function LoadingPanel() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-6 text-sm text-[#667654]"
      role="status"
    >
      Loading volunteer dashboard…
    </div>
  );
}

export default function Dashboard({ user }: { user: any }) {
  const {
    data: volunteerResponse,
    isLoading: volunteersLoading,
    error: volunteerError,
  } = useDashboardVolunteers();
  const {
    data: ministryResponse,
    isLoading: ministriesLoading,
    error: ministryError,
  } = useDashboardMinistries();
  const [activeNav, setActiveNav] = useState("Overview");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const {
    data: attendanceResponse,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useDashboardAttendance(currentMonth, currentYear);

  const attendanceData = attendanceResponse?.data ?? [];
  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "STAFF";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ministries = useMemo(
    () => unwrapList(ministryResponse, "ministries"),
    [ministryResponse],
  );

  const volunteers = useMemo(() => {
    const volunteerMap = new Map<number, DashboardVolunteer>();

    // First, check the volunteer API response.
    const directVolunteers = unwrapList(
      volunteerResponse,
      "volunteers",
    ) as DashboardVolunteer[];

    directVolunteers.forEach((item: any) => {
      // Handle an individual volunteer.
      if (item.firstName && item.id) {
        volunteerMap.set(item.id, item);
      }

      // Handle a ministry containing nested volunteers.
      if (Array.isArray(item.volunteers)) {
        item.volunteers.forEach((nested: any) => {
          const volunteer = nested.volunteer ?? nested;

          if (volunteer?.id && volunteer.firstName) {
            volunteerMap.set(volunteer.id, volunteer);
          }
        });
      }
    });

    // Also collect volunteer profiles from the ministry API.
    ministries.forEach((ministry) => {
      ministry.volunteers?.forEach((membership: any) => {
        const volunteer = membership.volunteer ?? membership;

        if (volunteer?.id && volunteer.firstName) {
          volunteerMap.set(volunteer.id, volunteer);
        }
      });
    });

    return Array.from(volunteerMap.values());
  }, [volunteerResponse, ministries]);
  const birthdays = useMemo(
    () =>
      volunteers
        .map((volunteer) => ({
          volunteer,
          birthday: getBirthdayDate(volunteer.dateOfBirth, now),
        }))
        .filter(
          (
            item,
          ): item is {
            volunteer: DashboardVolunteer;
            birthday: NonNullable<ReturnType<typeof getBirthdayDate>>;
          } => Boolean(item.birthday),
        )
        .sort((a, b) => a.birthday.days - b.birthday.days),
    [volunteers],
  );

  const serviceLeaders = useMemo(
    () =>
      volunteers
        .map((volunteer) => {
          const records = getServiceRecords(volunteer);
          const record =
            records.find((item) => item.year === now.getFullYear()) ??
            [...records].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))[0];
          return {
            volunteer,
            record,
            attended: record?.attended ?? 0,
            absent: record?.absent ?? 0,
          };
        })
        .filter((item) => item.record)
        .sort((a, b) => b.attended - a.attended),
    [volunteers, now],
  );

  const stats = useMemo(() => {
    const active = volunteers.filter(
      (v) => (v.status ?? v.applicationStatus ?? "").toUpperCase() === "ACTIVE",
    ).length;
    const currentYearRecords = volunteers
      .flatMap(getServiceRecords)
      .filter((record) => record.year === now.getFullYear());
    const attended = currentYearRecords.reduce(
      (sum, record) => sum + (record.attended ?? 0),
      0,
    );
    const absent = currentYearRecords.reduce(
      (sum, record) => sum + (record.absent ?? 0),
      0,
    );
    return {
      active,
      attendanceRate:
        attended + absent
          ? Math.round((attended / (attended + absent)) * 100)
          : null,
    };
  }, [volunteers, now]);
  const ministryRows = useMemo(
    () =>
      ministries
        .map((ministry: DashboardMinistry, index) => {
          // Get volunteers assigned through their active ministry history
          const members = volunteers.filter((volunteer) => {
            const activeHistory = volunteer.ministryHistories?.some(
              (history) =>
                history.ministryId === ministry.id &&
                history.status === "ACTIVE" &&
                !history.leftAt,
            );

            return (
              activeHistory ||
              volunteer.ministryId === ministry.id ||
              volunteer.Ministry?.id === ministry.id ||
              volunteer.ministry?.id === ministry.id
            );
          });

          const attended = members
            .flatMap(getServiceRecords)
            .reduce((sum, record) => sum + (record.attended ?? 0), 0);

          return {
            ministry,
            members: members.length,
            attended,
            color: ministryColors[index % ministryColors.length],
          };
        })
        .sort((a, b) => b.attended - a.attended),
    [ministries, volunteers],
  );
  const totalMinistryAttendances = ministryRows.reduce(
    (total, item) => total + item.attended,
    0,
  );
  const attendanceStats = useMemo(() => {
    const today = now.getDate();

    let todayAttendance = 0;
    let monthlyAttendance = 0;

    let monthlyPresent = 0;
    let monthlyAbsent = 0;
    let monthlyExcused = 0;

    attendanceData.forEach((volunteer) => {
      volunteer.days?.forEach((day) => {
        const sessions = day.services ?? [];

        monthlyAttendance += sessions.length;

        if (day.day === today) {
          todayAttendance += sessions.length;
        }
      });

      switch (volunteer.monthlyMeeting) {
        case "PRESENT":
          monthlyPresent++;
          break;
        case "ABSENT":
          monthlyAbsent++;
          break;
        case "EXCUSED":
          monthlyExcused++;
          break;
      }
    });

    const meetingTotal = monthlyPresent + monthlyAbsent + monthlyExcused;

    return {
      todayAttendance,
      monthlyAttendance,
      monthlyPresent,
      monthlyAbsent,
      monthlyExcused,
      meetingTotal,
      meetingRate: meetingTotal
        ? Math.round((monthlyPresent / meetingTotal) * 100)
        : 0,
    };
  }, [attendanceData, now]);
  const filteredVolunteers = useMemo(
    () =>
      volunteers.filter((volunteer) =>
        `${volunteer.firstName} ${volunteer.lastName} ${getMinistryName(volunteer)}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [volunteers, query],
  );

  if (volunteersLoading || ministriesLoading)
    return (
      <main className="min-h-screen bg-[#f6f5f0]">
        <LoadingPanel />
      </main>
    );
  const apiError = volunteerError ?? ministryError;
  const topPerformer = serviceLeaders[0];
  const upcomingBirthday = birthdays[0];
  const initials = (volunteer: DashboardVolunteer) =>
    `${volunteer.firstName?.[0] ?? ""}${volunteer.lastName?.[0] ?? ""}`.toUpperCase();
  const monthDay = (date: Date) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "2-digit" }).format(
      date,
    );

  return (
    <div className="min-h-screen   antialiased">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="mx-auto  px-[38px] pb-[22px] pt-[34px] ">
          <div className="mb-[21px] flex items-end justify-between gap-3 max-[740px]:items-start">
            <div>
              <div className="mb-2.5 flex items-center gap-2 text-[9px] font-bold tracking-[1.2px] text-[#99998f]">
                <span className="size-1.5 rounded-full bg-[#82946b] shadow-[0_0_0_3px_#e5e9df]" />
                {dateFormatter.format(now).toUpperCase()}
              </div>
              <h1 className="font-serif text-[32px] font-normal tracking-tight text-white max-[740px]:text-[26px] max-[390px]:text-[23px]">
                Your community, in good hands{" "}
                <Sparkles
                  size={18}
                  className="inline text-[#bb8e60]"
                  aria-hidden="true"
                />
              </h1>
              <p className="mt-1.5 text-xs text-[#888a80] max-[740px]:max-w-[300px] max-[740px]:text-[10px]">
                A live view of volunteer service and ministry participation.
              </p>
            </div>
            <div className="flex h-[34px] shrink-0 items-center gap-2 rounded-lg border mx-4 mt-6 md:m-6  border-slate-800 bg-[#17191f] backdrop-blur-md px-3 text-[10px] text-[#686b61] max-[740px]:gap-1 max-[740px]:px-2">
              <CalendarDays size={15} />
              <span className="max-[740px]:sr-only">
                {new Intl.DateTimeFormat("en", {
                  month: "long",
                  year: "numeric",
                }).format(now)}
              </span>
            </div>
          </div>
          <section
            className="relative mb-[17px] flex h-[185px] overflow-hidden rounded-[14px] border mx-4 mt-6 md:m-6  border-slate-800 bg-[#17191f] text-white backdrop-blur-md min-[1450px]:h-[195px] max-[740px]:h-auto max-[740px]:min-h-[190px]"
            aria-label="Community overview"
          >
            <div className="relative z-[2] max-w-[58%] px-[30px] py-6 max-[740px]:max-w-[78%] max-[740px]:px-5 max-[740px]:py-[21px] max-[390px]:max-w-[88%] max-[390px]:pl-4">
              <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-[1.1px] text-[#71805f]">
                <Sparkles size={14} /> YOUR COMMUNITY AT A GLANCE
              </span>
              <h2 className="mt-3 mb-2 font-serif text-[26px] font-normal tracking-tight text-white max-[740px]:text-[22px]">
                Small acts.{" "}
                <em className="font-normal text-[#758363]">Lasting impact.</em>
              </h2>
              <p className="max-w-[400px] text-[10px] leading-relaxed text-[#71786c] max-[740px]:max-w-[270px] max-[740px]:text-[9px] max-[390px]:max-w-[230px]">
                See the people, service, and ministries that make your community
                stronger.
              </p>
              <button
                className="mt-3 flex items-center gap-1.5 border-0 bg-transparent p-0 text-[10px] font-bold text-[#596b49]"
                onClick={() => setActiveNav("Volunteers")}
              >
                Explore your community <ArrowUpRight size={16} />
              </button>
            </div>
            <div
              className="absolute inset-y-0 left-[52%] right-0 overflow-hidden max-[1050px]:left-[48%] max-[740px]:left-[54%] max-[740px]:opacity-70 max-[390px]:left-[58%] max-[390px]:opacity-50"
              aria-hidden="true"
            >
              <div className="absolute top-6 right-[19%] size-[78px] rounded-full bg-[#e2c59d]/75 max-[740px]:right-[13%] max-[740px]:size-14" />
              <div className="absolute -right-3 -bottom-[70px] h-[150px] w-[390px] rotate-[-11deg] rounded-[50%_50%_0_0] bg-[#c5cebb] max-[740px]:w-[260px]" />
              <div className="absolute right-[76px] -bottom-[70px] h-[122px] w-[350px] rotate-[10deg] rounded-[50%_50%_0_0] bg-[#a8b49a] max-[740px]:right-[30px] max-[740px]:w-[250px]" />
              <div className="absolute top-[54px] right-[24%] flex size-[66px] rotate-[8deg] flex-col items-center justify-center gap-1 rounded-full bg-[#f7f5eb] text-[#869372] shadow-lg max-[740px]:top-16 max-[740px]:right-[18%] max-[740px]:size-[51px]">
                <Heart size={18} fill="currentColor" />
                <span className="text-center font-serif text-[9px] leading-none max-[740px]:text-[7px]">
                  serving
                  <br />
                  together
                </span>
              </div>
              <Sparkles
                size={16}
                className="absolute top-[34px] right-[14%] text-[#faf8ef]"
              />
            </div>
          </section>
          <section className="mb-[17px] grid grid-cols-4 gap-[13px] max-[1050px]:grid-cols-2 max-[740px]:gap-2">
            <MetricCard
              icon={Users}
              value={apiError ? "—" : volunteers.length}
              label="Total volunteers"
              note={
                apiError ? "Waiting for API" : `${stats.active} active members`
              }
              tone="bg-[#eef0e9] text-[#71805f]"
            />
            <MetricCard
              icon={CalendarDays}
              value={apiError ? "—" : birthdays.length}
              label="Upcoming birthdays"
              note="Known birthdays in the next year"
              tone="bg-[#f6ece5] text-[#b17c5d]"
            />
            <MetricCard
              icon={Activity}
              value={
                attendanceLoading
                  ? "..."
                  : attendanceError
                    ? "—"
                    : attendanceStats.monthlyAttendance
              }
              label="Service attendance"
              note={`Based on ${now.getFullYear()} service records`}
              tone="bg-[#eaf0f1] text-[#64828b]"
            />
            <MetricCard
              icon={Church}
              value={apiError ? "—" : ministries.length}
              label="Ministries"
              note={
                apiError
                  ? "Waiting for API"
                  : `${totalMinistryAttendances} total attendances`
              }
              tone="bg-[#f5f0e5] text-[#a48752]"
            />
          </section>
          <div className="mb-[15px] grid grid-cols-[minmax(0,1.2fr)_minmax(0,.92fr)] gap-[15px] max-[740px]:grid-cols-1 max-[740px]:gap-[11px]">
            <section className="rounded-xl mx-4 mt-6 md:m-6 border border-slate-800 bg-[#17191f] text-white backdrop-blur-md p-[19px] min-[1450px]:px-[22px] min-[1450px]:py-[21px] max-[740px]:p-4">
              <SectionHeading
                title="Ministry engagement"
                detail="Service records grouped by ministry"
                action="View ministries"
              />
              {ministryRows.length ? (
                <div className="mt-[19px] flex flex-col gap-4">
                  {ministryRows
                    .slice(0, 5)
                    .map(({ ministry, members, attended, color }) => (
                      <div
                        className="flex items-center gap-2.5"
                        key={ministry.id}
                      >
                        <div
                          className={`grid size-[29px] shrink-0 place-items-center rounded-lg text-white ${color}`}
                        >
                          <Church size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <strong className="truncate text-[9px] font-semibold text-[#4c5148]">
                              {ministry.name}
                            </strong>
                            <span className="shrink-0 text-[8px] text-[#9a9b92]">
                              {members} volunteers · {attended} attendances
                            </span>
                          </div>
                          <div className="h-[5px] overflow-hidden rounded-full mx-4 mt-6 md:m-6 border border-slate-800 bg-[#17191f] text-white backdrop-blur-md">
                            <div
                              className={`h-full rounded-full ${color}`}
                              style={{
                                width: `${totalMinistryAttendances ? Math.round((attended / totalMinistryAttendances) * 100) : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="mt-5 text-[11px] leading-relaxed text-[#85877d]">
                  Loading...
                </p>
              )}
            </section>
            <section className="rounded-xl mx-4 mt-6 md:m-6 border border-slate-800 bg-[#17191f] text-white backdrop-blur-md p-[19px] max-[740px]:p-4">
              <SectionHeading
                title="Upcoming birthdays"
                detail="Celebrate the people behind the mission"
                action="All birthdays"
              />
              {upcomingBirthday ? (
                <>
                  <div className="my-4 flex items-center gap-3 rounded-[10px] border border-slate-800 bg-[#17191f] text-white backdrop-blur-md p-3">
                    <div className="flex h-[53px] w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-slate-800 bg-[#17191f] text-white backdrop-blur-md">
                      <span className="text-[8px] font-bold tracking-wider">
                        {monthDay(upcomingBirthday.birthday.date)
                          .split(" ")[0]
                          .toUpperCase()}
                      </span>
                      <strong className="font-serif text-xl leading-tight text-[#43483e]">
                        {upcomingBirthday.birthday.date.getDate()}
                      </strong>
                      <i className="mt-0.5 text-[6px] not-italic">
                        {upcomingBirthday.birthday.days === 0
                          ? "TODAY"
                          : `IN ${upcomingBirthday.birthday.days} DAYS`}
                      </i>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Avatar
                        initials={initials(upcomingBirthday.volunteer)}
                        id={upcomingBirthday.volunteer.id}
                        large
                      />
                      <div className="flex min-w-0 flex-col gap-1">
                        <strong className="truncate text-[10px] font-semibold text-[#40453d]">
                          {upcomingBirthday.volunteer.firstName}{" "}
                          {upcomingBirthday.volunteer.lastName}
                        </strong>
                        <span className="text-[8px] text-[#98998f]">
                          {getMinistryName(upcomingBirthday.volunteer)}
                        </span>
                      </div>
                    </div>
                    <div className="grid size-7 place-items-center rounded-lg bg-[#efe7da] text-[#ae8758]">
                      <Cake size={19} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    {birthdays.slice(1, 5).map(({ volunteer, birthday }) => (
                      <div
                        className="flex min-h-[45px] items-center gap-2 border-b border-[#f1f0eb]"
                        key={volunteer.id}
                      >
                        <div className="flex w-7 flex-col items-center text-[#a8a99f]">
                          <strong className="text-[11px] font-semibold text-[#60655a]">
                            {birthday.date.getDate()}
                          </strong>
                          <span className="text-[7px] uppercase">
                            {new Intl.DateTimeFormat("en", {
                              month: "short",
                            }).format(birthday.date)}
                          </span>
                        </div>
                        <Avatar
                          initials={initials(volunteer)}
                          id={volunteer.id}
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <strong className="truncate text-[10px] font-semibold text-[#40453d]">
                            {volunteer.firstName} {volunteer.lastName}
                          </strong>
                          <span className="text-[8px] text-[#98998f]">
                            {getMinistryName(volunteer)}
                          </span>
                        </div>
                        <span className="text-[8px] text-[#a0a096]">
                          {birthday.days === 0
                            ? "Today"
                            : `${birthday.days} days`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex h-[31px] items-center justify-center gap-1.5 rounded-lg border border-[#e5e8df] bg-[#f8f9f5] text-[9px] font-semibold text-[#68795b]">
                    <Cake size={15} /> Birthday data is read from volunteer
                    profiles
                  </div>
                </>
              ) : (
                <p className="mt-5 text-[11px] leading-relaxed text-[#85877d]">
                  No upcoming birthdays found. Birthdays appear when dateOfBirth
                  is included in the volunteer API response.
                </p>
              )}
            </section>
          </div>
          <div className="mb-[15px] grid grid-cols-[minmax(0,1fr)_minmax(0,.92fr)] gap-[15px] max-[740px]:grid-cols-1 max-[740px]:gap-[11px]">
            <section className="overflow-hidden rounded-xl border mx-4 mt-6 md:m-6 border border-slate-800 bg-[#17191f] text-white backdrop-blur-md p-[19px] max-[740px]:p-4">
              <SectionHeading
                title="Volunteers"
                detail="Current service participation from your API"
                action="View all"
              />
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="text-[8px] tracking-[.65px] text-[#a0a196]">
                      <th className="pb-2.5 pl-0 pr-2.5 font-semibold">
                        VOLUNTEER
                      </th>
                      <th className="px-2.5 pb-2.5 font-semibold">MINISTRY</th>
                      <th className="px-2.5 pb-2.5 font-semibold">ATTENDED</th>
                      <th className="px-2.5 pb-2.5 font-semibold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVolunteers.slice(0, 6).map((volunteer) => {
                      const record =
                        getServiceRecords(volunteer).find(
                          (item) => item.year === now.getFullYear(),
                        ) ??
                        [...getServiceRecords(volunteer)].sort(
                          (a, b) => (b.year ?? 0) - (a.year ?? 0),
                        )[0];
                      return (
                        <tr
                          className="border-t border-[#f0efe9] text-[9px] text-[#85877d]"
                          key={volunteer.id}
                        >
                          <td className="py-2.5 pl-0 pr-2.5">
                            <div className="flex items-center gap-2">
                              <Avatar
                                initials={initials(volunteer)}
                                id={volunteer.id}
                              />
                              <strong className="text-[9px] font-semibold text-[#454a41]">
                                {volunteer.firstName} {volunteer.lastName}
                              </strong>
                            </div>
                          </td>
                          <td className="px-2.5 py-2.5">
                            {getMinistryName(volunteer)}
                          </td>
                          <td className="px-2.5 py-2.5">
                            <strong className="font-semibold text-[#555b50]">
                              {record?.attended ?? "—"}
                            </strong>
                          </td>
                          <td className="px-2.5 py-2.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef2eb] px-2 py-1 text-[8px] text-[#6d8061]">
                              <i className="size-[5px] rounded-full bg-[#83966e]" />
                              {volunteer.status ??
                                volunteer.applicationStatus ??
                                "Unknown"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredVolunteers.length === 0 && (
                  <div className="py-6 text-center text-[11px] text-[#888]">
                    No volunteers match “{query}”.
                  </div>
                )}
              </div>
            </section>
            <section className="rounded-xl  mx-4 mt-6 md:m-6 border border-slate-800 bg-[#17191f] text-white backdrop-blur-md p-[19px] max-[740px]:p-4">
              <SectionHeading
                title="Volunteer spotlight"
                detail="Recognition based on service attendance"
              />
              {topPerformer ? (
                <div className="mt-3.5">
                  <div className="inline-flex items-center gap-1 rounded-md bg-[#f2eddf] px-2 py-1 text-[7px] font-bold tracking-[.6px] text-[#a17d48]">
                    <Star size={13} fill="currentColor" /> TOP SERVICE
                    ATTENDANCE · {topPerformer.record?.year}
                  </div>
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="relative">
                      <Avatar
                        initials={initials(topPerformer.volunteer)}
                        id={topPerformer.volunteer.id}
                        large
                      />
                      <span className="absolute -right-0.5 -bottom-0.5 grid size-[17px] place-items-center rounded-full border-2 border-[#fbfaf6] bg-[#bb955c] text-white">
                        <Star size={10} fill="currentColor" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-[17px] font-normal text-[#393f36]">
                        {topPerformer.volunteer.firstName}{" "}
                        {topPerformer.volunteer.lastName}
                      </h3>
                      <p className="mt-1 text-[8px] text-[#92938a]">
                        {getMinistryName(topPerformer.volunteer)}
                      </p>
                    </div>
                    <button
                      className="grid size-[30px] place-items-center rounded-md text-[#8a8d82]"
                      aria-label="More performer options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 border-y border-[#eeede5] py-2">
                    <div className="flex flex-col gap-1 border-r border-[#eeede5]">
                      <strong className="font-serif text-sm font-normal text-[#42483d]">
                        {topPerformer.attended}
                      </strong>
                      <span className="text-[7px] text-[#999a90]">
                        Attendances
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 border-r border-[#eeede5] pl-3">
                      <strong className="font-serif text-sm font-normal text-[#42483d]">
                        {topPerformer.record?.commitment ?? "—"}
                      </strong>
                      <span className="text-[7px] text-[#999a90]">
                        Commitment
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 pl-3">
                      <strong className="font-serif text-sm font-normal text-[#42483d]">
                        {topPerformer.record?.absent ?? 0}
                      </strong>
                      <span className="text-[7px] text-[#999a90]">
                        Absences
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-[11px] leading-relaxed text-[#85877d]">
                  The spotlight is calculated from
                  VolunteerServiceRecord.attended. Include service records in
                  the volunteer response to show a top performer.
                </p>
              )}
            </section>
          </div>
          <footer className="flex justify-between gap-3 px-0.5 py-4 text-[8px] text-[#a3a49b] max-[740px]:text-[7px]">
            <span>Live dashboard · data provided by your volunteer API</span>
            <span className="flex items-center gap-1 text-[#90987e]">
              Serving together <Heart size={12} fill="currentColor" />
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
