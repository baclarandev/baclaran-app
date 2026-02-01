"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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

import Link from "next/link";
import { User } from "@prisma/client";

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
    <header className="sticky w-full top-0 z-40 flex h-16 items-center gap-4 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 px-6 shadow-sm ">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-yellow-400"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-2 text-sm text-gray-300">
        <span className="font-semibold text-yellow-400">{pageTitle}</span>
      </div>

      <div className="flex flex-1 items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-gray-800"
            >
              <div className="relative">
                <Avatar className="h-9 w-9 ring-2 ring-gray-800">
                  <AvatarFallback className="bg-yellow-500 text-gray-900">
                    {user?.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-100">
                  {user?.email}
                </span>
                <span className="text-xs text-gray-400">{user?.role}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-gray-800 border border-gray-700"
          >
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="flex items-center gap-3 cursor-pointer text-gray-100 hover:text-yellow-400"
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
                    className="flex items-center gap-3 cursor-pointer text-gray-100 hover:text-yellow-400"
                  >
                    <Shield className="w-4 h-4" />
                    Role Management
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings/archives"
                    className="flex items-center gap-3 cursor-pointer text-gray-100 hover:text-yellow-400"
                  >
                    <Archive className="w-4 h-4" />
                    Archives
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="border-gray-700" />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-500 hover:text-red-400 focus:text-red-400 focus:bg-gray-700"
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
