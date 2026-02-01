"use client";

import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Mail,
  Phone,
  Award,
  User,
  Heart,
  ChevronLeft,
} from "lucide-react";
import { useVolunteerById } from "@/app/services/volunteer";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function VolunteerProfile({ user }: { user: any }) {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const volunteerId = id && !isNaN(Number(id)) ? id : undefined;

  const {
    data: volunteer,
    isLoading,
    isError,
    error,
  } = useVolunteerById(volunteerId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-destructive flex items-center gap-2">
        <Award className="h-5 w-5" />
        {error?.message || "Volunteer not found"}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20";
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col w-full md:ml-64 transition-all duration-300">
        <Header user={user} />
        <main className="p-4 md:p-8  mx-auto w-full space-y-8">
          {/* Hero Section */}
          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()} // ✅ navigate back
            className="flex items-center gap-2 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="relative w-full rounded-3xl overflow-hidden bg-card border shadow-sm p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="absolute top-0 right-0 p-4">
              {/* <Badge className={getStatusColor(volunteer?.status)}>
                {volunteer?.status || "Unknown Status"}
              </Badge> */}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl ring-1 ring-border">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${volunteer?.email}`}
                />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {volunteer?.firstName?.[0]}
                  {volunteer?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center md:text-left space-y-3">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {volunteer?.firstName} {volunteer?.lastName}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  {volunteer?.ministryName || "No Ministry"}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {volunteer?.email}
                </div>
              </div>
              <div className="flex gap-3 pt-2 justify-center md:justify-start">
                <Button size="sm" className="rounded-full px-6">
                  Edit Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full px-6 bg-transparent"
                >
                  Contact
                </Button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Phone Number
                  </p>
                  <p className="font-medium text-foreground">
                    {volunteer?.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Address</p>
                  <p className="font-medium text-foreground leading-relaxed italic">
                    {volunteer?.address || "No address recorded"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Date of Birth
                  </p>
                  <p className="font-medium text-foreground">
                    {volunteer?.dateOfBirth
                      ? new Date(volunteer.dateOfBirth).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Joined Ministry
                  </p>
                  <p className="font-medium text-foreground">
                    {volunteer?.createdAt
                      ? new Date(volunteer.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Sacraments
                </CardTitle>
              </CardHeader>
              {/* <CardContent className="pt-2">
                {volunteer?.sacraments?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {volunteer?.sacraments.map((s: string) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="rounded-md font-normal px-2.5 py-0.5"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    No records found
                  </p>
                )}
              </CardContent> */}
            </Card>
          </div>

          {/* Bio/Additional Info Mockup */}
          <Card className="rounded-2xl border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Volunteer Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Dedicated volunteer focused on community building and ministry
                growth. Passionate about contributing to local outreach programs
                and supporting the {volunteer?.ministryName || "ministry"}{" "}
                mission through active engagement and leadership.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
