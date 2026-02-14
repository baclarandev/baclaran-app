import { useState, useMemo } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Search, Users, UserCircle, Phone, Mail } from "lucide-react";
export default function Members({
  user,
  volunteers,
  ministries,
  isLoading,
}: any) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return volunteers.filter((v: any) =>
      `${v.firstName} ${v.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [volunteers, search]);
  return (
    <>
      <Sidebar user={user} />

      <div className="flex-1 md:ml-64 flex flex-col">
        <Header user={user} />

        {/* ───── PAGE HEADER ───── */}
        <div className="p-6 border-b bg-gray-900 border-white/10">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-[#d4af37]" />
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Ministry Members
              </h1>
              <p className="text-gray-400">
                {filtered.length} active volunteers
              </p>
            </div>
          </div>
        </div>

        {/* ───── SEARCH ───── */}
        <div className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-gray-200 placeholder:text-gray-300 bg-gray-900 border-white/10"
            />
          </div>
        </div>

        {/* ───── CONTENT ───── */}
        <div className="px-6 pb-10">
          {isLoading ? (
            <p className="text-gray-400">Loading members...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              No volunteers found
            </div>
          ) : (
            <>
              {/* ───── MOBILE CARDS ───── */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filtered.map((v: any) => (
                  <Card
                    key={v.id}
                    className="bg-[#1f2024] border border-white/10"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-[#d4af37]" />
                        {v.firstName} {v.lastName}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Volunteer ID: {v.volunteerCode}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2 text-sm">
                      {v.email && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Mail className="w-4 h-4" />
                          {v.email}
                        </div>
                      )}
                      {v.phone && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone className="w-4 h-4" />
                          {v.phone}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ───── DESKTOP TABLE ───── */}
              <div className="hidden md:block rounded-lg border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900 text-gray-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {filtered.map((v: any) => (
                      <tr
                        key={v.id}
                        className="bg-gray-800 hover:bg-gray-700/40"
                      >
                        <td className="px-4 py-3 text-white font-medium">
                          {v.firstName} {v.lastName}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {v.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {v.phone || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
