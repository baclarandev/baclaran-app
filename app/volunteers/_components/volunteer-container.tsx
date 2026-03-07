"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Download,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  Zap,
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

  const deleteVolunteer = useDeleteVolunteer();

  const [selectedVolunteer, setSelectedVolunteer] =
    useState<VolunteerWithBookings | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const router = useRouter();
  const allVolunteers = useMemo(() => {
    return volunteers.flatMap((ministry: any) => ministry.volunteers);
  }, [volunteers]);
  const filteredVolunteers = useMemo(() => {
    return allVolunteers.filter((v) => {
      const matchesSearch =
        searchQuery === "" ||
        `${v.firstName} ${v.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.ministryHistories?.some((h: any) =>
          h.ministry.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesStatus = statusFilter === "all" || v.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allVolunteers, searchQuery, statusFilter]);
  const perPage = 12;

  const paginatedVolunteers = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredVolunteers.slice(start, start + perPage);
  }, [filteredVolunteers, currentPage]);
  const totalPages = Math.ceil(filteredVolunteers.length / perPage);
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) setCurrentPage(parseInt(pageParam, 10));
  }, [searchParams]);
  console.log(paginatedVolunteers);
  const goToPage = (page: number) => {
    setCurrentPage(page);
    router.push(`/volunteers?page=${page}`, { scroll: false });
  };
  const handleEdit = (volunteer: any) => {
    setSelectedVolunteer(volunteer);
    setOpenAddDialog(true);
  };

  const handleDelete = (volunteer: any) => {
    setSelectedVolunteer(volunteer);
    setDeleteDialogOpen(true);
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
              <div className="flex gap-2 flex-shrink-0">
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
                  user={user}
                />
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
                    {volunteers.filter((v) => v.status === "ACTIVE").length}
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
                    {volunteers.filter((v) => v.status === "INACTIVE").length}
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
                    {volunteers.length > 0
                      ? Math.round(
                          (volunteers.filter((v) => v.status === "ACTIVE")
                            .length /
                            volunteers.length) *
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
                  className="pl-10 bg-gray-800 border-blue-500/30 border text-white-400 backdrop-blur-md"
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
                className="w-37.5 bg-blue-500/30 backdrop-blur-md text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <NativeSelectOption className="bg-blue-500/20" value="all">
                  All Status
                </NativeSelectOption>
                <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
                <NativeSelectOption value="INACTIVE">
                  Inactive
                </NativeSelectOption>
              </NativeSelect>
            </CardContent>
          </Card>

          {/* Volunteer Cards / List */}
          {loadingVolunteers ? (
            <div className="grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md animate-pulse h-[320px]"
                />
              ))}
            </div>
          ) : filteredVolunteers.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedVolunteers.map((v) => (
                  <Link
                    key={v.id}
                    href={`/volunteers/${v.id}`}
                    className="block"
                  >
                    <Card className="bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md p-4 h-[300px] flex flex-col items-center gap-3 justify-center hover:bg-gray-700 transition-colors">
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
                      <p className="text-sm text-gray-400 text-center">
                        {getMinistryDisplay(v)}
                      </p>
                      <p>
                        <Badge className="bg-purple-900">
                          {formatVolunteerCode(v?.volunteerCode as any)}
                        </Badge>
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md mt-4 overflow-x-auto">
                <table className="w-full text-gray-100">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-left">Volunteer</th>
                      <th className="py-3 px-4 text-left">Ministry</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVolunteers.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b bg-blue-700/10 border-blue-500/30 border text-white-400 backdrop-blur-md hover:bg-blue-400/20 "
                      >
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-blue-500/10 backdrop-blur-md flex items-center justify-center">
                            {v.profilePicture ? (
                              <Image
                                src={cloudinaryOptimized(v.profilePicture)}
                                alt={`${v.firstName} ${v.lastName}`}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-gray-300">
                                {v.firstName[0]}
                                {v.lastName[0]}
                              </span>
                            )}
                          </div>
                          <span>
                            {v.firstName} {v.lastName}
                          </span>
                        </td>
                        <p className="text-sm text-gray-400 text-center">
                          {getMinistryDisplay(v)}
                        </p>
                        <td className="py-3 px-4">{v.email}</td>
                        <td className="py-3 px-4">{v.status}</td>
                        <td className="py-3 px-4 flex gap-2">
                          {/* <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(v)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button> */}
                      
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
                <p className="text-gray-300 text-lg">No volunteers found.</p>
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
              <div className="flex items-center gap-2 mx-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;

                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg transition-all border ${
                          currentPage === page
                            ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20"
                            : "bg-blue-500/5 border-blue-500/20 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400"
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span
                        key={page}
                        className="text-blue-500/50 px-1 font-bold"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Next Button */}
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="bg-blue-500/5 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all rounded-lg px-4"
              >
                Next &raquo;
              </Button>
            </div>
          )}

          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="bg-gray-800 text-gray-100 border-gray-700">
              <DialogHeader>
                <DialogTitle>Delete Volunteer</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedVolunteer?.firstName}{" "}
                  {selectedVolunteer?.lastName}?
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
                  className="bg-red-600"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
