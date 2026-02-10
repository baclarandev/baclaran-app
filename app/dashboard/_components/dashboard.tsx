"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  Users,
  Calendar,
  CheckCircle2,
  Church,
  Plus,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

import { useVolunteers } from "@/app/services/volunteer";
import { useMinistries } from "@/app/services/ministries";

export default function Dashboard({ user }: any) {
  const { data: volunteers, isLoading: loadingVolunteers } = useVolunteers();
  const { data: ministries, isLoading: loadingMinistries } = useMinistries();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoading = loadingVolunteers || loadingMinistries;

  // Metrics calculation
  const metrics = useMemo(() => {
    if (!volunteers || !ministries) return null;

    const activeVolunteers = volunteers.filter(
      (v) => v.status === "Active",
    ).length;
    const inactiveVolunteers = volunteers.length - activeVolunteers;

    return {
      totalVolunteers: volunteers.length,
      activeVolunteers,
      inactiveVolunteers,
      upcomingEvents: 0,
      taskCompletionRate: 0,
      activeMinistries: ministries.length,
      ministryData: ministries.slice(0, 7).map((m: any, i: number) => ({
        name: m.name,
        volunteers: m.volunteers?.length ?? 0,
        color: [
          "bg-yellow-600",
          "bg-green-600",
          "bg-blue-600",
          "bg-purple-600",
          "bg-red-600",
        ][i % 5],
      })),
      recentVolunteers: volunteers.slice(0, 5),
    };
  }, [volunteers, ministries]);

  // Helper: combine mass date + time into JS Date
  const getMassDateTime = (mass: any) => {
    const date = new Date(mass.date);
    const [hours, minutes] = mass.time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Next mass within 2 hours for logged-in volunteer
  const nextMass = useMemo(() => {
    if (!volunteers || !user) return null;

    const myVolunteer = volunteers.find((v: any) => v.id === user.id);
    if (!myVolunteer || !myVolunteer.bookings) return null;

    const now = new Date();
    return myVolunteer.bookings
      .map((b: any) => ({ ...b, massDateTime: getMassDateTime(b.mass) }))
      .filter((b: any) => {
        const diff = (b.massDateTime.getTime() - now.getTime()) / 1000 / 60; // minutes
        return diff >= 0 && diff <= 120; // within next 2 hours
      })
      .sort(
        (a: any, b: any) => a.massDateTime.getTime() - b.massDateTime.getTime(),
      )[0];
  }, [volunteers, user]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen}  />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          {isLoading || !metrics ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Top Section: Stats + QR */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Stats */}
                <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                  <StatCard
                    label="Total Volunteers"
                    value={metrics.totalVolunteers}
                    sub={`${metrics.activeVolunteers} active • ${metrics.inactiveVolunteers} inactive`}
                    icon={Users}
                    color="yellow"
                  />
                  <StatCard
                    label="Upcoming Events"
                    value={metrics.upcomingEvents}
                    sub="Next 30 days"
                    icon={Calendar}
                    color="green"
                  />
                  <StatCard
                    label="Task Completion"
                    value={`${metrics.taskCompletionRate}%`}
                    icon={CheckCircle2}
                    color="purple"
                  />
                  <StatCard
                    label="Active Ministries"
                    value={metrics.activeMinistries}
                    icon={Church}
                    color="amber"
                  />
                </div>

                {/* QR Panel */}
                {nextMass && (
                  <Card className="bg-gray-800 border-gray-700 w-full lg:w-64">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 text-sm">
                        Next Mass QR (opens 2hrs before)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3">
                      <QRCode
                        value={JSON.stringify({
                          volunteerId: user.id,
                          massId: nextMass.mass.id,
                        })}
                        size={160}
                      />
                      <p className="text-xs text-gray-400 text-center">
                        {nextMass.mass.language} • {nextMass.mass.time}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-gray-800 border border-gray-700">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Link href="/volunteers">
                          <Button className="w-full justify-between">
                            View Volunteer <ChevronRight />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    {/* Ministries */}
                    <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">
                          Ministries
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {metrics.ministryData.map((m: any, i: number) => (
                            <div
                              key={i}
                              className="bg-gray-700 rounded-xl p-4 text-center"
                            >
                              <div
                                className={`w-12 h-12 ${m.color} rounded-full mx-auto mb-3 flex items-center justify-center`}
                              >
                                <Users className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm font-medium">{m.name}</p>
                              <p className="text-xs text-gray-400">
                                {m.volunteers} volunteers
                              </p>
                            </div>
                          ))}
                          <Link href="/ministries">
                            <div className="bg-gray-700/40 border border-dashed border-gray-600   w-full h-44 lg:w-44 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-gray-700 transition cursor-pointer">
                              <ChevronRight className="w-6 h-6 text-yellow-400 mb-2" />
                              <p className="text-sm text-yellow-400">
                                See all ministries
                              </p>
                            </div>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Volunteers */}
                <TabsContent value="volunteers">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row justify-between">
                      <CardTitle className="text-yellow-400">
                        Recent Volunteers
                      </CardTitle>
                      <Link href="/volunteers">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      {metrics.recentVolunteers.map((v: any) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-4 py-3 border-b border-gray-700"
                        >
                          <Avatar>
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${v.email}`}
                            />
                            <AvatarFallback>
                              {v.firstName[0]}
                              {v.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {v.firstName} {v.lastName}
                            </p>
                            <p className="text-sm text-gray-400">{v.email}</p>
                          </div>
                          <Badge>{v.status}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Skeleton ---------------- */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="bg-gray-800 border-gray-700 animate-pulse h-30"
          />
        ))}
      </div>
      <Card className="bg-gray-800 border-gray-700 animate-pulse h-12" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card
            key={i}
            className="bg-gray-800 border-gray-700 animate-pulse h-80"
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Reusable ---------------- */
function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-blue-400">{value}</p>
          {sub && <p className="text-sm text-gray-500">{sub}</p>}
        </div>
        <div
          className={`w-12 h-12 ${color}-800/20 rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </CardContent>
    </Card>
  );
}
