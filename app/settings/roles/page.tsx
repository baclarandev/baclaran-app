"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Search,
  Plus,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Edit,
  Archive,
} from "lucide-react";
import { ministries } from "@/lib/data";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select";

interface User {
  id: string;
  email: string;
  role: "admin" | "staff" | "volunteer";
  ministryId?: string;
  ministryName?: string;
  createdAt: Date;
}

const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@baclaran.church",
    role: "admin",
    ministryId: "1",
    ministryName: "Lectors & Commentators",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "staff@baclaran.church",
    role: "staff",
    ministryId: "5",
    ministryName: "Youth Ministry",
    createdAt: new Date("2024-06-01"),
  },
  {
    id: "3",
    email: "coordinator@baclaran.church",
    role: "staff",
    ministryId: "2",
    ministryName: "Choir Ministry",
    createdAt: new Date("2024-03-15"),
  },
];

export default function RolesPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [archivingUser, setArchivingUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;

  const handleAddUser = () => {
    // toast({
    //   title: "User Added",
    //   description: "New user has been added successfully.",
    // });
  };

  const handleArchiveUser = () => {
    if (archivingUser) {
      setUsers(users.filter((u) => u.id !== archivingUser.id));
      setArchivingUser(null);
      // toast({
      //   title: "User Archived",
      //   description: "User has been archived successfully.",
      // });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Role Management</h1>
          <p className="text-slate-500">Manage user roles and permissions</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
            <p className="text-xs text-slate-500">Total Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{adminCount}</p>
            <p className="text-xs text-slate-500">Admins</p>
          </div>
        </div>
      </div>

      {/* Add New User Form */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Add New User</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span className="ml-1">{showAddForm ? "Hide" : "Show"} Form</span>
          </Button>
        </CardHeader>
        {showAddForm && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="user@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Min 8 chars, 1 uppercase, 1 number, 1 special character
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <NativeSelect>
                  <NativeSelectOption value="" disabled hidden>
                    Select a role
                  </NativeSelectOption>

                  <NativeSelectOption value="admin">
                    Admin - Full system access
                  </NativeSelectOption>

                  <NativeSelectOption value="staff">
                    Staff - Limited access
                  </NativeSelectOption>
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label>Ministry</Label>
                <NativeSelect>
                  <NativeSelectOption value="" disabled hidden>
                    Select a ministry
                  </NativeSelectOption>

                  {ministries.map((main) => (
                    <NativeSelectOptGroup key={main.id} label={main.name}>
                      {main.children?.map((ministry) => (
                        <NativeSelectOption
                          key={ministry.id}
                          value={ministry.id}
                        >
                          {ministry.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelectOptGroup>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddUser}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button variant="outline">Clear Form</Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === "all" ? "default" : "outline"}
                onClick={() => setRoleFilter("all")}
              >
                All Roles
              </Button>
              <Button
                variant={roleFilter === "admin" ? "default" : "outline"}
                onClick={() => setRoleFilter("admin")}
              >
                Admin
              </Button>
              <Button
                variant={roleFilter === "staff" ? "default" : "outline"}
                onClick={() => setRoleFilter("staff")}
              >
                Staff
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current Users</CardTitle>
          <p className="text-sm text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">
                    Ministry
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">
                    Date Added
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          />
                          <AvatarFallback>
                            {user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          user.role === "admin"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-amber-500 hover:bg-amber-600"
                        }
                      >
                        {user.role === "admin" ? "Admin" : "Staff"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {user.ministryName || "Not Assigned"}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {user.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setArchivingUser(user)}
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          Archive
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Information</DialogTitle>
            <DialogDescription>
              Update the user's details below.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={editingUser.email} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <NativeSelect defaultValue={editingUser.role}>
                  <NativeSelectOption value="admin">Admin</NativeSelectOption>
                  <NativeSelectOption value="staff">Staff</NativeSelectOption>
                  <NativeSelectOption value="volunteer">
                    Volunteer
                  </NativeSelectOption>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label>Ministry</Label>
                <NativeSelect defaultValue={editingUser.ministryId}>
                  {ministries.map((main) => (
                    <NativeSelectOptGroup key={main.id} label={main.name}>
                      {main.children?.map((ministry) => (
                        <NativeSelectOption
                          key={ministry.id}
                          value={ministry.id}
                        >
                          {ministry.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelectOptGroup>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setEditingUser(null);
                    // toast({
                    //   title: "User Updated",
                    //   description: "User information has been updated.",
                    // });
                  }}
                >
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog
        open={!!archivingUser}
        onOpenChange={() => setArchivingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-blue-600" />
              Archive User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to archive{" "}
              <strong>{archivingUser?.email}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Reason for archiving</Label>
              <textarea
                className="w-full rounded-md border border-input px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter reason..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setArchivingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleArchiveUser}>Archive User</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
