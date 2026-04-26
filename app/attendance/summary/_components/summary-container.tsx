"use client";

import { useEffect, useState, useMemo } from "react";
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

import {
  Printer,
  Users,
  Calendar,
  Search,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  AttendanceTableSkeleton,
  FilterSectionSkeleton,
  SkeletonCard,
} from "./summary-skeleton";
import { EditableCell } from "./summary-table-cell";
const getYearOptions = (startYear = 2025) => {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i,
  ).reverse();
};
const years = getYearOptions(2025);
export default function SummaryContainer({ user }: any) {
  const [data, setData] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [selectedMinistry, setSelectedMinistry] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);
  const userMinistry = user?.ministry.name;
  const isAdmin = user?.role === "ADMIN";
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          month: String(month),
          year: String(year),
        });

        // Add ministryId if not "ALL" and is admin
        if (isAdmin && selectedMinistry !== "ALL") {
          params.append("ministryId", selectedMinistry);
        }

        const response = await fetch(
          `/api/attendance/summary?${params.toString()}`,
        );
        const result = await response.json();

        // Handle both array and object responses
        const summaryData = Array.isArray(result)
          ? result
          : result.data || result.volunteers || [];
        setData(summaryData);
        setCurrentPage(1); // Reset to first page on new data
      } catch (error) {
        console.error("Error fetching data:", error);
        toast("Failed to load attendance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [month, year, selectedMinistry, isAdmin]);

  const handleSaveRemarks = async (volunteerId: number, remarks: string) => {
    try {
      const response = await fetch("/api/attendance/summary", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId, remarks, year, month }),
      });

      if (!response.ok) {
        throw new Error("Failed to save remarks");
      }

      // Update local data
      setData((prevData) =>
        prevData.map((v) =>
          v.volunteerId === volunteerId ? { ...v, remarks } : v,
        ),
      );

      toast("Remarks updated successfully");
    } catch (error) {
      console.error("Error saving remarks:", error);
      toast("Failed to save remarks");
      throw error;
    }
  };

  // Search and filter logic
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.name?.toLowerCase().includes(query) ||
          row.remarks?.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Handle null/undefined values
      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";

      // Convert to comparable values
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as any).toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [data, searchQuery, sortColumn, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalVolunteers = data.length;
  const filteredVolunteers = filteredData.length;
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Sidebar user={user} isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="md:ml-64">
        <Header user={user} />
        <div className="p-6 lg:p-8 space-y-8">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/attendance"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Attendance
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-semibold">
                  Summary
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                Attendance Summary
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Manage and track volunteer attendance records
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        Total Volunteers
                      </p>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {totalVolunteers}
                      </p>
                      {searchQuery && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {filteredVolunteers} shown
                        </p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        Period
                      </p>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {nameMonth(month)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {year}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        Ministry
                      </p>
                      <p className="text-lg font-bold text-foreground mt-2 line-clamp-2">
                        {userMinistry}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <span className="text-xl">✝️</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Search and Filters Section */}
          {isLoading ? (
            <FilterSectionSkeleton />
          ) : (
            <>
              {/* Search Bar */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by volunteer name or remarks..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Found{" "}
                    <span className="font-semibold text-foreground">
                      {filteredVolunteers}
                    </span>{" "}
                    result{filteredVolunteers !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Filters Section */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Month
                    </label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {nameMonth(m)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Ministry
                      </label>
                      <select
                        value={selectedMinistry}
                        onChange={(e) => setSelectedMinistry(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="ALL">All Ministries</option>
                        {ministries.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Year
                    </label>

                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handlePrint}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2 font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Printer className="w-5 h-5" />
                  Print Report
                </Button>
              </div>
            </>
          )}

          {/* Table Section */}
          {isLoading ? (
            <AttendanceTableSkeleton />
          ) : filteredData.length === 0 ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No volunteers found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search criteria to find volunteers."
                    : "No attendance records available for the selected period."}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {[
                        "yearStarted",
                        "name",
                        "remarks",
                        "commitment",
                        "attended",
                        "absences",
                        "meeting",
                        "status",
                      ].map((col) => (
                        <th
                          key={col}
                          className="text-left px-6 py-4 font-semibold text-foreground text-sm cursor-pointer hover:bg-muted/60 transition-colors group"
                          onClick={() => {
                            if (sortColumn === col) {
                              setSortDirection(
                                sortDirection === "asc" ? "desc" : "asc",
                              );
                            } else {
                              setSortColumn(col);
                              setSortDirection("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span>
                              {col === "yearStarted" && "Year Started"}
                              {col === "name" && "Name"}
                              {col === "remarks" && "Remarks"}
                              {col === "commitment" && "Commitment"}
                              {col === "attended" && "Attended"}
                              {col === "absences" && "Absent"}
                              {col === "meeting" && "Meeting"}
                              {col === "status" && "Status"}
                            </span>
                            {sortColumn === col && (
                              <>
                                {sortDirection === "asc" ? (
                                  <ChevronUp className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-blue-600" />
                                )}
                              </>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedData.map((row) => (
                      <tr
                        key={row.volunteerId}
                        className="hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-foreground">
                          {row.yearStarted}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {row.name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <EditableCell
                            value={row.remarks || ""}
                            onSave={(newValue) =>
                              handleSaveRemarks(row.volunteerId, newValue)
                            }
                            placeholder="Click to add remarks..."
                            className="max-w-xs"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-semibold">
                            {row.commitment === 0 ? "None" : row.commitment}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 text-green-700 text-xs font-semibold">
                            {row.attended}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 text-red-700 text-xs font-semibold">
                            {row.absences}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {row.meeting}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              row.status === "ACTIVE"
                                ? "bg-green-500/10 text-green-700"
                                : "bg-gray-500/10 text-gray-700"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && filteredData.length > 0 && (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filteredData.length}
              </span>{" "}
              result
              {filteredData.length !== 1 ? "s" : ""}
            </div>

            <div className="flex items-center gap-3">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                variant="outline"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  Page {currentPage} of {totalPages || 1}
                </span>
              </div>
              <Button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
