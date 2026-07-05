"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import { Search, Plus, Ellipsis, Edit, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";

type Pillar = {
  id: number;
  title: string;
  points: number;
};

export default function Pillar({ user }: any) {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  // ---------------- FETCH ----------------
  const fetchPillars = async () => {
    setLoading(true);
    const res = await fetch("/api/attendance/pillar");
    const data = await res.json();
    setPillars(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPillars();
  }, []);

  // ---------------- FILTER ----------------
  const filtered = useMemo(() => {
    return pillars.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [pillars, search]);

  // ---------------- VALIDATION ----------------
  const validateForm = () => {
    const newErrors: { title?: string } = {};

    if (!title.trim()) newErrors.title = "Pillar name is required";
    else if (title.length < 2) newErrors.title = "Minimum 2 characters";
    else if (title.length > 50) newErrors.title = "Max 50 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------- CREATE ----------------
  const handleCreate = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const res = await fetch("/api/attendance/pillar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), points }),
      });

      if (!res.ok) throw new Error();

      toast.success("Pillar created");

      setTitle("");
      setPoints(1);
      setOpen(false);
      fetchPillars();
    } catch {
      toast.error("Failed to create pillar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* HEADER CONTROLS */}
        <Card className="mx-4 mt-6 md:m-6 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
          <CardContent className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-gray-400">
                Manage service pillars and point system
              </p>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pillars..."
                  className="pl-10 bg-blue-500/10 border border-blue-500/30 text-white"
                />
              </div>

              <Button
                onClick={() => setOpen(true)}
                className="bg-blue-500 border border-blue-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pillar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* LIST CARD */}
        <Card className="mx-4 md:m-6 bg-blue-500/10 border border-blue-500/30 text-white backdrop-blur-md">
          <CardHeader>
            <CardTitle>Service Pillars</CardTitle>
          </CardHeader>

          <CardContent>
            {/* EMPTY STATE */}
            {!loading && filtered.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                <p className="text-lg">No service pillars yet</p>
                <p className="text-sm">
                  Click “Add Pillar” to create your first one
                </p>
              </div>
            )}

            {/* DESKTOP TABLE */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-white/10">
                    <th className="py-3">Pillar</th>
                    <th className="py-3">Points</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-white/10 hover:bg-blue-500/10"
                    >
                      <td className="py-4">{p.title}</td>

                      <td className="py-4">
                        <Badge className="bg-blue-600/20 text-blue-300">
                          {p.points} pts
                        </Badge>
                      </td>

                      <td className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-blue-500/20 rounded">
                              <Ellipsis className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent className="bg-gray-900 text-white border border-gray-700">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="grid gap-3 md:hidden">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg"
                >
                  <div className="flex justify-between">
                    <p className="font-medium">{p.title}</p>
                    <Badge className="bg-blue-600/20 text-blue-300">
                      {p.points} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {loading && (
              <p className="text-gray-400 mt-4">Loading pillars...</p>
            )}
          </CardContent>
        </Card>

        {/* CREATE DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          <DialogContent className="bg-blue-500/10 border border-blue-500/30 text-white">
            <DialogHeader>
              <DialogTitle>Create Pillar</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* NAME */}
              <div>
                <Label className="pb-2">Pillar Name</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-blue-900/20 border border-blue-500/30"
                />
                {errors.title && (
                  <p className="text-red-400 text-xs">{errors.title}</p>
                )}
              </div>

              {/* SLIDER (FIXED) */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Points</Label>
                  <span className="text-blue-300">{points}</span>
                </div>

                <div className="w-full px-1">
                  <Slider
                    value={[points]}
                    onValueChange={(v) => setPoints(v[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                className="bg-red-600"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={handleCreate}
                disabled={saving}
                className="bg-blue-600/20"
              >
                {saving ? "Saving..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
