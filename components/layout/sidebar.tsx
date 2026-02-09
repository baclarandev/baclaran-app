"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Church,
  Calendar,
  ListChecks,
  Settings,
  Archive,
  X,
  Menu,
} from "lucide-react";
import { User } from "@/app/services/users";
import { useMinistries } from "@/app/services/ministries";


interface SidebarProps {
  user: User;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({
  user,
  isOpen: externalIsOpen,
  onOpenChange,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    if (onOpenChange) {
      const newValue = typeof value === "function" ? value(isOpen) : value;
      onOpenChange(newValue);
    } else {
      setInternalIsOpen(value);
    }
  };
 const { data: ministries = [] } = useMinistries();
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/volunteers", label: "Volunteers", icon: Users },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/attendance", label: "Attendance", icon: ListChecks },
  ];

  const settingsItems = [
    { href: "/settings", label: "Account Settings", icon: Settings, isAdmin: true },
    { href: "/settings/archives", label: "Archives", icon: Archive },
  ];

const renderMinistriesMenu = (ministries: { id: number; name: string; type: string }[]) => {
  if (!user) return null; // safeguard

  const isAdmin = user.role === "ADMIN";

  // ✅ Fixed: Get ministry type from fetched ministries, not user.ministry
  let ministryTypes: string[] = [];

  if (!isAdmin) {
    const userMinistryId = user.ministryId;
    if (userMinistryId) {
      const userMinistry = ministries.find((m) => m.id === userMinistryId);
      if (userMinistry) ministryTypes = [userMinistry.type];
    }
  } else {
    ministryTypes = ["LITURGICAL", "PASTORAL"]; // Admin sees all
  }

  const typeLabels: Record<string, string> = {
    LITURGICAL: "Liturgical",
    PASTORAL: "Pastoral",
  };

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase text-gray-400 mb-1">Ministries</p>
      <div className="ml-2 flex flex-col gap-2">
        {isAdmin && (
          <Link
            href="/ministries"
            onClick={() => setIsOpen(false)}
            className={cn(
              "px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-yellow-400",
              pathname === "/ministries"
                ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
                : ""
            )}
          >
            All Ministries
          </Link>
        )}

        {ministryTypes.length === 0 && !isAdmin && (
          <span className="px-4 py-2 text-gray-500">No ministry assigned</span>
        )}

        {ministryTypes.map((type) => (
          <Link
            key={type}
            href={`/ministries/${type.toLowerCase()}`}
            onClick={() => setIsOpen(false)}
            className={cn(
              "px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-yellow-400",
              pathname.includes(type.toLowerCase())
                ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
                : ""
            )}
          >
            {typeLabels[type]}
          </Link>
        ))}
      </div>
    </div>
  );
};





  const sidebarContent = (
    <>
      <div className="flex h-16 items-center border-b border-gray-700 px-6 bg-gray-900">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center shadow-md">
            <Church className="w-5 h-5 text-gray-900" />
          </div>
          <div className="flex flex-col">
            <span className="lg:text-lg font-bold text-gray-100">Baclaran Church</span>
            <span className="text-xs font-medium text-gray-400 -mt-0.5">Management System</span>
          </div>
        </Link>

        <button
          onClick={toggleSidebar}
          className="relative z-10 ml-auto md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      <nav className="flex-1 overflow-auto py-6 px-4 scrollbar-thin">

         <p className="text-xs font-semibold uppercase text-gray-400 mb-1">Dashboard</p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                  isActive
                    ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
                    : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Ministries menu */}
          {renderMinistriesMenu(ministries)}

          {/* Divider */}
          <div className="my-4 h-px bg-gray-700" />

          {/* Settings */}
          {settingsItems.map((item) => {
            if (item.isAdmin && !isAdmin) return null;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                  isActive
                    ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
                    : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={toggleSidebar} role="presentation" />}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-gray-900 border-r border-gray-700 transform transition-transform duration-200 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30 bg-gray-900 border-r border-gray-700">
        {sidebarContent}
      </div>
    </>
  );
}
