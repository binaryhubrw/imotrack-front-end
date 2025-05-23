"use client";
import React, { useState } from "react";
import { Download } from "lucide-react";


const ISSUES = [
  {
    id: "REQ-001",
    date: "2024-02-22",
    purpose: "Field Trip",
    destination: "Huye Campus",
    passengers: 15,
    issueType: "Accident",
    location: "Musanze",
  },
  {
    id: "REQ-002",
    date: "2024-02-21",
    purpose: "Conference",
    destination: "Kigali Convention Center",
    passengers: 4,
    issueType: "Delay",
    location: "Kirehe",
  },
  {
    id: "REQ-003",
    date: "2024-02-20",
    purpose: "Research Visit",
    destination: "Kigali Heights",
    passengers: 3,
    issueType: "Fuel",
    location: "Nyagatare",
  },
  {
    id: "REQ-004",
    date: "2024-02-19",
    purpose: "Staff Meeting",
    destination: "Kigali Business Center",
    passengers: 8,
    issueType: "Accident",
    location: "Gasabo",
  },
  {
    id: "REQ-005",
    date: "2024-02-18",
    purpose: "Student Tour",
    destination: "Kigali Genocide Memorial",
    passengers: 25,
    issueType: "Delay",
    location: "Kicukiro",
  },
  {
    id: "REQ-006",
    date: "2024-02-17",
    purpose: "Official Visit",
    destination: "Ministry of Education",
    passengers: 5,
    issueType: "Fuel",
    location: "Nyarugenge",
  },
];

function issueBadge(type: string) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold";
  switch (type) {
    case "Accident":
      return (
        <span className={base + " bg-yellow-300 text-gray-900"}>Accident</span>
      );
    case "Delay":
      return <span className={base + " bg-green-400 text-white"}>Delay</span>;
    case "Fuel":
      return <span className={base + " bg-red-400 text-white"}>Fuel</span>;
    default:
      return (
        <span className={base + " bg-gray-200 text-gray-700"}>{type}</span>
      );
  }
}

export default function IssueReportTablePage() {
  const [status, setStatus] = useState("");
  const [time, setTime] = useState("");
  const [issues, setIssues] = useState(ISSUES);

  const handleExport = () => {
    const headers = [
      "Request ID",
      "Date",
      "Purpose",
      "Destination",
      "Passengers",
      "Issue Type",
      "Location",
    ];
    const csvData = issues
      .filter((i) => !status || i.issueType === status)
      .map((issue) => [
        issue.id,
        issue.date,
        issue.purpose,
        issue.destination,
        issue.passengers,
        issue.issueType,
        issue.location,
      ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `issue_history_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-[#e6f2fa] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0872B3]">
            Issue History
          </h1>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center w-full md:w-auto">
            <div className="flex-1 flex gap-2">
              <div className="relative w-full md:w-44">
                <select
                  className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] transition"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Accident">Accident</option>
                  <option value="Delay">Delay</option>
                  <option value="Fuel">Fuel</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M7 10l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <div className="relative w-full md:w-40">
                <select
                  className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] transition"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option value="">All Time</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M7 10l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0872B3] text-white font-semibold shadow transition-colors text-base focus:outline-none focus:ring-2 focus:ring-[#0872B3]"
            >
              <span className="inline-flex items-center justify-center bg-white/20 rounded-full p-1">
                <Download className="w-5 h-5" />
              </span>
              Export
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-[15px]">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
              <tr className="text-gray-700">
                <th className="px-6 py-4 text-left font-semibold">
                  Request ID
                </th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-left font-semibold">Purpose</th>
                <th className="px-6 py-4 text-left font-semibold">Destination</th>
                <th className="px-6 py-4 text-left font-semibold">Passengers</th>
                <th className="px-6 py-4 text-left font-semibold">Issue Type</th>
                <th className="px-6 py-4 text-left font-semibold">Location</th>
              </tr>
            </thead>
            <tbody>
              {issues.filter((i) => !status || i.issueType === status)
                .length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-gray-400 text-lg"
                  >
                    No issues found.
                  </td>
                </tr>
              ) : (
                issues
                  .filter((i) => !status || i.issueType === status)
                  .map((issue, idx) => (
                    <tr
                      key={issue.id}
                      className={`
                ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                hover:bg-blue-50/70
                cursor-pointer
                transition-colors
                duration-150
                rounded-lg
              `}
                      style={{ height: "64px" }}
                    >
                      <td className="px-6 py-4 font-mono">{issue.id}</td>
                      <td className="px-6 py-4">{issue.date}</td>
                      <td className="px-6 py-4">{issue.purpose}</td>
                      <td className="px-6 py-4">{issue.destination}</td>
                      <td className="px-6 py-4 text-center">{issue.passengers}</td>
                      <td className="px-6 py-4">{issueBadge(issue.issueType)}</td>
                      <td className="px-6 py-4">{issue.location}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
