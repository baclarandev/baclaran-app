"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Search,
  Plus,
  Calendar,
  Clock,
  Edit,
  Archive,
  Trash2,
  Archive as BoxArchive,
} from "lucide-react";
import Link from "next/link";

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useEvents } from "@/app/services/event";
import { useMinistries } from "@/app/services/ministries";

export default function Events({ user }: any) {
  const { events, createEvent, updateEvent, deleteEvent, archiveEvent } =
    useEvents();
  const { data: ministries = [], isLoading, error } = useMinistries();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });
  const isAdmin = user?.role === "ADMIN";
  const now = new Date();

  const filteredEvents = useMemo(() => {
    return events
      .filter((event: any) => event.status !== "ARCHIVED") // <-- exclude archived
      .filter((event: any) => {
        const matchesSearch =
          searchQuery === "" ||
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === "upcoming") {
          matchesStatus = event.status === "UPCOMING";
        } else if (statusFilter === "past") {
          matchesStatus = event.status === "COMPLETED";
        }

        return matchesSearch && matchesStatus;
      });
  }, [searchQuery, statusFilter, events]);

  const getEventStatus = (
    status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED",
  ) => {
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

  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (e: any) => new Date(e.startDate) >= now,
  ).length;
  const thisMonthEvents = events.filter((e: any) => {
    const start = new Date(e.startDate);
    return (
      start.getMonth() === now.getMonth() &&
      start.getFullYear() === now.getFullYear()
    );
  }).length;

  // ---------------- Create ----------------
  const handleCreateEvent = () => {
    if (!form.title || !form.startDate || !form.endDate) return;

    createEvent({
      title: form.title,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: form.startTime,
      endTime: form.endTime,
    });

    setIsAddDialogOpen(false);
    setForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    });
  };

  // ---------------- Edit ----------------
  const handleEditEvent = () => {
    if (!editEvent) return;
    updateEvent(editEvent);
    setEditEvent(null);
  };

  // ---------------- Delete ----------------
  const handleDeleteEvent = () => {
    if (!deleteId) return;
    deleteEvent(deleteId);
    setDeleteId(null);
  };

  return (
    <>
      <div>
        <Sidebar
          user={user}
          isOpen={sidebarOpen}
          onOpenChange={setSidebarOpen}
       
        />
        <div className="flex-1 flex flex-col md:ml-64">
          <Header
            user={user}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Header / Add */}
          <Card className="bg-gray-800 m-6 border-white/6">
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-gray-400">
                    Organize and manage church events and activities
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="flex flex-col">
                    <div className="flex flex-col lg:flex-row gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search events..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-gray-700 text-gray-100 placeholder-gray-400"
                        />
                      </div>

                      <NativeSelect
                        className="w-40  bg-gray-700 text-gray-100"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <NativeSelectOption value="all">
                          All Events
                        </NativeSelectOption>
                        <NativeSelectOption value="upcoming">
                          Upcoming
                        </NativeSelectOption>
                        <NativeSelectOption value="past">
                          Past
                        </NativeSelectOption>
                      </NativeSelect>
                    </div>
                    <div className="flex flex-row gap-4 pt-4 lg:justify-end">
                      <Link href="/events/archived">
                        <Button className="flex items-center gap-2 bg-stone-900 border border-white hover:shadow-[0_6px_24px_rgba(212,175,55,0.12)]">
                          <BoxArchive className="w-4 h-4 " />
                          <span className="text-gray-100">Archived</span>
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Button
                          onClick={() => setIsAddDialogOpen(true)}
                          className="flex items-center gap-2 bg-white text-black border border-white hover:shadow-[0_6px_24px_rgba(212,175,55,0.12)]"
                        >
                          <Plus className="w-4 h-4 " />
                          <span className="">Add Event</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Create Dialog */}
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                  >
                    <DialogContent className="max-w-lg bg-[#1b1c1f] border-white/6 text-gray-100">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Create New Event
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Fill in the details below to add your event
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        {/* Title */}
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-gray-200">
                            Event Title
                          </Label>
                          <Input
                            id="title"
                            placeholder="Enter event title"
                            value={form.title}
                            onChange={(e) =>
                              setForm({ ...form, title: e.target.value })
                            }
                            className="bg-[#232428] text-gray-100 border-white/6"
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="description"
                            className="text-gray-200"
                          >
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Describe your event..."
                            value={form.description}
                            onChange={(e) =>
                              setForm({ ...form, description: e.target.value })
                            }
                            className="bg-[#232428] text-gray-100 border-white/6"
                          />
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="startDateTime"
                            className="text-gray-200"
                          >
                            Start Date & Time
                          </Label>
                          <Input
                            type="datetime-local"
                            id="startDateTime"
                            value={form.startDate + "T" + form.startTime}
                            onChange={(e) => {
                              const [date, time] = e.target.value.split("T");
                              setForm({
                                ...form,
                                startDate: date,
                                startTime: time,
                              });
                            }}
                            className="bg-[#232428] text-gray-100 border-white/6"
                          />
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="endDateTime"
                            className="text-gray-200"
                          >
                            End Date & Time
                          </Label>
                          <Input
                            type="datetime-local"
                            id="endDateTime"
                            value={form.endDate + "T" + form.endTime}
                            onChange={(e) => {
                              const [date, time] = e.target.value.split("T");
                              setForm({
                                ...form,
                                endDate: date,
                                endTime: time,
                              });
                            }}
                            className="bg-[#232428] text-gray-100 border-white/6"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <Button
                          variant="outline"
                          className="border-white/6 text-gray-100"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-[#2a2b2f] text-white"
                          onClick={handleCreateEvent}
                        >
                          Create Event
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 m-6 md:grid-cols-3 gap-6">
            {" "}
            <Card className="bg-gray-800 border-white/6">
              {" "}
              <CardContent className="p-6 flex items-center gap-4">
                {" "}
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                  {" "}
                  <Calendar className="w-6 h-6 text-[#d4af37]" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="text-sm text-gray-400">Total Events</p>{" "}
                  <p className="text-2xl font-bold text-white">
                    {totalEvents}
                  </p>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>{" "}
            <Card className="bg-gray-800 border-white/6">
              {" "}
              <CardContent className="p-6 flex items-center gap-4">
                {" "}
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                  {" "}
                  <Clock className="w-6 h-6 text-green-300" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="text-sm text-gray-400">Upcoming</p>{" "}
                  <p className="text-2xl font-bold text-white">
                    {" "}
                    {upcomingEvents}{" "}
                  </p>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>{" "}
            <Card className="bg-gray-800 border-white/6">
              {" "}
              <CardContent className="p-6 flex items-center gap-4">
                {" "}
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                  {" "}
                  <Calendar className="w-6 h-6 text-[#eaa84a]" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="text-sm text-gray-400">This Month</p>{" "}
                  <p className="text-2xl font-bold text-white">
                    {" "}
                    {thisMonthEvents}{" "}
                  </p>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>{" "}
          </div>
          {/* Events Table */}
          <Card className="bg-gray-800 m-6 border-white/6">
            <CardHeader>
              <CardTitle className="text-white px-6 py-4">
                Recent Events
              </CardTitle>
            </CardHeader>
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
                    {filteredEvents.map((event: any) => {
                      const status = getEventStatus(event.status);
                      return (
                        <tr
                          key={event.id}
                          className="border-t border-white/6 hover:bg-gray-600 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
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
                            </div>
                          </td>
                          <td className="py-4 px-6 text-white text-sm">
                            {new Date(event.startDate).toLocaleString()} -{" "}
                            {new Date(event.endDate).toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              className={`px-3 py-1 rounded-full ${status.className}`}
                            >
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditEvent(event)}
                              >
                                <Edit className="w-4 h-4 text-[#d4af37]" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteId(event.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => archiveEvent(event.id)}
                              >
                                <Archive className="w-4 h-4 text-orange-300" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={!!editEvent} onOpenChange={() => setEditEvent(null)}>
            <DialogContent className="bg-gray-800 border border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-200">Edit Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-gray-300">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  placeholder="Title"
                  value={editEvent?.title || ""}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, title: e.target.value })
                  }
                  className="text-gray-300"
                />
                <Label htmlFor="edit-description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  placeholder="Description"
                  value={editEvent?.description || ""}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, description: e.target.value })
                  }
                  className="text-gray-300"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  className="bg-red-500 text-white cursor-pointer"
                  onClick={() => setEditEvent(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gray-400 cursor-pointer"
                  onClick={handleEditEvent}
                >
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <DialogContent className="bg-gray-800 border border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Delete Event?</DialogTitle>
              </DialogHeader>
              <p className="text-white">
                Are you sure you want to delete this event? This action cannot
                be undone.
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
      </div>
    </>
  );
}
