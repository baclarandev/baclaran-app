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
  Sparkles,
  TrendingUp,
  Heart,
  BookOpen,
  Target,
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
import { User } from "@/app/services/users";

export default function Dashboard({ user }: { user: any }) {
  const { data: volunteers, isLoading: loadingVolunteers } = useVolunteers();
  const { data: ministries, isLoading: loadingMinistries } = useMinistries();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoading = loadingVolunteers || loadingMinistries;
  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "STAFF";
  // const currentMinistry = useMemo(() => {
  //     if (!ministries || !user) return null;
  //     if (isAdmin) return null; // Admin sees all, so no single ministry
  //     if (isStaff) {
  //       return ministries.find((m: any) =>
  //         m.volunteers?.some((v: any) => v.id === user.id)
  //       );
  //     })
  // Metrics calculation
  const allVolunteers = useMemo(() => {
    return volunteers?.flatMap((ministry: any) => ministry.volunteers) || [];
  }, [volunteers]);
  const currentMinistry = user.ministry?.name;
  const metrics = useMemo(() => {
    if (!volunteers || !ministries) return null;

    const activeVolunteers = allVolunteers.filter(
      (v: any) => v.status === "ACTIVE",
    ).length;

    const inactiveVolunteers = allVolunteers.length - activeVolunteers;
    return {
      totalVolunteers: allVolunteers.length,
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
    <div className="min-h-screen  text-gray-100">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          {isLoading || !metrics ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      Welcome back to National Shrine of Our Mother of Perpetual
                      Help Volunteer Management System
                    </h2>
                    <p className="text-stone-300">
                      Together we serve, inspire, and care for our community
                      with grace and purpose.
                    </p>
                  </div>
                  <div className="hidden md:flex w-20 h-20 rounded-xl bg-gradient-to-br from-yellow-400/30 to-amber-500/20 items-center justify-center">
                    <Sparkles className="w-10 h-10 text-yellow-300" />
                  </div>
                </div>
              </div>

              {/* Top Section: Stats + QR */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Stats */}
                <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                  <StatCard
                    label={`Total volunteers ${isStaff ? "on your ministry" : isAdmin ? "in total" : ""}`}
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
                    label="Community Engagement"
                    value={`${Math.floor((metrics.activeVolunteers / Math.max(1, metrics.totalVolunteers)) * 100)}%`}
                    sub="Active participation"
                    icon={TrendingUp}
                    color="blue"
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
                <TabsList className="bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md">
                  <TabsTrigger
                    value="overview"
                    className="
    data-[state=active]:bg-blue-500/10
    data-[state=active]:text-white
    text-gray-300
  "
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    className="
    data-[state=active]:bg-blue-500/10
    data-[state=active]:text-white
    text-gray-300
  "
                    value="volunteers"
                  >
                    Volunteers
                  </TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Quick Actions */}
                    <Card className="bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md lg:col-span-1">
                      <CardHeader>
                        <CardTitle className="text-primary text-base">
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Link href="/volunteers">
                          <Button
                            className="w-full justify-between"
                            variant="secondary"
                          >
                            View all members
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href="/attendance">
                          <Button
                            className="w-full justify-between"
                            variant="secondary"
                          >
                            Manage schedules
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    {/* Ministries */}
                    <Card className="lg:col-span-3 bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">
                          Ministries Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isStaff && (
                          <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-white">
                              <span className="font-semibold">
                                Your Ministry:
                              </span>{" "}
                              {currentMinistry}
                            </p>
                          </div>
                        )}
                        {isAdmin && (
                          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {metrics.ministryData.map((m: any, i: number) => (
                              <div
                                key={i}
                                className="bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md rounded-xl p-4 text-center hover:bg-blue-500/20 transition-all"
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
                              <div
                                className="bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md border-dashed rounded-xl p-4 flex flex-col items-center justify-center hover:bg-blue-500/20 transition-all cursor-pointer group
                  w-full h-full min-h-[120px]"
                              >
                                <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center bg-yellow-400/10 group-hover:scale-110 transition-transform">
                                  <ChevronRight className="w-6 h-6 text-yellow-400" />
                                </div>
                                <p className="text-sm text-yellow-400 text-center">
                                  See all
                                </p>
                              </div>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resources & Impact Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {/* Spiritual Resources */}
                    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 border backdrop-blur-md">
                      <CardHeader>
                        <BookOpen className="w-5 h-5 text-purple-300 mb-2" />
                        <CardTitle className="text-purple-300 text-base">
                          Spiritual Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-stone-300">
                          Access prayers, readings, and spiritual guidance for
                          your ministry work and personal growth.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full text-sm mt-3"
                        >
                          Explore Resources
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Community Impact */}
                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 border backdrop-blur-md">
                      <CardHeader>
                        <Heart className="w-5 h-5 text-green-300 mb-2" />
                        <CardTitle className="text-green-300 text-base">
                          Community Impact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-stone-300">
                          Track the positive difference our volunteers are
                          making in serving others and strengthening our parish.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full text-sm mt-3"
                        >
                          View Impact
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Ministry Goals */}
                    <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30 border backdrop-blur-md">
                      <CardHeader>
                        <Target className="w-5 h-5 text-orange-300 mb-2" />
                        <CardTitle className="text-orange-300 text-base">
                          Ministry Goals
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-stone-300">
                          Set and monitor goals for each ministry to ensure
                          alignment with our church's mission and values.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full text-sm mt-3"
                        >
                          Manage Goals
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Volunteers */}
                <TabsContent value="volunteers">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row justify-between">
                      <CardTitle className="text-yellow-400">
                        Recent Volunteers{" "}
                        {`${(isStaff && "on your ministry") || (isAdmin && "in total")}`}
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
                              {v.firstName}
                              {v.lastName}
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
            className="bg-neutral-800 border-neutral-700 animate-pulse h-30"
          />
        ))}
      </div>
      <Card className="bg-neutral-800 border-neutral-700 animate-pulse h-12" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card
            key={i}
            className="bg-neutral-800 border-neutral-700 animate-pulse h-80"
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Reusable ---------------- */
function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <Card className="bg-blue-500/10 border-blue-500/30 border text-white-400 backdrop-blur-md">
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-white">{label}</p>
          <p className="text-3xl font-bold text-gray-400">{value}</p>
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
