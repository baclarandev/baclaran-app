"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useMinistries } from "@/app/services/ministries";

export default function SummaryContainer({ user }: any) {
  const [data, setData] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [selectedMinistry, setSelectedMinistry] = useState<string>("ALL");
  const userMinistry = user?.ministry.name;
  const isAdmin = user?.role === "ADMIN";
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  // useEffect(() => {
  //   if (ministry) {
  //     setMinistries(ministry);
  //   }
  // }, [ministry]);
  const nameMonth = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month - 1] || "Invalid month";
  };
  const ministryName =
    selectedMinistry === "ALL"
      ? "All Ministries"
      : ministries.find((m) => String(m.id) === selectedMinistry)?.name || "";
  // Fetch data whenever month, year, or ministry changes
  useEffect(() => {
    const params = new URLSearchParams({
      month: String(month),
      year: String(year),
    });

    // Add ministryId if not "ALL" and is admin
    if (isAdmin && selectedMinistry !== "ALL") {
      params.append("ministryId", selectedMinistry);
    }

    fetch(`/api/attendance/summary?${params.toString()}`)
      .then((res) => res.json())
      .then((response) => {
        // Handle both array and object responses
        const summaryData = Array.isArray(response)
          ? response
          : response.data || response.volunteers || [];
        setData(summaryData);
      });
  }, [month, year, selectedMinistry, isAdmin]);
  console.log(userMinistry, "current ministry");
  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalVolunteers = data.length;
  // Print all data (ignore pagination)
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Attendance Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 20px; text-align: left; }
            .header img { width: 70px; height: 70px; object-fit: contain; }
            .title { text-align: center; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            th { background: #eee; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
            .line { margin-top: 50px; border-top: 1px solid #000; width: 200px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${window.location.origin}/logo.svg" />
            <div>
              <strong>National Shrine of Our Mother of Perpetual Help</strong><br/>
              Baclaran Church<br/>
              Redemptorist rd, Parañaque City, Philippines
            </div>
          </div>

          <div class="title">
            <h2>Summary of Attendance</h2>
            <h3>for the month of</h3>
            <p>${nameMonth(month)} ${year}</p>
          </div>
<p><strong>Ministry:</strong> ${userMinistry}</p> <p><strong>Minimum Served per volunteer:</strong> _____</p>
<p><strong>Total Volunteers:</strong> ${totalVolunteers}</p>
          <table>
            <thead>
              <tr>
                <th>Year Started</th>
                <th>Name</th>
                <th>Remarks</th>
                <th>Commitment</th>
                <th>Attended</th>
                <th>Absent</th>
                <th>Meeting</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) => `
                  <tr>
                    <td>${row.yearStarted}</td>
                    <td>${row.name}</td>
                    <td></td>
                    <td>0</td>
                    <td>0</td>
                    <td>${row.absences}</td>
                    <td>${row.meeting}</td>
                    <td>${row.status}</td>
                  </tr>
                `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <div>
              Prepared by:
              <div class="line"></div>
              <div>Secretary of the Ministry or Group</div>
            </div>
            <div>
              Noted by:
              <div class="line"></div>
             <div>Chairman of the Ministry or Group</div>
            </div>
            <div>
              Approved by:
              <div class="line"></div>
              <div>Spiritual Director of the Ministry or Group</div>
            </div>
          </div>

          <p style="margin-top:20px; font-size:12px;">
            Printed: ${new Date().toLocaleString()}
          </p>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div>
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="md:ml-64">
        <Header user={user} />
        <div className="p-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/attendance">Attendance</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Summary</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-xl text-center font-semibold mb-4">
            Summary of Attendance
          </h1>

          {/* Filter by Month & Year */}
          <div className="flex justify-center gap-4 mb-4">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border p-1 rounded"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {nameMonth(m)}
                </option>
              ))}
            </select>
            {isAdmin && (
              <select
                value={selectedMinistry}
                onChange={(e) => setSelectedMinistry(e.target.value)}
                className="border p-1 rounded"
              >
                <option value="ALL">All Ministries</option>

                {ministries.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border p-1 rounded"
            >
              {Array.from(
                { length: 10 },
                (_, i) => new Date().getFullYear() - i,
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <Button onClick={handlePrint}>🖨️ Print</Button>
          </div>
          <div>
            <p>
              Total Volunteers:{" "}
              <span className="font-bold">{totalVolunteers}</span>
            </p>
          </div>
          <h3>
            Name of Ministry: <strong>{userMinistry}</strong>
          </h3>
          {/* Table */}
          <table className="w-full mt-4 border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-800">
                <th className="text-left">Year Started</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left">Remarks</th>
                <th className="text-left">Commitment</th>
                <th className="text-left">Attended</th>
                <th className="text-left">Absent</th>
                <th className="text-left">Meeting Attendance</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr
                  key={row.volunteerId}
                  className="border-b border-neutral-700"
                >
                  <td>{row.yearStarted}</td>
                  <td>{row.name}</td>
                  <td>Remarks here</td>
                  <td>{row.commitment === 0 ? "None" : row.commitment}</td>
                  <td>{row.attended}</td>
                  <td>{row.absences}</td>
                  <td>{row.meeting}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-4 gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="px-2 py-1">
              {currentPage} / {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
