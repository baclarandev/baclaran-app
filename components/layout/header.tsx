"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronDown,
  Settings,
  Shield,
  Archive,
  LogOut,
  Menu,
} from "lucide-react";
import { User } from "@/app/services/users";
import { ThemeToggle } from "../theme-toggle";

interface HeaderProps {
  user: User;
  onMenuClick?: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/volunteers": "Volunteers Directory",
  "/ministries": "Ministries",
  "/events": "Events",
  "/tasks": "Tasks",
  "/settings": "Account Settings",
  "/settings/roles": "Role Management",
  "/settings/archives": "Archives",
};

export function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pageTitle =
    Object.entries(pageTitles).find(([path]) =>
      pathname.startsWith(path),
    )?.[1] || "Dashboard";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky print-hidden top-0 z-40 flex h-16 bg-neutral-900 items-center gap-4 px-6  backdrop-blur-md border-b border-white/20 shadow-md  ">
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </button>

      {/* Page title */}
      <div className="flex items-center font-mono gap-2 sm:text-sm md:text-lg  text-white dark:text-red-400">
        {pageTitle}
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        {/* Theme toggle */}
        {/* <ThemeToggle /> */}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-2 rounded-lg min-w-0 hover:bg-gray-400  transition"
            >
              <div className="relative flex-shrink-0">
                <Avatar className="h-9 w-9 ring-2 ring-blue-500 dark:ring-blue-400">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {user?.email?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-blue-900 rounded-full" />
              </div>

              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-semibold truncate max-w-[100px] md:max-w-xs text-white dark:text-white">
                  {user?.email}
                </span>
                <span className="text-xs truncate max-w-[100px] md:max-w-xs text-gray-500 dark:text-blue-200">
                  {user?.role}
                </span>
              </div>

              <ChevronDown className="w-4 h-4 text-blue-500 dark:text-blue-200 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-700 rounded-lg shadow-lg"
          >
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="flex items-center gap-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>

            {user?.role === "ADMIN" && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings/roles"
                    className="flex items-center gap-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    <Shield className="w-4 h-4" />
                    Role Management
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings/archives"
                    className="flex items-center gap-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    <Archive className="w-4 h-4" />
                    Archives
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="border-gray-200 dark:border-blue-700" />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 focus:bg-blue-50 dark:focus:bg-blue-800"
            >
              <LogOut className="w-4 h-4 mr-3" />
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
