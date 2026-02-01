"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { format, isAfter } from "date-fns";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MassCard } from "@/components/mass-card";

export default function VolunteerSchedule({ user }: any) {
  const params = useParams();
  const volunteerId = params.id;
  const searchParams = useSearchParams();
  const dateQuery = searchParams?.get("date");

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        let url = `/api/mass/bookings/mine`;
        if (dateQuery) {
          url += `?date=${dateQuery}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        // Filter only upcoming schedules
        const upcoming = data.filter((b: any) =>
          isAfter(new Date(b.mass.date), new Date())
        );

        setBookings(upcoming || []);
      } catch (err) {
        console.error("[FETCH_MY_BOOKINGS_ERROR]", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [volunteerId, dateQuery]);

  return (
    <>
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header user={user} />

        <header className="py-10 px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-yellow-400 mb-3">
            My Upcoming Schedule
          </h1>
        </header>

        <main className="max-w-4xl mx-auto px-4 pb-20 space-y-4">
          {loading && <p className="text-gray-300 text-center">Loading...</p>}

          {!loading && bookings.length === 0 && (
            <p className="text-gray-400 text-center">No upcoming schedules.</p>
          )}

          {!loading &&
            bookings.map((booking) => (
              <MassCard
                key={booking.id}
                mass={booking.mass}
                ministry={booking.ministry}
                volunteer={booking.volunteer}
                status={booking.status}
                isAdmin={false}
              />
            ))}
        </main>
      </div>
    </>
  );
}
