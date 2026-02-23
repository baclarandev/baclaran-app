"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useMinistries } from "@/app/services/ministries";

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
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

/* ───────────── ICON LIST ───────────── */
// Assuming you move the large icon list to a separate file for cleanliness
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
export default function Ministries({ user }: any) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<"LITURGICAL" | "PASTORAL">("LITURGICAL");
  const { data: ministries = [], isLoading, error } = useMinistries();

  const isAdmin = user?.role === "ADMIN";
  const canManage = isAdmin;

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Church");
  const [selected, setSelected] = useState<any>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(
    () =>
      ministries.filter((m: any) =>
        m.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [ministries, search],
  );
  console.log(filtered);
  const getVolunteerCount = (ministry: any) => {
    return ministry.volunteers?.length || 0;
  };

  // const canViewMembers = (ministry: any) => {
  //   if (user?.role === "ADMIN") return true;
  //   if (user?.role === "STAFF") return user?.ministry?.id === ministry.id;
  //   return false;
  // };

  /* ───────────── CRUD LOGIC ───────────── */
  async function createMinistry() {
    try {
      const res = await fetch("/api/ministries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, type }),
      });
      if (!res.ok) throw new Error();
      setOpenCreate(false);
      setName("");
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      toast.success("Ministry created successfully");
    } catch (err) {
      toast.error("Failed to create ministry");
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
      if (!res.ok) throw new Error();
      setOpenEdit(false);
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      toast.success("Ministry updated");
    } catch (err) {
      toast.error("Update failed");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/ministries/${deleting.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setOpenDelete(false);
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      toast.success("Ministry deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  }

  if (isLoading) return <MinistriesSkeleton user={user} />;

  return (
    <div className="flex min-h-screen bg-neutral-900 text-gray-100">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 md:p-8 space-y-6">
          {/* PAGE HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Ministries
              </h1>
              <p className="text-blue-300/60">
                Organize and oversee church service groups
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex bg-blue-500/10 border border-blue-500/20 backdrop-blur-md rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView("grid")}
                  className={`rounded-lg ${view === "grid" ? "bg-blue-500 text-white" : "text-blue-400"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView("table")}
                  className={`rounded-lg ${view === "table" ? "bg-blue-500 text-white" : "text-blue-400"}`}
                >
                  <LayoutList className="w-4 h-4" />
                </Button>
              </div>

              {canManage && (
                <Button
                  onClick={() => setOpenCreate(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 rounded-xl px-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ministry
                </Button>
              )}
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
            <Input
              placeholder="Filter ministries by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 bg-blue-500/5 border-blue-500/20 backdrop-blur-md text-white rounded-2xl focus:ring-blue-500/40 focus:border-blue-500/50"
            />
          </div>

          {/* CONTENT AREA */}
          {view === "table" ? (
            <div className="hidden md:block overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-md">
              <table className="w-full text-left border-collapse">
                <thead className="bg-blue-500/10 text-blue-300 uppercase text-xs font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Ministry</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Staff Count</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10">
                  {filtered.map((m: any) => (
                    <tr
                      key={m.id}
                      className="hover:bg-blue-500/10 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Church className="w-5 h-5 text-blue-400" />
                          </div>
                          <Link
                            href={`/ministries/${m.id}`}
                            className="font-semibold text-white hover:text-blue-400 transition-colors"
                          >
                            {m.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <MinistryTypeBadge type={m.type} />
                      </td>
                      <td className="px-6 py-4 text-blue-200/60">
                        {getVolunteerCount(m)} Members
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-blue-400"
                            onClick={() => {
                              setSelected(m);
                              setName(m.name);
                              setOpenEdit(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-400"
                            onClick={() => {
                              setDeleting(m);
                              setOpenDelete(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((ministry: any) => {
                const IconComp =
                  ICON_OPTIONS.find((i) => i.name === ministry.icon)?.icon ||
                  Church;
                return (
                  <Card
                    key={ministry.id}
                    className="relative bg-blue-500/5 border-blue-500/20 backdrop-blur-md hover:border-blue-400/50 transition-all group overflow-hidden flex flex-col"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 group-hover:w-1.5 transition-all" />
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                          <IconComp className="w-8 h-8 text-blue-400" />
                        </div>

                        <Link href={`/ministries/${ministry.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:bg-blue-500/20 rounded-lg"
                          >
                            Members <ChevronRight className="ml-1 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-blue-300 transition-colors">
                        {ministry.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <MinistryTypeBadge type={ministry.type} />
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto pt-6 border-t border-blue-500/10 flex justify-between items-center">
                      <span className="text-sm text-blue-100/40">
                        {getVolunteerCount(ministry)} active
                      </span>
                      {canManage && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-400 hover:bg-blue-500/20"
                            onClick={() => {
                              setSelected(ministry);
                              setName(ministry.name);
                              setOpenEdit(true);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:bg-red-500/20"
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

          {/* EMPTY STATE */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="p-6 bg-blue-500/5 rounded-full mb-4 border border-blue-500/10">
                <Church className="w-16 h-16 text-blue-500/20" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                No ministries found
              </h3>
              <p className="text-blue-300/40">
                Try adjusting your search or add a new ministry.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* DIALOGS */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-[#0f172a] border-blue-500/30 backdrop-blur-2xl text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-400">
              New Ministry
            </DialogTitle>
            <DialogDescription className="text-blue-100/50">
              Classify and name the new service group.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              variant={type === "LITURGICAL" ? "default" : "outline"}
              onClick={() => setType("LITURGICAL")}
              className={
                type === "LITURGICAL"
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "border-blue-500/30 text-blue-400"
              }
            >
              Liturgical
            </Button>
            <Button
              variant={type === "PASTORAL" ? "default" : "outline"}
              onClick={() => setType("PASTORAL")}
              className={
                type === "PASTORAL"
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "border-blue-500/30 text-blue-400"
              }
            >
              Pastoral
            </Button>
          </div>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-300/70 ml-1">
                Ministry Name
              </label>
              <Input
                placeholder="e.g. Altar Servers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-blue-500/5 border-blue-500/20 rounded-xl focus:ring-blue-500/40"
              />
            </div>
          </div>
          <Button
            onClick={createMinistry}
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-lg font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            Create Ministry
          </Button>
        </DialogContent>
      </Dialog>

      {/* ... similar updates for Edit and Delete Dialogs ... */}
    </div>
  );
}

/* ───────────── SUB-COMPONENTS ───────────── */

const MinistryTypeBadge = ({ type }: { type: "LITURGICAL" | "PASTORAL" }) => {
  const color =
    type === "LITURGICAL"
      ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
      : "bg-cyan-600/20 text-cyan-400 border-cyan-500/30";
  return (
    <span
      className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${color}`}
    >
      {type}
    </span>
  );
};

function MinistriesSkeleton({ user }: any) {
  return (
    <div className="flex h-screen bg-[#0a0f1d]">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-8 space-y-6">
        <div className="h-10 w-48 bg-blue-500/10 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-blue-500/5 border border-blue-500/10 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
