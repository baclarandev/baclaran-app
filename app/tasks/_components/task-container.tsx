"use client";

import { useState, useMemo } from "react";
import { tasks, ministries } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Clock,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  Calendar,
} from "lucide-react";

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function Tasks({ user }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === "To Do").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  const gold = "#d6b25e";

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "To Do":
        return "border-orange-400 text-orange-300 bg-orange-500/10";
      case "In Progress":
        return "border-blue-400 text-blue-300 bg-blue-500/10";
      case "Completed":
        return "border-green-400 text-green-300 bg-green-500/10";
      default:
        return "border-gray-500 text-gray-300 bg-gray-600/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "To Do":
        return <Circle className="w-4 h-4" />;
      case "In Progress":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "Completed":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };
  return (
    <>
      <Sidebar user={user} />{" "}
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} />
        <div className="flex p-6 flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-400">
              Manage and track tasks across your organization
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#d6b25e] text-black hover:bg-[#b99645]">
                <Plus className="w-4 h-4" />
                Add New Task
              </Button>
            </DialogTrigger>

            <DialogContent className="w-full lg:max-w-lg px-6 bg-[#232326] border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-100">
                  Add New Task
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new task for your team
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="taskTitle" className="text-gray-300">
                    Task Title
                  </Label>
                  <Input
                    id="taskTitle"
                    placeholder="Enter task title"
                    className="bg-[#1a1a1d] border-gray-700 text-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Description</Label>
                  <Textarea
                    placeholder="Describe the task..."
                    className="bg-[#1a1a1d] border-gray-700 text-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Assign to Ministry</Label>
                  <NativeSelect className="bg-[#1a1a1d] border-gray-700 text-gray-200">
                    <NativeSelectOption value="" disabled hidden>
                      Select a ministry
                    </NativeSelectOption>
                    {ministries.map((main) => (
                      <NativeSelectOptGroup key={main.id} label={main.name}>
                        {main.children?.map((child) => (
                          <NativeSelectOption key={child.id} value={child.id}>
                            {child.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelectOptGroup>
                    ))}
                  </NativeSelect>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Due Date</Label>
                    <Input
                      type="date"
                      className="bg-[#1a1a1d] border-gray-700 text-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Status</Label>
                    <NativeSelect
                      defaultValue="To Do"
                      className="bg-[#1a1a1d] border-gray-700 text-gray-200"
                    >
                      <NativeSelectOption value="To Do">
                        To Do
                      </NativeSelectOption>
                      <NativeSelectOption value="In Progress">
                        In Progress
                      </NativeSelectOption>
                      <NativeSelectOption value="Completed">
                        Completed
                      </NativeSelectOption>
                    </NativeSelect>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="destructive"
                  className="border-gray-600 text-gray-300"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  className="bg-[#d6b25e] text-black hover:bg-[#b99645]"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Save Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Stats */}
        <div className="grid p-6 grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: "Total Tasks",
              count: totalTasks,
              icon: <Calendar className="w-6 h-6 text-[#d6b25e]" />,
            },
            {
              label: "To Do",
              count: todoTasks,
              icon: <Circle className="w-6 h-6 text-orange-400" />,
            },
            {
              label: "In Progress",
              count: inProgressTasks,
              icon: <Loader2 className="w-6 h-6 text-blue-400" />,
            },
            {
              label: "Completed",
              count: completedTasks,
              icon: <CheckCircle2 className="w-6 h-6 text-green-400" />,
            },
          ].map((stat, idx) => (
            <Card
              key={idx}
              className="bg-gray-800 border-gray-700 shadow-inner rounded-xl"
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center border border-gray-700">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {stat.count}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Filters */}
        <Card className="bg-gray-800 m-6 border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-700 text-gray-200"
                />
              </div>

              <NativeSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-[180px] bg-gray-700 border-gray-700 text-gray-200"
              >
                <NativeSelectOption value="all">All Status</NativeSelectOption>
                <NativeSelectOption value="To Do">To Do</NativeSelectOption>
                <NativeSelectOption value="In Progress">
                  In Progress
                </NativeSelectOption>
                <NativeSelectOption value="Completed">
                  Completed
                </NativeSelectOption>
              </NativeSelect>
            </div>
          </CardContent>
        </Card>
        {/* Tasks Grid */}
        <div className="grid m-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const statusColor =
              task.status === "To Do"
                ? "from-orange-500 to-orange-600"
                : task.status === "In Progress"
                ? "from-blue-500 to-blue-600"
                : "from-green-500 to-green-600";

            return (
              <Card
                key={task.id}
                className="bg-gray-800 border-gray-700 hover:border-[#d6b25e]/50 hover:shadow-lg transition-all rounded-xl relative overflow-hidden group"
              >
                {/* Status accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusColor}`}
                />

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-gray-100 group-hover:text-[#d6b25e] transition-colors">
                    {task.title}
                  </CardTitle>

                  {task.description && (
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {task.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {task.ministryName && (
                    <span
                      className="inline-flex text-xs px-3 py-1.5 rounded-full border border-[#d6b25e]/40 text-[#d6b25e]"
                      style={{ backgroundColor: "#d6b25e15" }}
                    >
                      {task.ministryName}
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`${getStatusStyles(
                        task.status
                      )} border text-xs`}
                    >
                      {getStatusIcon(task.status)}
                      <span className="ml-1">{task.status}</span>
                    </Badge>

                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {task.dueDate
                        ? task.dueDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "No due date"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Created{" "}
                      {task.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-[#d6b25e]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <Card className="p-12 text-center bg-[#232326] border-gray-700">
            <div className="text-gray-500 mb-4">
              <CheckCircle2 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-100 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
