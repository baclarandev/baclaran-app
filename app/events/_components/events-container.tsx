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
} from "@/components/ui/dialog";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Search, Plus, Edit, Archive, Trash2 } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import { useMinistries } from "@/app/services/ministries";
import { useEvents } from "@/app/services/event";
import { useRouter } from "next/navigation";

export default function Events({ user }: any) {
  const { events, createEvent, deleteEvent, archiveEvent } = useEvents();
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
        <Card className="m-6 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
          <CardContent className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <p className="text-gray-400">
                Manage church events and activities
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md"
                />
              </div>
              <NativeSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md"
              >
                <NativeSelectOption value="all">All Events</NativeSelectOption>
                <NativeSelectOption value="upcoming">
                  Upcoming
                </NativeSelectOption>
                <NativeSelectOption value="past">Past</NativeSelectOption>
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
        <Card className="m-6 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
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
                        className="border-t border-white/6 hover:bg-gray-600 cursor-pointer"
                        onClick={() => router.push(`/events/${event.id}`)}
                      >
                        <td className="py-4 px-6">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-400 line-clamp-1">
                            {event.description}
                          </p>
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
                        <td className="py-4 px-6 text-right flex gap-2 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              setDeleteId(event.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              archiveEvent(event.id);
                            }}
                          >
                            <Archive className="w-4 h-4 text-orange-300" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
              >
                <NativeSelectOption value="all">
                  All Ministries
                </NativeSelectOption>
                {ministries.map((m: any) => (
                  <NativeSelectOption key={m.id} value={m.id}>
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
              />

              <Label>Start Date & Time</Label>
              <Input
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
              >
                Cancel
              </Button>
              <Button onClick={handleCreateEvent}>Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        {deleteId && (
          <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <DialogContent className="bg-gray-800 border border-gray-700 text-white">
              <p>Are you sure you want to delete this event?</p>
              <div className="flex justify-end gap-3 mt-4">
                <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button onClick={handleDeleteEvent}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
