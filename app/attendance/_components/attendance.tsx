"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ScheduleModal } from "@/components/schedule-modal";
import {
  sundaySchedule,
  wednesdaySchedule,
  ordinarySchedule,
} from "@/lib/schedule";
import Link from "next/link";
import { useVolunteerMinistries } from "@/app/services/ministries";

type MassType = "sunday" | "novena" | "ordinary" | null;

export default function Attendance({ user }: any) {
  const [selectedMass, setSelectedMass] = useState<MassType>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedVolunteerMinistryId, setSelectedVolunteerMinistryId] =
    useState<number | null>(null);

  const { data: volunteerMinistries = [], isLoading: loadingMinistries } =
    useVolunteerMinistries(user?.id);
  const [isAdmin, setIsAdmin] = useState(
    user.role === "ADMIN" || user.role === "CHAIRMAN",
  );
  const [viewMode, setViewMode] = useState<"mine" | "all">(
    isAdmin ? "all" : "mine",
  );

  const handleDateSelect = (date?: Date) => {
    if (!date) return;
    setSelectedDate(date);

    const day = date.getDay();
    if (day === 0) setSelectedMass("sunday");
    else if (day === 3) setSelectedMass("novena");
    else setSelectedMass("ordinary");
  };

  const getSchedule = () => {
    switch (selectedMass) {
      case "sunday":
        return sundaySchedule;
      case "novena":
        return wednesdaySchedule;
      case "ordinary":
        return ordinarySchedule;
      default:
        return { am: [], pm: [] };
    }
  };

  const getMassTitle = () => {
    const base =
      selectedMass === "sunday"
        ? "Sunday Mass"
        : selectedMass === "novena"
          ? "Wednesday Novena & Masses"
          : selectedMass === "ordinary"
            ? "Ordinary Weekday Mass"
            : "";
    return selectedDate ? `${base} — ${format(selectedDate, "PPP")}` : base;
  };

  // fetch bookings
  const fetchBookings = async () => {
    if (!selectedDate) return;
    try {
      const url =
        viewMode === "all"
          ? `/api/mass/bookings?date=${selectedDate.toISOString()}&all=true`
          : `/api/mass/bookings?date=${selectedDate.toISOString()}`;
      const res = await fetch(url);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("[FETCH_BOOKINGS_ERROR]", err);
    }
  };

  // initial fetch & refresh every 5 seconds for real-time updates
  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, [selectedDate, viewMode]);

  // handle admin confirm booking
  const handleConfirm = async (bookingId: number) => {
    try {
      const res = await fetch(`/api/mass/bookings/${bookingId}/confirm`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to confirm booking");

      const updated = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updated : b)),
      );
    } catch (err) {
      console.error("[CONFIRM_BOOKING_ERROR]", err);
    }
  };

  return (
    <>
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} />

        <header className="py-10 px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-yellow-400 mb-3">
            Attendance
          </h1>

          {isAdmin && (
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant={viewMode === "all" ? "default" : "outline"}
                onClick={() => setViewMode("all")}
              >
                View All Bookings
              </Button>
              <Button
                variant={viewMode === "mine" ? "default" : "outline"}
                onClick={() => setViewMode("mine")}
              >
                My Bookings
              </Button>
            </div>
          )}
        </header>

        <div className="max-w-md mx-auto mb-10 px-4">
          <div className="bg-card/40 border border-yellow-500/20 rounded-xl p-4 shadow-lg">
            <label className="block text-sm text-yellow-400 mb-2 font-medium">
              Select Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-yellow-500/20">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  modifiers={{
                    past: (date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)),
                  }}
                  modifiersClassNames={{
                    past: "bg-gray-800 text-gray-500 line-through opacity-60 cursor-not-allowed",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 pb-20">
          <ScheduleModal
            open={selectedMass !== null}
            onClose={() => setSelectedMass(null)}
            massType={getMassTitle()}
            schedules={getSchedule()}
            bookings={bookings}
            volunteerMinistries={volunteerMinistries}
            selectedVolunteerMinistryId={selectedVolunteerMinistryId}
            setSelectedVolunteerMinistryId={setSelectedVolunteerMinistryId}
            isAdmin={viewMode === "all"}
            onConfirmBooking={(id) =>
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === id ? { ...b, status: "CONFIRMED" } : b,
                ),
              )
            }
          />
        </main>
      </div>
    </>
  );
}
