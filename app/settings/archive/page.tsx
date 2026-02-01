"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Shield,
  Users,
  ListChecks,
  Calendar,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

interface ArchivedItem {
  id: string;
  name: string;
  email?: string;
  role?: string;
  ministry?: string;
  status?: string;
  archivedDate: Date;
  reason: string;
  archivedBy: string;
}

const mockArchivedRoles: ArchivedItem[] = [
  {
    id: "1",
    name: "former.admin@baclaran.church",
    email: "former.admin@baclaran.church",
    role: "Admin",
    ministry: "Youth Ministry",
    archivedDate: new Date("2024-10-15"),
    reason: "Resigned",
    archivedBy: "admin@baclaran.church",
  },
];

const mockArchivedVolunteers: ArchivedItem[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    archivedDate: new Date("2024-11-01"),
    reason: "Relocated",
    archivedBy: "admin@baclaran.church",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    archivedDate: new Date("2024-10-20"),
    reason: "Inactive for 6 months",
    archivedBy: "staff@baclaran.church",
  },
];

const mockArchivedTasks: ArchivedItem[] = [
  {
    id: "1",
    name: "Old Ministry Report",
    status: "Completed",
    archivedDate: new Date("2024-09-30"),
    reason: "Task completed and no longer needed",
    archivedBy: "admin@baclaran.church",
  },
];

const mockArchivedEvents: ArchivedItem[] = [
  {
    id: "1",
    name: "Summer Retreat 2024",
    archivedDate: new Date("2024-08-15"),
    reason: "Event concluded",
    archivedBy: "admin@baclaran.church",
  },
];

export default function ArchivesPage() {
  const [activeTab, setActiveTab] = useState("roles");
  const [perPage, setPerPage] = useState("10");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<ArchivedItem | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const [roles, setRoles] = useState(mockArchivedRoles);
  const [volunteers, setVolunteers] = useState(mockArchivedVolunteers);
  const [tasks, setTasks] = useState(mockArchivedTasks);
  const [events, setEvents] = useState(mockArchivedEvents);

  const getDataForTab = () => {
    switch (activeTab) {
      case "roles":
        return roles;
      case "volunteers":
        return volunteers;
      case "tasks":
        return tasks;
      case "events":
        return events;
      default:
        return [];
    }
  };

  const handleRestore = (item: ArchivedItem) => {
    const removeItem = (
      items: ArchivedItem[],
      setItems: React.Dispatch<React.SetStateAction<ArchivedItem[]>>,
    ) => {
      setItems(items.filter((i) => i.id !== item.id));
    };

    switch (activeTab) {
      case "roles":
        removeItem(roles, setRoles);
        break;
      case "volunteers":
        removeItem(volunteers, setVolunteers);
        break;
      case "tasks":
        removeItem(tasks, setTasks);
        break;
      case "events":
        removeItem(events, setEvents);
        break;
    }

    // toast({
    //   title: "Item Restored",
    //   description: `${item.name} has been restored successfully.`,
    // });
  };

  const handleDelete = () => {
    if (!itemToDelete) return;

    const removeItem = (
      items: ArchivedItem[],
      setItems: React.Dispatch<React.SetStateAction<ArchivedItem[]>>,
    ) => {
      setItems(items.filter((i) => i.id !== itemToDelete.id));
    };

    switch (activeTab) {
      case "roles":
        removeItem(roles, setRoles);
        break;
      case "volunteers":
        removeItem(volunteers, setVolunteers);
        break;
      case "tasks":
        removeItem(tasks, setTasks);
        break;
      case "events":
        removeItem(events, setEvents);
        break;
    }

    setItemToDelete(null);
    // toast({
    //   title: "Item Deleted",
    //   description: "Item has been permanently deleted.",
    //   variant: "destructive",
    // });
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(getDataForTab().map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkRestore = () => {
    const removeItems = (
      items: ArchivedItem[],
      setItems: React.Dispatch<React.SetStateAction<ArchivedItem[]>>,
    ) => {
      setItems(items.filter((i) => !selectedItems.includes(i.id)));
    };

    switch (activeTab) {
      case "roles":
        removeItems(roles, setRoles);
        break;
      case "volunteers":
        removeItems(volunteers, setVolunteers);
        break;
      case "tasks":
        removeItems(tasks, setTasks);
        break;
      case "events":
        removeItems(events, setEvents);
        break;
    }

    // toast({
    //   title: "Items Restored",
    //   description: `${selectedItems.length} items have been restored.`,
    // });
    setSelectedItems([]);
  };

  const handleBulkDelete = () => {
    const removeItems = (
      items: ArchivedItem[],
      setItems: React.Dispatch<React.SetStateAction<ArchivedItem[]>>,
    ) => {
      setItems(items.filter((i) => !selectedItems.includes(i.id)));
    };

    switch (activeTab) {
      case "roles":
        removeItems(roles, setRoles);
        break;
      case "volunteers":
        removeItems(volunteers, setVolunteers);
        break;
      case "tasks":
        removeItems(tasks, setTasks);
        break;
      case "events":
        removeItems(events, setEvents);
        break;
    }

    // toast({
    //   title: "Items Deleted",
    //   description: `${selectedItems.length} items have been permanently deleted.`,
    //   variant: "destructive",
    // });
    setSelectedItems([]);
    setShowBulkDeleteDialog(false);
  };

  const renderTable = (items: ArchivedItem[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            {activeTab === "roles" && <Shield className="w-12 h-12 mx-auto" />}
            {activeTab === "volunteers" && (
              <Users className="w-12 h-12 mx-auto" />
            )}
            {activeTab === "tasks" && (
              <ListChecks className="w-12 h-12 mx-auto" />
            )}
            {activeTab === "events" && (
              <Calendar className="w-12 h-12 mx-auto" />
            )}
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No archived {activeTab} found
          </h3>
          <p className="text-sm text-slate-500">
            No {activeTab} match your current search criteria.
          </p>
        </div>
      );
    }

    return (
      <table className="w-full">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="py-3 px-4 text-left">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                onChange={toggleSelectAll}
                checked={
                  selectedItems.length === items.length && items.length > 0
                }
              />
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
              {activeTab === "roles" ? "Email" : "Name"}
            </th>
            {activeTab === "roles" && (
              <>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
                  Role
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
                  Ministry
                </th>
              </>
            )}
            {activeTab === "volunteers" && (
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
                Email
              </th>
            )}
            {activeTab === "tasks" && (
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
                Status
              </th>
            )}
            <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
              Archived Date
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
              Reason
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
              Archived By
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-slate-50">
              <td className="py-3 px-4">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                />
              </td>
              <td className="py-3 px-4 font-medium">{item.name}</td>
              {activeTab === "roles" && (
                <>
                  <td className="py-3 px-4">
                    <Badge
                      className={
                        item.role === "Admin"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {item.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{item.ministry}</td>
                </>
              )}
              {activeTab === "volunteers" && (
                <td className="py-3 px-4 text-slate-600">{item.email}</td>
              )}
              {activeTab === "tasks" && (
                <td className="py-3 px-4 text-slate-600">{item.status}</td>
              )}
              <td className="py-3 px-4 text-slate-500">
                {item.archivedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="py-3 px-4">
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                >
                  {item.reason}
                </Badge>
              </td>
              <td className="py-3 px-4 text-slate-500">{item.archivedBy}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent"
                    onClick={() => handleRestore(item)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                    onClick={() => setItemToDelete(item)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Archives</h1>
        <p className="text-slate-500">
          Manage archived roles, volunteers, tasks, and events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Roles</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {roles.length}
                </p>
              </div>
              <div className="p-3 bg-indigo-500 rounded-full">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Volunteers</p>
                <p className="text-2xl font-bold text-blue-900">
                  {volunteers.length}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Tasks</p>
                <p className="text-2xl font-bold text-amber-900">
                  {tasks.length}
                </p>
              </div>
              <div className="p-3 bg-amber-500 rounded-full">
                <ListChecks className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Events</p>
                <p className="text-2xl font-bold text-purple-900">
                  {events.length}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="roles" className="gap-2">
                <Shield className="w-4 h-4" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="volunteers" className="gap-2">
                <Users className="w-4 h-4" />
                Volunteers
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2">
                <ListChecks className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </TabsTrigger>
            </TabsList>

            {/* Per page selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Show:</span>
                <NativeSelect
                  className="w-20"
                  value={perPage}
                  onChange={(e) => setPerPage(e.target.value)}
                >
                  <NativeSelectOption value="5">5</NativeSelectOption>
                  <NativeSelectOption value="10">10</NativeSelectOption>
                  <NativeSelectOption value="25">25</NativeSelectOption>
                  <NativeSelectOption value="50">50</NativeSelectOption>
                </NativeSelect>

                <span className="text-sm text-slate-600">per page</span>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-800">
                    {selectedItems.length} item(s) selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkRestore}
                  >
                    Restore Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowBulkDeleteDialog(true)}
                  >
                    Delete Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedItems([])}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="roles">
              <div className="overflow-x-auto">{renderTable(roles)}</div>
            </TabsContent>
            <TabsContent value="volunteers">
              <div className="overflow-x-auto">{renderTable(volunteers)}</div>
            </TabsContent>
            <TabsContent value="tasks">
              <div className="overflow-x-auto">{renderTable(tasks)}</div>
            </TabsContent>
            <TabsContent value="events">
              <div className="overflow-x-auto">{renderTable(events)}</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this item? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Confirm Bulk Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedItems.length}{" "}
              selected items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
