"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Plus, Trash2, Loader2 } from "lucide-react";
import {
  NativeSelect,
  NativeSelectOption,
  NativeSelectOptGroup,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import { useMinistries } from "@/app/services/ministries";
import { toast } from "sonner";
import { useUsers } from "@/app/services/users";

/* ───────────────────────── ZOD SCHEMA ───────────────────────── */

const createUserSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["ADMIN", "CHAIRMAN", "STAFF"]),

    ministryId: z.coerce.number().nullable().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CreateUserInput = z.infer<typeof createUserSchema>;

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
  ministryId: number | null;
  ministry: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
}

interface Ministry {
  id: string;
  name: string;
  children?: Ministry[];
}

/* ───────────────────────── COMPONENT ───────────────────────── */

export default function RoleManagement({ user }: any) {
  const { data: ministries = [], isLoading } = useMinistries();
  const {
    data: users,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useUsers();
  const [showAddForm, setShowAddForm] = useState(true);
  const [loading, setLoading] = useState(false);
  console.log(users);
  console.log(ministries, "ministries");
  const [form, setForm] = useState<CreateUserInput>({
    email: "",
    password: "",
    confirmPassword: "",
    role: "STAFF",
    ministryId: null,
  });

  /* ───────────────────────── FETCH DATA ───────────────────────── */

  /* ───────────────────────── CREATE USER ───────────────────────── */

  const handleAddUser = async () => {
    const parsed = createUserSchema.safeParse(form);

    if (!parsed.success) {
      toast("Validation error");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
          ministryId: form.ministryId ? Number(form.ministryId) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      toast("User Created");

      setForm({
        email: "",
        password: "",
        confirmPassword: "",
        role: "STAFF",
        ministryId: undefined,
      });

      refetchUsers();
    } catch (err: any) {
      toast("Error creating user");
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────────── DELETE USER ───────────────────────── */

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      toast("User deleted");

      refetchUsers();
    } catch (err: any) {
      toast("Error deleting user");
    }
  };

  /* ───────────────────────── UI ───────────────────────── */

  return (
    <>
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} />

        <div className="p-6 space-y-6 min-h-screen">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Role Management
            </h1>
            <p className="text-gray-400">Manage user accounts and ministries</p>
          </div>

          {/* Add User Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-white">Add New User</CardTitle>
              <Button
                variant="ghost"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CardHeader>

            {showAddForm && (
              <CardContent className="space-y-4">
                {isLoading && (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="md:col-span-2">
                    <Label>Email</Label>
                    <Input
                      placeholder="Enter your email here.."
                      className="bg-gray-700 border-gray-600"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter your password here..."
                      className="bg-gray-700 border-gray-600"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      className="bg-gray-700 border-gray-600"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <Label>Role</Label>
                    <NativeSelect
                      value={form.role}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          role: e.target.value as
                            | "ADMIN"
                            | "CHAIRMAN"
                            | "STAFF",
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-gray-100"
                    >
                      <NativeSelectOption value="ADMIN">
                        Admin
                      </NativeSelectOption>
                      <NativeSelectOption value="CHAIRMAN">
                        Chairman
                      </NativeSelectOption>
                      <NativeSelectOption value="STAFF">
                        Staff
                      </NativeSelectOption>
                    </NativeSelect>
                  </div>

                  {/* Ministry */}
                  <div>
                    <Label>Ministry</Label>
                    <NativeSelect
                      value={form.ministryId ?? "none"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          ministryId:
                            e.target.value === "none"
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    >
                      <NativeSelectOption className="bg-gray-700" value="none">
                        None
                      </NativeSelectOption>
                      {ministries.map((ministry: Ministry) =>
                        ministry.children && ministry.children.length > 0 ? (
                          <NativeSelectOptGroup
                            key={ministry.id}
                            label={ministry.name}
                          >
                            {ministry.children.map((child) => (
                              <NativeSelectOption
                                className="bg-gray-700"
                                key={child.id}
                                value={child.id}
                              >
                                {child.name}
                              </NativeSelectOption>
                            ))}
                          </NativeSelectOptGroup>
                        ) : (
                          <NativeSelectOption
                            key={ministry.id}
                            value={ministry.id}
                            className="bg-gray-700"
                          >
                            {ministry.name}
                          </NativeSelectOption>
                        ),
                      )}
                    </NativeSelect>
                  </div>
                </div>

                <Button
                  onClick={handleAddUser}
                  disabled={loading}
                  className="bg-[#d6b25e] text-black hover:bg-[#c9a64a]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create User
                    </>
                  )}
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Users List Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Users</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : users?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No users created yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-300">
                          Ministry
                        </TableHead>
                        <TableHead className="text-gray-300">Created</TableHead>
                        <TableHead className="text-gray-300">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((u) => (
                        <TableRow key={u.id} className="border-gray-700">
                          <TableCell className="text-gray-200">
                            {u.email}
                          </TableCell>
                          <TableCell>
                            <span className="inline-block px-2 py-1 rounded text-sm bg-gray-700 text-gray-200">
                              {u.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {u.ministry?.name ?? "—"}
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              // onClick={() => handleDeleteUser(u.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
