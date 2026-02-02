"use client";
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
  Shield,
  Archive,
  X,
} from "lucide-react";

import { IconTrack } from "@tabler/icons-react";
import { User } from "@prisma/client";

interface SidebarProps {
  user: User;
  isOpen?: boolean;
  onClose?: () => void;
}

// ✅ Added Attendance item
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/volunteers", label: "Volunteers", icon: Users },
  { href: "/ministries", label: "Ministries", icon: Church },
  { href: "/events", label: "Events", icon: Calendar },
  // { href: "/tasks", label: "Tasks", icon: IconTrack },
  { href: "/attendance", label: "Attendance", icon: ListChecks },
];

const settingsItems = [
  {
    href: "/settings",
    label: "Account Settings",
    icon: Settings,
    adminOnly: true,
  },
  {
    href: "/settings/roles",
    label: "Role Management",
    icon: Shield,
    adminOnly: true,
  },
  {
    href: "/settings/archives",
    label: "Archives",
    icon: Archive,
  },
];

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center border-b border-gray-700 px-6 bg-gray-900">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center shadow-md">
            <Church className="w-5 h-5 text-gray-900" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-100">
              Baclaran Church
            </span>
            <span className="text-xs font-medium text-gray-400 -mt-0.5">
              Management System
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto md:hidden p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-auto py-6 px-4 scrollbar-thin">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                  isActive
                    ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
                    : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">
            Settings
          </p>

          <div className="space-y-1">
            {settingsItems
              .filter((item) => !item.adminOnly || user?.role === "ADMIN")
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                      isActive
                        ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
                        : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
          </div>
        </div>
      </nav>

      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>System Online</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-gray-900 border-r border-gray-700 transform transition-transform duration-200 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
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
