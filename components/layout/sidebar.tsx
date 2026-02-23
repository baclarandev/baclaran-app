"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ListChecks,
  Settings,
  Archive,
  X,
  Menu,
} from "lucide-react";
import { User } from "@/app/services/users";
import { useMinistries } from "@/app/services/ministries";
import Image from "next/image";
import Logo from "@/public/logo.svg";
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
  const isStaff = user?.role === "STAFF";
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    if (onOpenChange) {
      const newValue = typeof value === "function" ? value(isOpen) : value;
      onOpenChange(newValue);
    } else {
      setInternalIsOpen(value);
    }
  };

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/volunteers", label: "Volunteers", icon: Users },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/attendance", label: "Attendance", icon: ListChecks },
  ];

  const settingsItems = [
    {
      href: "/settings",
      label: "Account Settings",
      icon: Settings,
      isAdmin: true,
    },
    // { href: "/settings/archives", label: "Archives", icon: Archive },
  ];

  const renderMinistriesMenu = () => {
    if (!user || user.role !== "ADMIN") return null;

    const ministryLinks = [
      { type: "LITURGICAL", label: "Liturgical" },
      { type: "PASTORAL", label: "Pastoral" },
    ];

    return (
      <div className="mb-4 mt-4">
        <p className="px-4 text-xs font-semibold uppercase text-gray-500 mb-2 tracking-wider">
          Ministries
        </p>
        <div className="flex flex-col gap-1">
          {/* All Ministries Link */}
          <Link
            href="/ministries"
            onClick={() => setIsOpen(false)}
            className={cn(
              "mx-2 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 border",
              pathname === "/ministries"
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400 backdrop-blur-md "
                : "bg-transparent border-transparent text-gray-400 hover:bg-neutral-800/50 hover:text-blue-400",
            )}
          >
            <span className="font-medium">All Ministries</span>
          </Link>

          {/* Dynamic Ministry Links */}
          {/* {ministryLinks.map(({ type, label }) => {
            const href = `/ministries/${type.toLowerCase()}`;
            const isActive = pathname.startsWith(href);

            return (
              <Link
                key={type}
                href={href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "mx-2 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 border",
                  isActive
                    ? "bg-blue-500/10 border-blue-500/30 text-white-400 backdrop-blur-md "
                    : "bg-transparent border-transparent text-gray-400 hover:bg-neutral-800/50 hover:text-blue-400",
                )}
              >
                <span className="ml-2 font-medium">{label}</span>
              </Link>
            );
          })} */}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <>
      <div className="print-hidden flex h-16 items-center border-b border-neutral-700 px-6 bg-neutral-900">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9  rounded-xl flex items-center justify-center shadow-md">
            <Image
              src={Logo}
              alt="Baclaran Church Logo"
              width={36}
              height={36}
            />
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

        <button
          onClick={toggleSidebar}
          className="relative z-10 ml-auto md:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-gray-400" />
          ) : (
            <Menu className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      <nav className="print-hidden flex-1 overflow-auto py-6 px-4 scrollbar-thin">
        <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
          Dashboard
        </p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                  isActive
                    ? "bg-blue-500/10 border-blue-500/30 border text-white backdrop-blur-md  "
                    : "bg-transparent border-transparent text-gray-400 hover:bg-neutral-800/50 ",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Ministries menu */}
          {renderMinistriesMenu()}

          {/* Divider */}
          <div className="my-4 h-px bg-neutral-700" />

          {/* Settings */}
          {settingsItems.map((item) => {
            if (item.isAdmin && !isAdmin) return null;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                  isActive
                    ? "bg-blue-500/10 border-blue-500/30 text-white backdrop-blur-md  "
                    : "bg-transparent border-transparent text-gray-400 hover:bg-neutral-800/50 ",
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
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-neutral-900 border-r border-gray-700 transform transition-transform duration-200 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30 bg-neutral-900 border-r border-gray-700">
        {sidebarContent}
      </div>
    </>
  );
}
