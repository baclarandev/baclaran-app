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

type ViewMode = "grid" | "list";
const cloudinaryOptimized = (url: string) => {
  if (!url) return url;

  // safety check so it won't break non-Cloudinary URLs
  return url.includes("/upload/")
    ? url.replace(
        "/upload/",
        "/upload/w_160,h_160,c_fill,f_auto,q_auto/"
      )
    : url;
};
export default function Volunteer({ user }: any) {
  const {
    data: volunteers = [],
    isLoading: loadingVolunteers,
    refetch,
  } = useVolunteers();
  const { data: ministries = [] } = useMinistries();
  const deleteVolunteer = useDeleteVolunteer();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [currentPage, setCurrentPage] = useState(1);

const searchParams = useSearchParams();
const router = useRouter();

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((v) => {
      const matchesSearch =
        searchQuery === "" ||
        `${v.firstName} ${v.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.ministryName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || v.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [volunteers, searchQuery, statusFilter]);
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

  return (
    <>
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="bg-gray-900 text-gray-100 p-4">
          {/* Header + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-400">
                Manage and track church volunteers
              </p>
            </div>
            <div className="flex gap-2 mb-5">
              <Link href="/volunteers/archived">
                <Button
                  variant="outline"
                  className="gap-2 border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  <List className="w-4 h-4" /> Archived
                </Button>
              </Link>

              <AddVolunteerDialog
                open={openAddDialog}
                setOpen={setOpenAddDialog}
                onSuccess={() => {
                  setOpenAddDialog(false);
                  setSelectedVolunteer(null);
                  refetch();
                }}
              />
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search volunteers by name, email, or ministry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 text-gray-100 placeholder-gray-400"
                />
              </div>

             <div className="flex gap-2">
  <button
    onClick={() => setViewMode("grid")}
    className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
      viewMode === "grid"
        ? "bg-yellow-400 text-gray-900"
        : "bg-gray-700 text-gray-100 hover:bg-gray-600"
    }`}
    title="Grid view"
  >
    <LayoutGrid className="w-5 h-5" />
  </button>

  <button
    onClick={() => setViewMode("list")}
    className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
      viewMode === "list"
        ? "bg-yellow-400 text-gray-900"
        : "bg-gray-700 text-gray-100 hover:bg-gray-600"
    }`}
    title="List view"
  >
    <List className="w-5 h-5" />
  </button>
</div>

              <NativeSelect
                className="w-[150px] bg-gray-700 text-gray-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <NativeSelectOption value="all">All Status</NativeSelectOption>
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
                  className="bg-gray-800 border-gray-700 animate-pulse h-[320px]"
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
                   <Card className="bg-gray-800 border-gray-700 p-4 h-[300px] flex flex-col items-center gap-3 justify-center hover:bg-gray-700 transition-colors">
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
          <h3 className="font-semibold text-yellow-400">
            {v.firstName} {v.lastName}
          </h3>
          <Badge
            variant="outline"
            className={
              v.status === "Active"
                ? "border-green-400 bg-green-800 text-green-400"
                : "border-red-400 bg-red-800 text-red-400"
            }
          >
            {v.status}
          </Badge>
          <p
            className="text-sm text-center text-gray-400 line-clamp-2"
            title={v.ministryName}
          >
            {v.ministryName}
          </p>
        </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800 mt-4 border-gray-700 overflow-x-auto">
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
                        className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                      >
      <td className="py-3 px-4 flex items-center gap-3">
  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
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
  <span>{v.firstName} {v.lastName}</span>
</td>
                        <td className="py-3 px-4">{v.ministryName}</td>
                        <td className="py-3 px-4">{v.email}</td>
                        <td className="py-3 px-4">{v.status}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(v)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(v)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )
          ) : (
            <Card className="p-12 text-center bg-gray-800 border-gray-700 mt-4">
              <p className="text-gray-400">No volunteers found.</p>
            </Card>
          )}
         {totalPages > 1 && (
  <div className="flex justify-center mt-6 items-center gap-2 text-gray-100">
    {/* Previous Button */}
    <Button
      size="sm"
      variant="ghost"
      disabled={currentPage === 1}
      onClick={() => goToPage(currentPage - 1)}
    >
      &laquo; Prev
    </Button>

    {/* Page Numbers */}
    {Array.from({ length: totalPages }).map((_, idx) => {
      const page = idx + 1;

      // Show only first, last, current, and +/- 1 pages with ellipsis
      if (
        page === 1 ||
        page === totalPages ||
        (page >= currentPage - 1 && page <= currentPage + 1)
      ) {
        return (
          <Button
            key={page}
            size="sm"
            variant={currentPage === page ? "secondary" : "ghost"}
            onClick={() => goToPage(page)}
          >
            {page}
          </Button>
        );
      } else if (
        page === currentPage - 2 ||
        page === currentPage + 2
      ) {
        return <span key={page} className="px-2">...</span>;
      } else {
        return null;
      }
    })}

    {/* Next Button */}
    <Button
      size="sm"
      variant="ghost"
      disabled={currentPage === totalPages}
      onClick={() => goToPage(currentPage + 1)}
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
