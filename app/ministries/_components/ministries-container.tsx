"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useMinistries } from "@/app/services/ministries";
import { useVolunteers } from "@/app/services/volunteer";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import {
  Users,
  UserPlus,
  UserCheck,
  Users2,
  UserX,
  Calendar,
  CalendarPlus,
  CalendarCheck,
  CalendarMinus,
  Clock,
  Clock1,
  Clock2,
  Clock4,
  BookOpen,
  Book,
  Scroll,
  Megaphone,
  Bell,
  BellOff,
  Mail,
  MailOpen,
  Phone,
  Smartphone,
  Tablet,
  Globe,
  Heart,
  Star,
  Gift,
  Flag,
  Trophy,
  Music,
  Music2,
  Video,
  Camera,
  CameraOff,
  Smile,
  SmilePlus,
  HandHeart,
  Shield,
  ShieldCheck,
  Lock,
  LockOpen,
  Settings,
  HelpCircle,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookCopy,
  MapPin,
  Database,
  Link as LinkIcon,
  Zap,
  Code,
  Sun,
  Moon,
  Leaf,
  Church,
  LayoutList,
  Grid,
  Search,
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

/* ───────────── ICON LIST ───────────── */
export const ICON_OPTIONS = [
  { name: "Church", icon: Church },
  { name: "Users", icon: Users },
  { name: "UserPlus", icon: UserPlus },
  { name: "UserCheck", icon: UserCheck },
  { name: "Users2", icon: Users2 },
  { name: "UserX", icon: UserX },
  { name: "Calendar", icon: Calendar },
  { name: "CalendarPlus", icon: CalendarPlus },
  { name: "CalendarCheck", icon: CalendarCheck },
  { name: "CalendarMinus", icon: CalendarMinus },
  { name: "Clock", icon: Clock },
  { name: "Clock1", icon: Clock1 },
  { name: "Clock2", icon: Clock2 },
  { name: "Clock4", icon: Clock4 },
  { name: "BookOpen", icon: BookOpen },
  { name: "Book", icon: Book },
  { name: "Scroll", icon: Scroll },
  { name: "Megaphone", icon: Megaphone },
  { name: "Bell", icon: Bell },
  { name: "BellOff", icon: BellOff },
  { name: "Mail", icon: Mail },
  { name: "MailOpen", icon: MailOpen },
  { name: "Phone", icon: Phone },
  { name: "Smartphone", icon: Smartphone },
  { name: "Tablet", icon: Tablet },
  { name: "Globe", icon: Globe },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Gift", icon: Gift },
  { name: "Flag", icon: Flag },
  { name: "Trophy", icon: Trophy },
  { name: "Music", icon: Music },
  { name: "Music2", icon: Music2 },
  { name: "Video", icon: Video },
  { name: "Camera", icon: Camera },
  { name: "CameraOff", icon: CameraOff },
  { name: "Smile", icon: Smile },
  { name: "SmilePlus", icon: SmilePlus },
  { name: "HandHeart", icon: HandHeart },
  { name: "Shield", icon: Shield },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Lock", icon: Lock },
  { name: "LockOpen", icon: LockOpen },
  { name: "Settings", icon: Settings },
  { name: "HelpCircle", icon: HelpCircle },
  { name: "Info", icon: Info },
  { name: "CheckCircle", icon: CheckCircle },
  { name: "XCircle", icon: XCircle },
  { name: "AlertTriangle", icon: AlertTriangle },
  { name: "BookCopy", icon: BookCopy },
  { name: "MapPin", icon: MapPin },
  { name: "Database", icon: Database },
  { name: "Link", icon: LinkIcon },
  { name: "Zap", icon: Zap },
  { name: "Code", icon: Code },
  { name: "Sun", icon: Sun },
  { name: "Moon", icon: Moon },
  { name: "Leaf", icon: Leaf },
  { name: "LayoutList", icon: LayoutList },
  { name: "Grid", icon: Grid },
];

export default function MinistriesClient({ user }: any) {
  const queryClient = useQueryClient();

  const [type, setType] = useState<"LITURGICAL" | "PASTORAL">("LITURGICAL");

  const { data: ministries = [], isLoading, error } = useMinistries();
  const { data: volunteers = [] } = useVolunteers();

  const isChairman = user?.role === "CHAIRMAN";
  const isAdmin = user?.role === "ADMIN";
  const canManage = isChairman || isAdmin;

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Church");
  const [selected, setSelected] = useState<any>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);

  const filtered = useMemo(
    () =>
      ministries.filter((m: any) =>
        m.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [ministries, search],
  );

  const volunteerCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    volunteers.forEach((v) => {
      if (v.ministryName) {
        map[v.ministryName] = (map[v.ministryName] || 0) + 1;
      }
    });
    return map;
  }, [volunteers]);

  /* ───────────── CRUD ───────────── */
  async function createMinistry() {
    try {
      const res = await fetch("/api/ministries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, type }),
      });
      if (!res.ok) throw new Error("Failed to create ministry");

      setName("");
      setIcon("Church");
      setType("LITURGICAL");
      setOpenCreate(false);
      queryClient.invalidateQueries({ queryKey: ["ministries"] });

      toast("Ministry created");
    } catch (err: any) {
      toast("Error");
    }
  }

  async function updateMinistry() {
    if (!selected) return;
    try {
      const res = await fetch(`/api/ministries/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon }),
      });
      if (!res.ok) throw new Error("Failed to update ministry");

      setName("");
      setIcon("Church");
      setSelected(null);
      setOpenEdit(false);
      queryClient.invalidateQueries({ queryKey: ["ministries"] });

      toast("Ministry updated");
    } catch (err: any) {
      toast("Error updating ministry");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/ministries/${deleting.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete ministry");

      setOpenDelete(false);
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: ["ministries"] });

      toast("Ministry deleted");
    } catch (err: any) {
      toast("Error deleting ministry");
    }
  }

  if (isLoading)
    return (
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 md:ml-64 flex flex-col">
          <Header user={user} />
          <div className="p-4">
            <div className="h-6 w-32 bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        Failed to load ministries
      </div>
    );

  return (
    <div className="flex">
      <Sidebar user={user} />

      <div className="flex-1 pbe-8 md:ml-64 flex flex-col min-h-screen bg-gray-900">
        <Header user={user} />

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Ministries</h1>
            <p className="text-gray-400">Manage church ministries</p>
          </div>

          <div className="flex items-center gap-3">
            {/* VIEW TOGGLE */}
            <div className="hidden md:flex bg-gray-800 border border-white/10 rounded-lg p-1">
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setView("grid")}
                className={`h-8 w-8 ${
                  view === "grid" ? "bg-gray-700 text-white" : "text-gray-400"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setView("table")}
                className={`h-8 w-8 ${
                  view === "table" ? "bg-gray-700 text-white" : "text-gray-400"
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>

            {canManage && (
              <Button
                onClick={() => setOpenCreate(true)}
                className="bg-[#d4af37] hover:bg-[#b8962d] text-black gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Ministry
              </Button>
            )}
          </div>
        </div>

        {/* SEARCH */}
        <Card className="mx-4 mb-4 bg-gray-800 border-white/10">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search ministries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-900 border-white/10 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* MOBILE CARD VIEW (Responsive Grid) */}
        <div className="grid grid-cols-1 gap-4 md:hidden px-4">
          {filtered.map((ministry: any) => {
            const IconComp =
              ICON_OPTIONS.find((i) => i.name === ministry.icon)?.icon ||
              Church;
            return (
              <Card
                key={ministry.id}
                className="relative bg-[#1f2024] border border-white/10"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-[#d4af37]" />
                <CardHeader className="pb-2 flex flex-row items-center gap-4">
                  <IconComp className="w-8 h-8 text-yellow-400" />
                  <div className="flex-1">
                    <Link href={`/ministries/${ministry.id}`}>
                      <CardTitle className="text-white text-lg hover:text-[#d4af37] transition-colors">
                        {ministry.name}
                      </CardTitle>
                    </Link>
                    <CardDescription className="text-gray-400">
                      {volunteerCountMap[ministry.name] || 0} volunteers
                    </CardDescription>
                    {ministry.type && (
                      <MinistryTypeBadge type={ministry.type} />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex justify-end gap-2 pt-0">
                  {canManage && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-400"
                        onClick={() => {
                          setSelected(ministry);
                          setName(ministry.name);
                          setIcon(ministry.icon || "Church");
                          setOpenEdit(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400"
                        onClick={() => {
                          setDeleting(ministry);
                          setOpenDelete(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* DESKTOP VIEWS */}
        <div className="hidden md:block px-4">
          {view === "table" ? (
            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left">Icon</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Ministry ID</th>
                    <th className="px-4 py-3 text-left">Volunteers</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((ministry: any) => {
                    const IconComp =
                      ICON_OPTIONS.find((i) => i.name === ministry.icon)
                        ?.icon || Church;
                    return (
                      <tr
                        key={ministry.id}
                        className="bg-gray-800 hover:bg-gray-700/40"
                      >
                        <td className="px-4 py-3">
                          <IconComp className="w-5 h-5 text-yellow-400" />
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/ministries/${ministry.id}`}
                            className="text-white font-medium hover:text-[#d4af37] transition-colors"
                          >
                            {ministry.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {ministry.type && (
                            <MinistryTypeBadge type={ministry.type} />
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                          {ministry.id}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {volunteerCountMap[ministry.name] || 0} volunteers
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {canManage && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-blue-400"
                                  onClick={() => {
                                    setSelected(ministry);
                                    setName(ministry.name);
                                    setIcon(ministry.icon || "Church");
                                    setOpenEdit(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-400"
                                  onClick={() => {
                                    setDeleting(ministry);
                                    setOpenDelete(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((ministry: any) => {
                const IconComp =
                  ICON_OPTIONS.find((i) => i.name === ministry.icon)?.icon ||
                  Church;
                return (
                  <Card
                    key={ministry.id}
                    className="relative bg-gray-800 border border-white/10 hover:border-[#d4af37]/40 transition-all group"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-[#d4af37]" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <IconComp className="w-10 h-10 text-yellow-400 mb-2" />
                        <td className="px-4 py-3">
                          <Link href={`/ministries/${ministry.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10"
                            >
                              View Members
                            </Button>
                          </Link>
                        </td>
                      </div>
                      <Link href={`/ministries/${ministry.id}`}>
                        <CardTitle className="text-white text-lg group-hover:text-[#d4af37] transition-colors">
                          {ministry.name}
                        </CardTitle>
                      </Link>
                      <CardDescription className="text-gray-400">
                        {volunteerCountMap[ministry.name] || 0} Volunteers
                        Active{" "}
                        {ministry.type && (
                          <MinistryTypeBadge type={ministry.type} />
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center pt-4">
                      <span className="text-[10px] text-gray-600 font-mono">
                        ID: {ministry.id}
                      </span>
                      {canManage && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-400 hover:bg-blue-400/10"
                            onClick={() => {
                              setSelected(ministry);
                              setName(ministry.name);
                              setIcon(ministry.icon || "Church");
                              setOpenEdit(true);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:bg-red-400/10"
                            onClick={() => {
                              setDeleting(ministry);
                              setOpenDelete(true);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Church className="w-12 h-12 mx-auto mb-4 opacity-20" />
            No ministries found
          </div>
        )}
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-gray-800 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Create Ministry</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new ministry to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button
              variant={type === "LITURGICAL" ? "outline" : "default"}
              onClick={() => setType("LITURGICAL")}
            >
              Liturgical
            </Button>
            <Button
              variant={type === "PASTORAL" ? "outline" : "default"}
              onClick={() => setType("PASTORAL")}
            >
              Pastoral
            </Button>
          </div>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Ministry name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-900 border-white/10"
            />
            <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1 border border-white/5 rounded-md bg-gray-900/50">
              {ICON_OPTIONS.map((i) => (
                <Button
                  key={i.name}
                  className={`p-0 h-8 w-8 ${
                    icon === i.name
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                  onClick={() => setIcon(i.name)}
                >
                  <i.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>
          <Button
            onClick={createMinistry}
            className="bg-[#d4af37] text-black w-full"
          >
            Save Ministry
          </Button>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-gray-800 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Ministry</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modify ministry details and icon
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-900 border-white/10"
            />
            <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1 border border-white/5 rounded-md bg-gray-900/50">
              {ICON_OPTIONS.map((i) => (
                <Button
                  key={i.name}
                  className={`p-0 h-8 w-8 ${
                    icon === i.name
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                  onClick={() => setIcon(i.name)}
                >
                  <i.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>
          <Button
            onClick={updateMinistry}
            className="bg-[#d4af37] text-black w-full"
          >
            Update Ministry
          </Button>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="bg-gray-800 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Ministry</DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone. All associations will be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-gray-900 p-3 text-sm text-gray-300">
            Confirm deletion of{" "}
            <span className="font-semibold text-white">"{deleting?.name}"</span>
            ?
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setOpenDelete(false)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
const MinistryTypeBadge = ({ type }: { type: "LITURGICAL" | "PASTORAL" }) => {
  const color =
    type === "LITURGICAL"
      ? "bg-blue-500 text-white"
      : "bg-green-500 text-white";
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${color} ml-2`}
    >
      {type === "LITURGICAL" ? "Liturgical" : "Pastoral"}
    </span>
  );
};
