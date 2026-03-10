"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export default function AttendanceSummary({ user }: any) {
  const [data, setData] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch(`/api/attendance/summary?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then(setData);
  }, [month, year]);

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200">
      <Sidebar user={user} />

      <div className="md:ml-64">
        <Header user={user} />

        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">Attendance Summary</h1>

          <Button onClick={() => window.print()}>🖨️ Print</Button>

          <table className="w-full mt-4 border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-800">
                <th className="p-2">Code</th>
                <th>Name</th>
                <th>Ministry</th>
                <th>Monthly Served</th>
                <th>Absences</th>
                <th>Meeting</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr
                  key={row.volunteerId}
                  className="border-b border-neutral-700"
                >
                  <td className="p-2">{row.volunteerCode}</td>
                  <td>{row.name}</td>
                  <td>{row.ministry}</td>
                  <td>{row.monthlyServed}</td>
                  <td>{row.absences}</td>
                  <td>{row.meeting}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
