"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Divide,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { EventSkeletonGrid } from "../../_components/event-skeleton-grid";

interface ArchivedEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  archived: boolean;
}

interface PaginationData {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function EventArchive({ user }: any) {
  const [events, setEvents] = useState<ArchivedEvent[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const pageSize = 9;

  useEffect(() => {
    fetchArchivedEvents(currentPage);
  }, [currentPage]);

  const fetchArchivedEvents = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/events/archived?page=${page}&pageSize=${pageSize}`,
      );
      const result = await response.json();

      if (result.data) {
        setEvents(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch archived events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/events/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refetch current page
        fetchArchivedEvents(currentPage);
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage > 0 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };
  return (
    <>
      <div>
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col md:ml-64">
          <Header user={user} />
          {/* Header */}
          <Card className="bg-gray-800 m-4 border-white/6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-white">Archived Events</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "card" ? "outline" : "default"}
                    onClick={() => setViewMode("card")}
                    className="text-xs bg-stone-900 text-white"
                  >
                    Card View
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "outline" : "default"}
                    onClick={() => setViewMode("table")}
                    className="text-xs bg-white text-black"
                  >
                    Table View
                  </Button>
                </div>
              </div>
              {pagination && (
                <p className="text-sm text-gray-400 mt-2">
                  Total: {pagination.totalCount} events
                </p>
              )}
            </CardHeader>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="m-4">
              <EventSkeletonGrid />
            </div>
          )}

          {/* Card View */}
          {!isLoading && viewMode === "card" && (
            <div className="grid grid-cols-1 m-4 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className="bg-gray-800 border-white/6 hover:border-white/12 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-[#d4af37]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-white line-clamp-2">
                            {event.title}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-gray-300">
                        <div>
                          <span className="text-gray-400">Start:</span>{" "}
                          {new Date(event.startDate).toLocaleString()}
                        </div>
                        <div>
                          <span className="text-gray-400">End:</span>{" "}
                          {new Date(event.endDate).toLocaleString()}
                        </div>
                      </div>

                      <Badge className="bg-gray-700/40 text-gray-300 w-fit">
                        Archived
                      </Badge>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(event.id)}
                        className="w-full mt-2 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Table View */}
          {!isLoading && viewMode === "table" && (
            <Card className="bg-gray-800 m-4 border-white/6">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="text-left py-3 px-6 font-medium text-gray-400">
                          Event Details
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-400">
                          Start - End
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-400">
                          Status
                        </th>
                        <th className="text-right py-3 px-6 font-medium text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr
                          key={event.id}
                          className="border-t border-white/6 hover:bg-gray-600 transition-colors"
                        >
                          <td className="py-4 px-6 flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-[#d4af37]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white">
                                {event.title}
                              </p>
                              <p className="text-sm text-gray-400 line-clamp-1">
                                {event.description}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-white text-sm">
                            {new Date(event.startDate).toLocaleString()} -{" "}
                            {new Date(event.endDate).toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <Badge className="px-3 py-1 rounded-full bg-gray-700/40 text-gray-300">
                              Archived
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(event.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && events.length === 0 && (
            <Card className="bg-gray-800 border-white/6 m-4">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">No archived events yet</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Card className="bg-gray-800 border-white/6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-sm text-gray-400">
                    Page {pagination.page} of {pagination.totalPages} • Showing{" "}
                    {events.length} of {pagination.totalCount} events
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: pagination.totalPages }).map(
                        (_, i) => (
                          <Button
                            key={i + 1}
                            variant={
                              currentPage === i + 1 ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(i + 1)}
                            className="min-w-[40px]"
                          >
                            {i + 1}
                          </Button>
                        ),
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="bg-gray-800 border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Delete Event?</DialogTitle>
            </DialogHeader>
            <p className="text-white">
              Are you sure you want to permanently delete this archived event?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                onClick={() => setDeleteId(null)}
                className="bg-gray-700 text-white cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white cursor-pointer"
                onClick={handleDeleteEvent}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
