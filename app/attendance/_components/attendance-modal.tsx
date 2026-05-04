"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ServiceRecord {
  timeIn: Date;
  timeOut?: Date;
  order: number;
}

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (timeIn?: string, timeOut?: string) => void;
  isSaving?: boolean;
  volunteerId: number;
  volunteerName: string;
  date: Date;
  readOnly?: boolean;
  initialTimeIn?: Date | null;
  initialTimeOut?: Date | null;
  serviceHistory?: ServiceRecord[];
}

export const AttendanceModal = React.memo(
  ({
    isOpen,
    onClose,
    onSave,
    isSaving = false,
    volunteerName,
    date,
    initialTimeIn,
    initialTimeOut,
    serviceHistory = [],
    readOnly = false,
  }: AttendanceModalProps) => {
    const [timeIn, setTimeIn] = useState<Date | null>(null);
    const [timeOut, setTimeOut] = useState<Date | null>(null);
    const [hoursWorked, setHoursWorked] = useState<number>(0);
    const [showHistory, setShowHistory] = useState(false);

    const maxServicesPerDay = 12;
    const serviceCount = serviceHistory.length;
    const isMaxReached = serviceCount >= maxServicesPerDay;
    const nextServiceNumber = serviceCount + 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const isPastDate = selectedDate < today;
    const effectiveReadOnly = readOnly || isPastDate;

    useEffect(() => {
      if (!isOpen) return;

      setTimeIn(initialTimeIn ? new Date(initialTimeIn) : null);
      setTimeOut(initialTimeOut ? new Date(initialTimeOut) : null);
    }, [isOpen, date, initialTimeIn, initialTimeOut]);

    useEffect(() => {
      if (timeIn && timeOut) {
        let diff = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60);

        if (diff < 0) diff += 24;

        setHoursWorked(Number(diff.toFixed(2)));
      } else {
        setHoursWorked(0);
      }
    }, [timeIn, timeOut]);

    const formatTime = (date: Date) =>
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const handleTimeIn = () => {
      if (isMaxReached) return;
      setTimeIn(new Date());
      setTimeOut(null);
    };

    const handleTimeOut = () => {
      if (!timeIn) return;
      setTimeOut(new Date());
    };

    const handleSave = () => {
      if (!timeIn || !timeOut) return;

      const dateStr = date.toISOString().split("T")[0];

      const timeInISO = `${dateStr}T${timeIn.toTimeString().slice(0, 8)}`;
      const timeOutISO = `${dateStr}T${timeOut.toTimeString().slice(0, 8)}`;

      onSave(timeInISO, timeOutISO);

      setTimeIn(null);
      setTimeOut(null);
      setHoursWorked(0);
      onClose();
    };

    const handleReset = () => {
      setTimeIn(null);
      setTimeOut(null);
      setHoursWorked(0);
    };

    const visibleHistory = serviceHistory.slice(-3);

    return (
      <>
        {/* MAIN MODAL */}
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md bg-black text-white border-gray-600">
            <DialogHeader>
              <DialogTitle>
                {effectiveReadOnly
                  ? "Attendance Record (View Only)"
                  : "Record Attendance"}
              </DialogTitle>
            </DialogHeader>

            {effectiveReadOnly && (
              <p className="text-yellow-400 text-sm">
                {isPastDate
                  ? "This date has passed. Viewing in read-only mode."
                  : "Viewing previous record (read-only)"}
              </p>
            )}

            {/* SERVICE STATUS */}
            <div className="border-b pb-4 space-y-3">
              <div>
                <p className="text-sm text-gray-400">Today's Service Status</p>
                <p className="text-lg font-semibold">
                  Service {nextServiceNumber} / {maxServicesPerDay}
                </p>
              </div>

              {/* HISTORY PREVIEW */}
              {serviceHistory.length > 0 && (
                <div className="bg-neutral-800 p-3 rounded space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400 font-semibold">
                      Service History
                    </p>

                    {/* {!effectiveReadOnly && serviceHistory.length > 3 && ( */}
                    <button
                      onClick={() => setShowHistory(true)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      See more ({serviceHistory.length})
                    </button>
                    {/* )} */}
                  </div>

                  {visibleHistory.map((service, idx) => (
                    <div
                      key={idx}
                      className="text-sm border-l-2 border-blue-500 pl-2"
                    >
                      <p className="text-blue-400 font-semibold">
                        Service #{service.order}
                      </p>
                      <p className="text-gray-400">
                        In: {new Date(service.timeIn).toLocaleTimeString()}
                      </p>
                      {service.timeOut && (
                        <p className="text-gray-400">
                          Out: {new Date(service.timeOut).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isMaxReached && (
                <p className="text-red-400 text-sm">Maximum services reached</p>
              )}
            </div>

            {/* BODY */}
            <div className="space-y-4 py-4">
              <div className="border-b pb-3">
                <p className="text-sm text-gray-400">Volunteer</p>
                <p className="text-lg font-semibold">{volunteerName}</p>
                <p className="text-sm text-gray-500">{date.toDateString()}</p>
              </div>

              {!effectiveReadOnly && (
                <div className="space-y-2">
                  <Button
                    onClick={handleTimeIn}
                    disabled={isMaxReached}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Time In
                  </Button>

                  <Button
                    onClick={handleTimeOut}
                    disabled={!timeIn}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Time Out
                  </Button>
                </div>
              )}

              {timeIn && (
                <p className="text-green-400">In: {formatTime(timeIn)}</p>
              )}

              {timeOut && (
                <p className="text-blue-400">Out: {formatTime(timeOut)}</p>
              )}
            </div>

            {/* FOOTER */}
            {!effectiveReadOnly && (
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>

                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>

                <Button onClick={handleSave} disabled={isSaving || !timeIn}>
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            )}

            {effectiveReadOnly && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* HISTORY MODAL (OUTSIDE MAIN DIALOG — IMPORTANT FIX) */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-lg bg-black text-white">
            <DialogHeader>
              <DialogTitle>Full Attendance History</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {serviceHistory.map((s, i) => (
                <div key={i} className="border-b border-gray-700 pb-2">
                  <p>Service #{s.order}</p>
                  <p>In: {new Date(s.timeIn).toLocaleTimeString()}</p>
                  {s.timeOut && (
                    <p>Out: {new Date(s.timeOut).toLocaleTimeString()}</p>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

AttendanceModal.displayName = "AttendanceModal";
