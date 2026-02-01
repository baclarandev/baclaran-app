"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MassCard } from "@/components/mass-card";
import QRCode from "react-qr-code";

export default function AllBookingsList({ user }: any) {
  const [bookings, setBookings] = useState<any[]>([]);

  // fetch all bookings for all volunteers
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/mass/bookings/all`);
        const data = await res.json();
        setBookings(data || []);
      } catch (err) {
        console.error("[FETCH_ALL_BOOKINGS_ERROR]", err);
      }
    };
    fetchBookings();
  }, []);

  const handleConfirm = async (bookingId: number) => {
    try {
      const res = await fetch(`/api/mass/bookings/${bookingId}/confirm`, {
        method: "PATCH",
      });
      const updated = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updated : b)),
      );
    } catch (err) {
      console.error("[CONFIRM_BOOKING_ERROR]", err);
    }
  };

  // group by mass + ministry
  const groupedBookings = bookings.reduce((acc: any, booking) => {
    const massKey = `${booking.mass.date}-${booking.mass.time}`;
    const ministryKey = booking.ministry.name;
    acc[massKey] ??= {};
    acc[massKey][ministryKey] ??= [];
    acc[massKey][ministryKey].push(booking);
    return acc;
  }, {});

  return (
    // <>
    //   <Sidebar user={user} />
    //   <div className="flex-1 flex flex-col md:ml-64">
    //     <Header user={user} />

    //     <header className="py-10 px-4 text-center">
    //       <h1 className="font-serif text-4xl md:text-5xl font-bold text-yellow-400 mb-3">
    //         All Volunteer Bookings
    //       </h1>
    //     </header>

    //     <main className="max-w-6xl mx-auto px-4 pb-20 space-y-8">
    //       {Object.entries(groupedBookings).map(([massKey, ministries]) => {
    //         const [massDate, massTime] = massKey.split("-");
    //         return (
    //           <div key={massKey} className="space-y-4">
    //             <h2 className="font-serif text-xl font-bold text-yellow-400">
    //               {new Date(massDate).toDateString()} — {massTime}
    //             </h2>

    //             {Object.entries(ministries as any).map(
    //               ([ministryName, massBookings]) => (
    //                 <div
    //                   key={ministryName}
    //                   className="p-4 rounded-xl bg-card/30 border border-yellow-500/20 space-y-3"
    //                 >
    //                   <h3 className="font-semibold text-yellow-300">
    //                     Ministry: {ministryName}
    //                   </h3>

    //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //                     {massBookings.map((booking: any) => (
    //                       <MassCard
    //                         key={booking.id}
    //                         mass={booking.mass}
    //                         ministry={booking.ministry}
    //                         volunteer={booking.volunteer}
    //                         status={booking.status}
    //                         isAdmin={true}
    //                         onConfirm={() => handleConfirm(booking.id)}
    //                       >
    //                         {/* QR Code */}
    //                         <div className="mt-2 p-2 bg-white rounded">
    //                           <QRCode
    //                             value={JSON.stringify({
    //                               volunteerId: booking.volunteer.id,
    //                               massId: booking.mass.id,
    //                             })}
    //                             size={100}
    //                           />
    //                         </div>
    //                       </MassCard>
    //                     ))}
    //                   </div>
    //                 </div>
    //               )
    //             )}
    //           </div>
    //         );
    //       })}
    //     </main>
    //   </div>
    // </>
    <></>
  );
}
