"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  LayoutGrid,
  List,
  Users,
  CheckCircle2,
  Clock,
  Zap,
  Trash,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AddVolunteerDialog } from "./add-volunteers-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useMinistries } from "@/app/services/ministries";
import {
  useVolunteers,
  useDeleteVolunteer,
  useUpdateVolunteer,
} from "@/app/services/volunteer";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { VolunteerWithBookings } from "@/app/types/volunteer";
import { toast } from "sonner";
import { th } from "date-fns/locale";
import { ExistingVolunteerSelector } from "./existing-volunteer";
import { AddPastoralAssignmentDialog } from "./add-pastoral";
import { useDebounce } from "@/app/hooks/useDebounce";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const cloudinaryOptimized = (url: string) => {
  if (!url) return url;

  // safety check so it won't break non-Cloudinary URLs
  return url.includes("/upload/")
    ? url.replace("/upload/", "/upload/w_160,h_160,c_fill,f_auto,q_auto/")
    : url;
};
type ViewMode = "grid" | "list";
const formatVolunteerCode = (code: string) => {
  if (!code) return "";
  const parts = code.split("-"); // ["SC", "2026", "0001"]
  if (parts.length !== 3) return code;
  const yearLast2 = parts[1].slice(-2); // "26"
  return `${parts[0]}-${yearLast2}-${parts[2]}`;
};
interface MinistryWithVolunteers {
  id: number;
  name: string;
  volunteers: VolunteerWithBookings[];
}
export default function Volunteer({ user }: any) {
  const {
    data: volunteers = [],
    isLoading: loadingVolunteers,
    refetch,
  } = useVolunteers();
  const isStaff = user?.role === "STAFF";
  const isAdmin = user?.role === "ADMIN";
  const deleteVolunteer = useDeleteVolunteer();

  const [selectedVolunteer, setSelectedVolunteer] =
    useState<VolunteerWithBookings | null>(null);
  const [dialogType, setDialogType] = useState<"LITURGICAL" | "PASTORAL">(
    "LITURGICAL",
  );
  const [openPastoralDialog, setOpenPastoralDialog] = useState(false);
  const [ministryTypeFilter, setMinistryTypeFilter] = useState<
    "ALL" | "LITURGICAL" | "PASTORAL"
  >("ALL");
  const { data: ministries = [] } = useMinistries();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    | "name-asc"
    | "name-desc"
    | "lastname-asc"
    | "lastname-desc"
    | "code-asc"
    | "code-desc"
  >("name-asc");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery !== debouncedSearch) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearch]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const allVolunteers = useMemo(() => {
    return volunteers.flatMap((ministry: any) => ministry.volunteers);
  }, [volunteers]);
  const isInitialLoading = loadingVolunteers;
  const isSearchLoading = isSearching;
  const filteredVolunteers = useMemo(() => {
    let result = allVolunteers.filter((v) => {
      const fullName = `${v.firstName || ""} ${v.lastName || ""}`.toLowerCase();
      const email = v.email?.toLowerCase() || "";
      const query = debouncedSearch.toLowerCase();

      const matchesSearch =
        query === "" ||
        fullName.includes(query) ||
        email.includes(query) ||
        v.ministryHistories?.some((h: any) =>
          h?.ministry?.name?.toLowerCase()?.includes(query),
        );

      const matchesStatus = statusFilter === "all" || v.status === statusFilter;

      const matchesType =
        ministryTypeFilter === "ALL" ||
        v.ministryHistories?.some(
          (h: any) => h?.ministry?.type === ministryTypeFilter,
        );

      return matchesSearch && matchesStatus && matchesType;
    });

    // ✅ SORTING
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.firstName || "").localeCompare(b.firstName || "");
        case "name-desc":
          return (b.firstName || "").localeCompare(a.firstName || "");
        case "lastname-asc":
          return (a.lastName || "").localeCompare(b.lastName || "");
        case "lastname-desc":
          return (b.lastName || "").localeCompare(a.lastName || "");
        case "code-asc":
          return (a.volunteerCode || "").localeCompare(b.volunteerCode || "");
        case "code-desc":
          return (b.volunteerCode || "").localeCompare(a.volunteerCode || "");
        default:
          return 0;
      }
    });

    return result;
  }, [
    allVolunteers,
    debouncedSearch,
    statusFilter,
    sortBy,
    ministryTypeFilter,
  ]);

  const perPage = 12;
  const pastoralMinistries = useMemo(() => {
    return ministries.filter((m: any) => m.type === "PASTORAL");
  }, [ministries]);
  const paginatedVolunteers = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredVolunteers.slice(start, start + perPage);
  }, [filteredVolunteers, currentPage]);
  const totalPages = Math.ceil(filteredVolunteers.length / perPage);
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) setCurrentPage(parseInt(pageParam, 10));
  }, [searchParams]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    router.push(`/volunteers?page=${page}`, { scroll: false });
  };
  const handleEdit = (volunteer: any) => {
    setSelectedVolunteer(volunteer);
    setOpenAddDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVolunteer.mutateAsync(id);
      toast("Volunteer Deleted successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = () => {
    if (selectedVolunteer) {
      deleteVolunteer.mutate(selectedVolunteer.id, {
        onSuccess: () => {
          refetch();
          setDeleteDialogOpen(false);
          setSelectedVolunteer(null);
        },
        onError: (err: any) =>
          alert(err.message || "Failed to delete volunteer"),
      });
    }
  };
  const getVolunteerMinistryPath = (volunteer: any) => {
    const ministry = volunteer.ministry;
    if (!ministry) return "-";

    if (ministry.parent) {
      return `${ministry.parent.name} / ${ministry.name}`;
    }

    return ministry.name;
  };
  const getMinistryDisplay = (v: any) => {
    const ministry = v.ministry || v.ministryHistories?.[0]?.ministry;
    if (!ministry) return "-";
    return ministry.parent
      ? `${ministry.parent.name} / ${ministry.name}`
      : ministry.name;
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, sortBy]);

  return (
    <>
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="bg-neutral-900 text-gray-100 p-4 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 backdrop-blur-md rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Volunteer Management
                </h1>
                <p className="text-stone-300">
                  Build, nurture, and empower our community of dedicated
                  servants. Track engagement, manage assignments, and celebrate
                  contributions.
                </p>
              </div>
              <div className="flex gap-2 flex-col md:flex-row flex-shrink-0">
                <Button
                  variant="outline"
                  disabled
                  className="gap-2 border-gray-700 cursor-not-allowed disabled bg-blue-600 text-gray-100 hover:bg-neutral-700"
                >
                  <List className="w-4 h-4" /> Archived
                </Button>
                <AddVolunteerDialog
                  open={openAddDialog}
                  setOpen={setOpenAddDialog}
                  onSuccess={() => {
                    setOpenAddDialog(false);
                    setSelectedVolunteer(null);
                    refetch();
                  }}
                  type={dialogType}
                  user={user}
                />
                <div className="flex gap-2 flex-shrink-0">
                  {/* NEW Pastoral Button */}
                  <Button
                    onClick={() => setOpenPastoralDialog(true)}
                    disabled
                    className="bg-green-600 hover:bg-green-700 w-full text-white"
                  >
                    + Add Pastoral
                  </Button>
                  <AddPastoralAssignmentDialog
                    open={openPastoralDialog}
                    setOpen={setOpenPastoralDialog}
                    volunteers={allVolunteers}
                    onSuccess={refetch}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-500/10 border-blue-500/30 border backdrop-blur-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm mb-1">
                    Total Volunteers
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {allVolunteers.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-500/10 border-green-500/30 border backdrop-blur-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm mb-1">Active Members</p>
                  <p className="text-2xl font-bold text-white">
                    {allVolunteers.filter((v) => v.status === "ACTIVE").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/10 border-amber-500/30 border backdrop-blur-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm mb-1">
                    Inactive Members
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {
                      allVolunteers.filter((v) => v.status === "INACTIVE")
                        .length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/10 border-purple-500/30 border backdrop-blur-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm mb-1">Engagement Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {allVolunteers.length > 0
                      ? Math.round(
                          (allVolunteers.filter((v) => v.status === "ACTIVE")
                            .length /
                            allVolunteers.length) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 backdrop-blur-md rounded-lg p-4">
            <p className="text-sm text-stone-300">
              <span className="font-semibold text-indigo-300">Pro tip:</span>{" "}
              Use the search bar to find volunteers by name, email, or ministry.
              Switch between grid and list views for different perspectives on
              your volunteer community.
            </p>
          </div>

          {/* Filters */}
          <Card className="bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md">
            <CardContent className="p-4 flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search volunteers by name, email, or ministry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full bg-gray-800 border-blue-500/30 border text-white-400 backdrop-blur-md"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-500 backdrop-blur-md text-white"
                      : "bg-blue-600/10 backdrop-blur-md text-white"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-400 backdrop-blur-md text-white"
                      : "bg-blue-600/10 backdrop-blur-md text-white"
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <NativeSelect
                className="md:w-full w-37.5 bg-blue-500/30 backdrop-blur-md text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <NativeSelectOption
                  className="bg-blue-500/20 text-stone-950"
                  value="all"
                >
                  All Status
                </NativeSelectOption>
                <NativeSelectOption
                  value="ACTIVE"
                  className="bg-blue-500/20 text-stone-950"
                >
                  Active
                </NativeSelectOption>
                <NativeSelectOption
                  value="INACTIVE"
                  className="bg-blue-500/20 text-stone-950"
                >
                  Inactive
                </NativeSelectOption>
              </NativeSelect>
              <NativeSelect
                className="md:w-full w-full bg-blue-500/30 backdrop-blur-md text-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <NativeSelectOption
                  value="name-asc"
                  className="bg-blue-500/20 text-stone-950"
                >
                  Name (A → Z)
                </NativeSelectOption>
                <NativeSelectOption
                  value="name-desc"
                  className="bg-blue-500/20 text-stone-950"
                >
                  Name (Z → A)
                </NativeSelectOption>
                <NativeSelectOption
                  value="code-asc"
                  className="bg-blue-500/20 text-stone-950"
                >
                  Code (Ascending)
                </NativeSelectOption>
                <NativeSelectOption
                  value="code-desc"
                  className="bg-blue-500/20 text-stone-950"
                >
                  Code (Descending)
                </NativeSelectOption>
                <NativeSelectOption
                  value="lastname-asc"
                  className="bg-blue-500/20 text-stone-950"
                >
                  Last Name (A → Z)
                </NativeSelectOption>
                <NativeSelectOption
                  value="lastname-desc"
                  className="bg-blue-500/20 text-stone-950"
                >
                  Last Name (Z → A)
                </NativeSelectOption>
              </NativeSelect>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSortBy("name-asc");
                }}
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
              >
                Reset
              </Button>
            </CardContent>
          </Card>
          <p className="text-sm font-bold text-gray-400">
            Showing {filteredVolunteers.length} volunteers
          </p>
          {/* Volunteer Cards / List */}
          {isInitialLoading ? (
            <div className="mt-4  gap-6">
              <div className="mt-4 flex flex-row gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Card
                    key={idx}
                    className="relative w-[500px]  overflow-hidden bg-gray-700 rounded animate-pulse h-[300px] flex flex-col items-center gap-3 justify-center"
                  >
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-lg bg-gray-700" />

                    {/* Name */}
                    <div className="h-4 w-32 bg-gray-700 rounded" />

                    {/* Nickname */}
                    <div className="h-3 w-20 bg-gray-700 rounded" />

                    {/* Badges */}
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-gray-700 rounded" />
                      <div className="h-5 w-16 bg-gray-700 rounded" />
                    </div>

                    {/* Ministry */}
                    <div className="h-3 w-24 bg-gray-700 rounded" />

                    {/* Code */}
                    <div className="h-5 w-20 bg-gray-700 rounded" />
                  </Card>
                ))}
              </div>
            </div>
          ) : filteredVolunteers.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedVolunteers.map((v, idx) => (
                  <Card
                    key={idx}
                    className="bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md p-4 h-[300px] flex flex-col items-center gap-3 justify-center hover:bg-gray-700 transition-colors"
                  >
                    <div className="absolute top-2 right-2 flex gap-2">
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 hover:bg-white/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-40 bg-slate-700 border border-blue-500/30 rounded-lg shadow-lg"
                          >
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/volunteers/${v.id}`);
                              }}
                              className="text-white"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // toggleDismissed(v.id);
                              }}
                              className="text-violet-400 bg-violet-500"
                              disabled
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2 " />
                              Dismiss
                              {/* {dismissedIds.includes(v.id)
                                ? "Undismiss"
                                : "Dismiss"} */}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVolunteer(v);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                      {v.profilePicture || true ? (
                        <Image
                          src={
                            v.profilePicture
                              ? cloudinaryOptimized(v.profilePicture)
                              : `https://api.dicebear.com/7.x/avataaars/png?size=160&seed=${v.email}`
                          }
                          alt={`${v.firstName} ${v.lastName}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiM0MDRiN2YiIC8+PC9zdmc+"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-300">
                          {v.firstName[0]}
                          {v.lastName[0]}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold font-mono text-white">
                      {v.firstName} {v.lastName}
                    </h3>
                    {v.nickname && (
                      <p className="text-sm text-gray-400 italic">
                        {v.nickname}
                      </p>
                    )}
                    <div className="gap-2 flex">
                      <Badge
                        variant="outline"
                        className={
                          v.status === "ACTIVE"
                            ? "border-green-400 bg-green-800 text-green-400"
                            : "border-red-400 bg-red-800 text-red-400"
                        }
                      >
                        {v.status}
                      </Badge>
                      {v.classification && (
                        <Badge
                          variant="outline"
                          className="border-purple-400 bg-purple-900 text-purple-300"
                        >
                          {v.classification}
                        </Badge>
                      )}
                    </div>
                    {/* NEW: Classification */}

                    {isAdmin && (
                      <p className="text-sm text-gray-400 text-center">
                        {getMinistryDisplay(v)}
                      </p>
                    )}
                    <p>
                      <Badge className="bg-purple-900">
                        {formatVolunteerCode(v?.volunteerCode as any)}
                      </Badge>
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-blue-500/10 border-blue-500/30 border backdrop-blur-md mt-4">
                <table className="w-full text-gray-100">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-left">Volunteer Name</th>
                      {isAdmin && (
                        <th className="py-3 px-4 text-left">Ministry</th>
                      )}
                      {isStaff && <th className="py-3 px-4 text-left">Code</th>}
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isInitialLoading || isSearchLoading
                      ? Array.from({ length: 6 }).map((_, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-700 animate-pulse"
                          >
                            <td className="py-3 px-4">
                              <div className="h-4 w-40 bg-gray-700 rounded" />
                            </td>

                            {isAdmin && (
                              <td className="py-3 px-4">
                                <div className="h-3 w-28 bg-gray-700 rounded" />
                              </td>
                            )}

                            {isStaff && (
                              <td className="py-3 px-4">
                                <div className="h-4 w-24 bg-gray-700 rounded" />
                              </td>
                            )}

                            <td className="py-3 px-4">
                              <div className="h-4 w-16 bg-gray-700 rounded" />
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="h-6 w-6 bg-gray-700 rounded ml-auto" />
                            </td>
                          </tr>
                        ))
                      : paginatedVolunteers.map((v) => (
                          <tr
                            key={v.id}
                            className="border-b border-gray-700 hover:bg-gray-800"
                          >
                            <td className="py-3 px-4">
                              {v.firstName} {v.lastName}
                            </td>

                            {isAdmin && (
                              <td className="py-3 px-4">
                                {getMinistryDisplay(v)}
                              </td>
                            )}

                            {isStaff && (
                              <td className="py-3 px-4">
                                {formatVolunteerCode(v.volunteerCode)}
                              </td>
                            )}

                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={
                                  v.status === "ACTIVE"
                                    ? "border-green-400 bg-green-800 text-green-400"
                                    : "border-red-400 bg-red-800 text-red-400"
                                }
                              >
                                {v.status}
                              </Badge>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  router.push(`/volunteers/${v.id}`)
                                }
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </Card>
            )
          ) : (
            <Card className="p-12 text-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 border backdrop-blur-md mt-4">
              <div className="flex flex-col items-center justify-center space-y-3">
                <Users className="w-12 h-12 text-stone-400" />
                <p className="text-gray-300 text-lg">
                  No results found for your filters.
                </p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your search filters or add a new volunteer to
                  get started.
                </p>
              </div>
            </Card>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10 items-center gap-2">
              {/* Previous Button */}
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                className="bg-blue-500/5 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all rounded-lg px-4"
              >
                &laquo; Prev
              </Button>

              {/* Page Numbers */}
              <Pagination>
                <PaginationContent>
                  {/* Previous */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50 cursor-pointer"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Page Numbers */}
                  {totalPages <= 7 ? (
                    Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))
                  ) : (
                    <>
                      {currentPage > 2 && (
                        <>
                          <PaginationItem>
                            <PaginationLink onClick={() => setCurrentPage(1)}>
                              1
                            </PaginationLink>
                          </PaginationItem>
                          {currentPage > 3 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                        </>
                      )}

                      {Array.from({ length: 3 })
                        .map((_, i) => currentPage - 1 + i)
                        .filter((p) => p > 0 && p <= totalPages)
                        .map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              onClick={() => setCurrentPage(p)}
                              isActive={currentPage === p}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                      {currentPage < totalPages - 1 && (
                        <>
                          {currentPage < totalPages - 2 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(totalPages)}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                    </>
                  )}

                  {/* Next */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50 cursor-pointer"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="bg-gray-800 text-gray-100 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-red-400 flex items-center gap-2">
                  <Trash className="w-4 h-4" />
                  Delete Volunteer
                </DialogTitle>

                <DialogDescription className="space-y-2">
                  <p>
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-white">
                      {selectedVolunteer?.firstName}{" "}
                      {selectedVolunteer?.lastName}
                    </span>
                    ?
                  </p>

                  <p className="text-red-400 font-medium">
                    ⚠️ This action is irreversible.
                  </p>

                  <p className="text-gray-400 text-sm">
                    The volunteer will be permanently removed from the system.
                    Their{" "}
                    <span className="text-yellow-400 font-semibold">
                      Volunteer Code
                    </span>{" "}
                    (
                    <span className="font-mono">
                      {selectedVolunteer?.volunteerCode}
                    </span>
                    ) will also be permanently invalid and cannot be reused.
                  </p>
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  Yes, Delete Permanently
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
