"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useArchivedVolunteers } from "@/app/services/archive-volunteer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  List,
  LayoutGrid,
  ChevronLeft,
  Search as SearchIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/app/hooks/useDebounce";

type ViewMode = "grid" | "list";

export default function Archived({ user }: any) {
  const { data: volunteers = [], isLoading, isError } = useArchivedVolunteers();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // ✅ Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ✅ Filter volunteers based on debounced search
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((v: any) =>
      `${v.firstName} ${v.lastName} ${v.email}`
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase())
    );
  }, [volunteers, debouncedSearchTerm]);

  // Show skeleton while typing
  const isTyping = searchTerm !== debouncedSearchTerm;

  if (isLoading || isTyping) return <ArchivedSkeleton viewMode={viewMode} />;

  if (isError)
    return (
      <p className="text-red-400 text-center mt-4">
        Failed to load archived volunteers
      </p>
    );

  return (
    <>
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex lg:items-center gap-2 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-yellow-400">
            Archived Volunteers
          </h1>
          <div className="flex lg:flex-row flex-col gap-2 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 rounded-md border border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
              <SearchIcon className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-row flex">
              <Button
                variant={viewMode === "grid" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" /> Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" /> Table
              </Button>
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {filteredVolunteers.map((v: any) => (
              <Card
                key={v.id}
                className="bg-gray-800 border-gray-700 p-4 flex flex-col items-center gap-3"
              >
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${v.email}`}
                  />
                  <AvatarFallback>
                    {v.firstName[0]}
                    {v.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-yellow-400">
                  {v.firstName} {v.lastName}
                </h3>
                <p className="text-sm text-gray-400">{v.email}</p>
                <p className="text-sm text-gray-400">
                  {v.ministryName || "No Ministry"}
                </p>
                <p className="text-xs text-gray-500">
                  Joined:{" "}
                  {new Date(v.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-800 mx-4 border-gray-700 mt-4 overflow-x-auto p-4">
            <table className="w-full text-gray-100">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-left text-gray-400">
                    Volunteer
                  </th>
                  <th className="py-3 px-4 text-left text-gray-400">Email</th>
                  <th className="py-3 px-4 text-left text-gray-400">
                    Ministry
                  </th>
                  <th className="py-3 px-4 text-left text-gray-400">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((v: any) => (
                  <tr
                    key={v.id}
                    className="border-b border-gray-700 hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${v.email}`}
                        />
                        <AvatarFallback>
                          {v.firstName[0]}
                          {v.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-100">
                          {v.firstName} {v.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{v.email}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {v.ministryName || "No Ministry"}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(v.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </>
  );
}

function ArchivedSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "grid") {
    return (
      <div className="grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-40 rounded-lg bg-gray-700 animate-pulse"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-1/3 mb-6" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-16 mb-4 rounded-lg bg-gray-700 animate-pulse"
        />
      ))}
    </div>
  );
}
