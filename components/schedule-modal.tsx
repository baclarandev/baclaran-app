"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Users } from "lucide-react";
import { toast } from "sonner";

export interface TimeSlot {
  id: string;
  time: string;
  language: string;
  type: string;
  spotsLeft?: number; // optional, default 15 per ministry
}

export interface Booking {
  id: number;
  massId: string;
  volunteerId: number;
  volunteerName: string;
  ministryId: number;
  ministryName: string;
  status: "PENDING" | "CONFIRMED";
}

export interface VolunteerMinistry {
  id: number;
  name: string;
}

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  massType: string;
  schedules: {
    am: TimeSlot[];
    pm: TimeSlot[];
  };
  bookings: Booking[];
  volunteerMinistries: VolunteerMinistry[];
  selectedVolunteerMinistryId: number | null;
  setSelectedVolunteerMinistryId: (id: number) => void;
  isAdmin?: boolean;
  onConfirmBooking?: (bookingId: number) => void;
}

export function ScheduleModal({
  open,
  onClose,
  massType,
  schedules,
  bookings,
  volunteerMinistries,
  selectedVolunteerMinistryId,
  setSelectedVolunteerMinistryId,
  isAdmin = false,
  onConfirmBooking,
}: ScheduleModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Booking[]>([]);

  useEffect(() => {
    setBookedSlots(bookings ?? []);
    // If only 1 ministry, select it automatically
    if (volunteerMinistries.length === 1) {
      setSelectedVolunteerMinistryId(volunteerMinistries[0].id);
    }
  }, [bookings, volunteerMinistries]);

  const handleBook = async () => {
    if (!selectedSlot || !selectedVolunteerMinistryId) {
      toast.error("Please select a ministry and a slot");
      return;
    }

    try {
      const res = await fetch("/api/mass/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          massId: selectedSlot,
          ministryId: selectedVolunteerMinistryId,
        }),
      });

      if (!res.ok) throw new Error("Failed to book slot");

      const data = await res.json();

      toast.success("Booking successful!");
      setBookedSlots((prev) => [...prev, data]);
      setSelectedSlot(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to book slot");
    }
  };

  const handleConfirm = async (bookingId: number) => {
    try {
      const res = await fetch(`/api/mass/bookings/${bookingId}/confirm`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to confirm booking");

      const updated = await res.json();
      setBookedSlots((prev) =>
        prev.map((b) => (b.id === bookingId ? updated : b)),
      );
      if (onConfirmBooking) onConfirmBooking(bookingId);
      toast.success("Booking confirmed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm booking");
    }
  };

  const renderTimeSlot = (slot: TimeSlot) => {
    // Filter bookings only for the currently selected ministry
    const slotBookings = bookedSlots.filter(
      (b) =>
        b.massId.toString() === slot.id &&
        b.ministryId === selectedVolunteerMinistryId,
    );
    const isBooked = slotBookings.length > 0;
    const isSelected = selectedSlot === slot.id;
    const spotsLeft = (slot.spotsLeft ?? 15) - slotBookings.length;

    return (
      <div
        key={slot.id}
        className={`flex flex-col gap-2 p-2 rounded-lg border border-transparent hover:bg-white/5 transition ${
          isSelected ? "bg-yellow-500/10 border-yellow-500" : ""
        }`}
      >
        <button
          disabled={isBooked && !isAdmin}
          onClick={() => setSelectedSlot(isSelected ? null : slot.id)}
          className="flex justify-between items-center w-full text-left"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">{slot.time}</span>
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0 border-primary/30 text-primary"
              >
                {slot.language}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground ml-5">
              {slot.type}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            {isBooked ? (
              slotBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 text-xs ${
                      b.status === "CONFIRMED"
                        ? "text-success"
                        : "text-yellow-400"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> {b.volunteerName} (
                    {b.status.toLowerCase()})
                  </span>

                  {isAdmin && b.status === "PENDING" && (
                    <Button size="sm" onClick={() => handleConfirm(b.id)}>
                      Confirm
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" /> {spotsLeft} spots
              </span>
            )}
          </div>
        </button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full overflow-hidden bg-[#14161F] border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-yellow-500">
            {massType}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Select a time slot to volunteer for this mass schedule
          </DialogDescription>
        </DialogHeader>

        {/* Show dropdown only if more than 1 ministry */}
        {volunteerMinistries.length > 1 ? (
          <div className="px-4 mb-4">
            <label className="block text-sm text-yellow-400 mb-2 font-medium">
              Select Ministry
            </label>
            <select
              value={selectedVolunteerMinistryId ?? ""}
              onChange={(e) =>
                setSelectedVolunteerMinistryId(Number(e.target.value))
              }
              className="w-full rounded-lg bg-card/20 border border-yellow-500/30 text-white px-3 py-2"
            >
              <option value="" disabled>
                Choose a ministry
              </option>
              {volunteerMinistries.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        ) : volunteerMinistries.length === 1 ? (
          <div className="px-4 mb-4 text-sm text-yellow-400">
            Ministry: {volunteerMinistries[0].name}
          </div>
        ) : null}

        <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-6">
          {/* AM Schedule */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-8 h-px bg-[#14161F]/30"></span>
              Morning (AM)
              <span className="flex-1 h-px bg-[#14161F]/30"></span>
            </h4>
            <div className="grid text-gray-300 gap-2">
              {schedules.am.map(renderTimeSlot)}
            </div>
          </div>

          {/* PM Schedule */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-8 h-px bg-[#14161F]/30"></span>
              Afternoon/Evening (PM)
              <span className="flex-1 h-px bg-[#14161F]/30"></span>
            </h4>
            <div className="grid text-gray-300 gap-2">
              {schedules.pm.map(renderTimeSlot)}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border cursor-pointer text-white bg-[#14161F] border-[0.5] hover:bg-yellow-500"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBook}
            disabled={!selectedSlot || !selectedVolunteerMinistryId}
            className="bg-yellow-600 text-black font-medium px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
