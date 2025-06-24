"use client";
import React, { useState } from "react";
import { Download, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIssues } from '@/lib/queries';

type StaffIssue = {
  id: string;
  request_id: string;
  description: string;
  emergency: boolean;
  created_at: string;
};

export default function IssueManagementPage() {
  const { data: issues = [], isLoading, isError } = useIssues();
  const [status, setStatus] = useState("");
  const [time, setTime] = useState("");
  const router = useRouter();

  const handleIssueClick = (issueId: string) => {
    router.push(`/dashboard/staff/issue-management/${issueId}`);
  };

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
    interface CsvIssue {
      id: string;
      created_at: string;
      purpose: string;
      destination: string;
      passengers: string;
      issueType: string;
      location: string;
    }

    const csvData: string[][] = (issues as CsvIssue[])
      .filter((i: CsvIssue) => !status || i.issueType === status)
      .map((issue: CsvIssue) => [
      issue.id,
      issue.created_at,
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  if (isError) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Failed to load issues.</div>;
  }

  return (
    <main className="min-h-screen bg-[#e6f2fa] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#0872B3]" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0872B3]">
              Issue History
            </h1>
          </div>
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
                <th className="px-6 py-4 text-left font-semibold">Issue ID</th>
                <th className="px-6 py-4 text-left font-semibold">Request ID</th>
                <th className="px-6 py-4 text-left font-semibold">Description</th>
                <th className="px-6 py-4 text-left font-semibold">Emergency</th>
                <th className="px-6 py-4 text-left font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody>
              {(!issues || issues.length === 0) ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-lg">No issues found.</td>
                </tr>
              ) : (
                issues.map((issue: StaffIssue, idx: number) => (
                  <tr
                    key={issue.id}
                    onClick={() => handleIssueClick(issue.id)}
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
                    <td className="px-6 py-4">{issue.request_id}</td>
                    <td className="px-6 py-4">{issue.description}</td>
                    <td className="px-6 py-4">{issue.emergency ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4">{issue.created_at ? new Date(issue.created_at).toLocaleString() : ''}</td>
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
