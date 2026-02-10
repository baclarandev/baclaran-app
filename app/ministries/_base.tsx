// pages/ministries/_base.tsx
"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMinistries } from "@/app/services/ministries";
import { useVolunteers } from "@/app/services/volunteer";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MinistryCard } from "./_components/ministry-components";

export default function MinistriesClientBase({ user, ministryType }: any) {

  const { data: ministries = [], isLoading, error } = useMinistries();
  const { data: volunteers = [] } = useVolunteers();
  const [search, setSearch] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
    const normalizedType = ministryType.toUpperCase();
   const filtered = useMemo(
    () =>
      ministries
        .filter((m: any) => m.type === normalizedType)
        .filter((m: any) =>
          m.name.toLowerCase().includes(search.toLowerCase())
        ),
    [ministries, search, normalizedType]
  );

  const volunteerCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    volunteers.forEach((v) => {
      if (v.ministryName) map[v.ministryName] = (map[v.ministryName] || 0) + 1;
    });
    return map;
  }, [volunteers]);

  const canManage = user?.role === "ADMIN";
  const canViewMembers = (ministry: any) => {
    if (user?.role === "ADMIN") return true;
    if (user?.role === "STAFF") return user?.ministry?.id === ministry.id;
    if (user?.role === "CHAIRMAN")
      return user?.ministry?.type === ministry.type;
    return false;
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load ministries</div>;

  return (
    <div className="flex">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen}  />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <div className="p-4 flex-1 bg-gray-800 min-h-screen  overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl text-white lowercase capitalize font-semibold">{ministryType} Ministries</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search ministries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-800 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ministry: any) => (
              <MinistryCard
                key={ministry.id}
                ministry={ministry}
                volunteerCount={volunteerCountMap[ministry.name]}
                canManage={canManage}
                onEdit={() => {}}
                onDelete={() => {}}
                canViewMembers={canViewMembers}
                user={user}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              No ministries found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
