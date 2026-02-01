"use client";

import type React from "react";

import { useState } from "react";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { User } from "@prisma/client";

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
