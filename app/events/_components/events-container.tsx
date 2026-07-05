"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Search,
  Plus,
  Ellipsis,
  Edit,
  Archive,
  Trash2,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import { useMinistries } from "@/app/services/ministries";
import { useEvents } from "@/app/services/event";
import { useRouter } from "next/navigation";
import { EventSkeletonGrid } from "./event-skeleton-grid";

export default function Events({ user }: any) {
  const {
    events,
    isError,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    archiveEvent,
  } = useEvents();
  const { data: ministries = [] } = useMinistries();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const isAdmin = user?.role === "ADMIN";

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    ministryId: null as number | null,
  });

  // ---------------- Filtered Events ----------------
  const filteredEvents = useMemo(() => {
    return events
      .filter((e: any) => e.status !== "ARCHIVED")
      .filter((e: any) => {
        const matchesSearch =
          !searchQuery ||
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "upcoming" && e.status === "UPCOMING") ||
          (statusFilter === "past" && e.status === "COMPLETED");

        return matchesSearch && matchesStatus;
      });
  }, [events, searchQuery, statusFilter]);

  const getEventStatus = (status: string) => {
    switch (status) {
      case "ONGOING":
        return {
          label: "Ongoing",
          className: "bg-green-800/20 text-green-300",
        };
      case "UPCOMING":
        return { label: "Upcoming", className: "bg-blue-800/20 text-blue-300" };
      case "COMPLETED":
        return { label: "Past", className: "bg-gray-700/40 text-gray-300" };
      case "CANCELLED":
        return { label: "Cancelled", className: "bg-red-800/20 text-red-300" };
      default:
        return { label: "Unknown", className: "bg-gray-700/40 text-gray-300" };
    }
  };

  // ---------------- Handlers ----------------
  const handleCreateEvent = () => {
    if (!form.title || !form.startDate || !form.endDate) return;
    createEvent(form);
    setIsAddDialogOpen(false);
    setForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      ministryId: null,
    });
  };

  // const handleEditEvent = () => {
  //   if (!editEvent) return;
  //   updateEvent(editEvent);
  //   setEditEvent(null);
  // };

  const handleDeleteEvent = () => {
    if (!deleteId) return;
    deleteEvent(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="flex">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Event Controls */}
        <Card className="mx-4 mt-6 md:m-6 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
          <CardContent className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-gray-400">
                Manage church events and activities
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md"
                />
              </div>
              <NativeSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md"
              >
                <NativeSelectOption
                  value="all"
                  className="bg-blue-500/20 text-black"
                >
                  All Events
                </NativeSelectOption>
                <NativeSelectOption
                  value="upcoming"
                  className="bg-blue-500/20 text-black"
                >
                  Upcoming
                </NativeSelectOption>
                <NativeSelectOption
                  value="past"
                  className="bg-blue-500/20 text-black"
                >
                  Past
                </NativeSelectOption>
              </NativeSelect>

              {isAdmin && (
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-blue-500 border border-blue-500/30 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Table */}
        <Card className="mx-4 mt-6 md:m-6 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="py-3 px-6 text-left text-gray-400">
                        Event Details
                      </th>
                      <th className="py-3 px-6 text-left text-gray-400">
                        Start - End
                      </th>
                      <th className="py-3 px-6 text-left text-gray-400">
                        Status
                      </th>
                      <th className="py-3 px-6 text-right text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEvents.map((event: any) => {
                      const status = getEventStatus(event.status);

                      return (
                        <tr
                          key={event.id}
                          className="border-t border-white/10 hover:bg-gray-600 cursor-pointer"
                        >
                          <td className="py-4 px-6">
                            <Link href={`/events/${event.id}`}>
                              <p className="font-medium hover:underline cursor-pointer">
                                {event.title}
                              </p>
                            </Link>
                            <Link href={`/events/${event.id}`}>
                              <p className="text-sm text-gray-400 line-clamp-1 hover:underline">
                                {event.description}
                              </p>
                            </Link>
                          </td>

                          <td className="py-4 px-6 text-sm">
                            {new Date(event.startDate).toLocaleString()}
                            <br />
                            {new Date(event.endDate).toLocaleString()}
                          </td>

                          <td className="py-4 px-6">
                            <Badge className={`${status.className}`}>
                              {status.label}
                            </Badge>
                          </td>

                          <td
                            className="py-4 px-6 text-right"
                            onClick={(e) => e.stopPropagation()} // ✅ prevent row click
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-gray-600 cursor-pointer rounded">
                                  <Ellipsis className="w-5 h-5" />
                                </button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent className="bg-gray-800 text-white border border-gray-700">
                                {/* EDIT */}
                                <DropdownMenuItem
                                  onClick={() => setEditEvent(event)}
                                  className="cursor-pointer hover:bg-gray-700"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>

                                {/* ARCHIVE */}
                                <DropdownMenuItem
                                  onClick={() => archiveEvent(event.id)}
                                  className="cursor-pointer hover:bg-gray-700 text-green-600"
                                  disabled
                                >
                                  <Check className="w-4 h-4 mr-2 " />
                                  Mark as done
                                </DropdownMenuItem>

                                {/* DELETE */}
                                <DropdownMenuItem
                                  onClick={() => setDeleteId(event.id)}
                                  className="text-red-400 cursor-pointer hover:bg-gray-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                          <Dialog
                            open={!!editEvent}
                            onOpenChange={() => setEditEvent(null)}
                          >
                            <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                            <DialogContent className="bg-blue-500/10 border border-blue-500/30 text-white">
                              <DialogHeader>
                                <DialogTitle>Edit Event</DialogTitle>
                              </DialogHeader>

                              <div className="space-y-4 mt-4">
                                <Label>Title</Label>
                                <Input
                                  value={form.title}
                                  onChange={(e) =>
                                    setForm({ ...form, title: e.target.value })
                                  }
                                />

                                <Label>Description</Label>
                                <Textarea
                                  value={form.description}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="flex justify-end gap-3 mt-6">
                                <Button
                                  onClick={() => setEditEvent(null)}
                                  className="bg-red-600"
                                >
                                  Cancel
                                </Button>

                                <Button
                                  onClick={() => {
                                    updateEvent({
                                      id: editEvent.id,
                                      ...form,
                                    });
                                    setEditEvent(null);
                                  }}
                                  className="bg-blue-600"
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="grid gap-4 md:hidden p-4">
                {filteredEvents.map((event: any) => {
                  const status = getEventStatus(event.status);

                  return (
                    <div
                      key={event.id}
                      className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 cursor-pointer"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <Link href={`/events/${event.id}`}>
                          <p className="font-medium hover:underline cursor-pointer">
                            {event.title}
                          </p>
                        </Link>

                        <Badge className={status.className}>
                          {status.label}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {event.description}
                      </p>

                      <p className="text-xs text-gray-300 mt-3">
                        {new Date(event.startDate).toLocaleString()}
                      </p>

                      <p className="text-xs text-gray-300">
                        {new Date(event.endDate).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <DialogContent className="w-full  bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Add a title"
              />

              <Label>Ministry</Label>
              <NativeSelect
                value={form.ministryId ?? "all"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ministryId:
                      e.target.value === "all" ? null : Number(e.target.value),
                  })
                }
                className="bg-blue-500/20  text-white"
              >
                <NativeSelectOption value="all" className="">
                  All Ministries
                </NativeSelectOption>
                {ministries.map((m: any) => (
                  <NativeSelectOption
                    className="bg-blue-600/20 text-black"
                    key={m.id}
                    value={m.id}
                  >
                    {m.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>

              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Add a description..."
              />

              <Label>Start Date & Time</Label>
              <Input
                className="text-white bg-blue-900/30 border border-blue-500/30"
                type="datetime-local"
                value={form.startDate + "T" + form.startTime}
                onChange={(e) => {
                  const [date, time] = e.target.value.split("T");
                  setForm({ ...form, startDate: date, startTime: time });
                }}
              />

              <Label>End Date & Time</Label>
              <Input
                type="datetime-local"
                className="text-white bg-blue-900/30 border border-blue-500/30"
                value={form.endDate + "T" + form.endTime}
                onChange={(e) => {
                  const [date, time] = e.target.value.split("T");
                  setForm({ ...form, endDate: date, endTime: time });
                }}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="bg-red-500/20 border-none"
              >
                Cancel
              </Button>
              <Button className="bg-blue-500/20" onClick={handleCreateEvent}>
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        {deleteId && (
          <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <DialogContent className="bg-gray-800 border border-gray-700 text-white">
              <p>Are you sure you want to delete this event?</p>
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  className="cursor-pointer"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 cursor-pointer"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
