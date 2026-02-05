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
  Shield,
  Archive,
  X,
  Menu,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/app/services/users";

interface SidebarProps {
  user: User;
  isLoading?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({
  user,
  isLoading = false,
  isOpen: externalIsOpen,
  onOpenChange,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    if (onOpenChange) {
      const newValue = typeof value === "function" ? value(isOpen) : value;
      onOpenChange(newValue);
    } else {
      setInternalIsOpen(value);
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/volunteers", label: "Volunteers", icon: Users },
    { href: "/ministries", label: "Ministries", icon: Church },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/attendance", label: "Attendance", icon: ListChecks },
  ];

  // Toggle for mobile
  const toggleSidebar = () => setIsOpen((prev) => !prev);

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
            <span className="lg:text-lg font-bold text-gray-100">
              Baclaran Church
            </span>
            <span className="text-xs font-medium text-gray-400 -mt-0.5">
              Management System
            </span>
          </div>
        </Link>

        {/* Mobile burger - fixed z-index to ensure it's clickable */}
        <button
          onClick={toggleSidebar}
          className="relative z-10 ml-auto md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-gray-400" />
          ) : (
            <Menu className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-auto py-6 px-4 scrollbar-thin">
        <div className="space-y-1">
          {isLoading ? (
            // Loading skeleton
            <>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                >
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </>
          ) : (
            navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)} // close on click
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
            })
          )}
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleSidebar}
          role="presentation"
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
