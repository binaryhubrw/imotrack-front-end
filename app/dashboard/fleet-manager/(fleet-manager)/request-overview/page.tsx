

"use client";

import { useState } from "react";
import { UserPlus, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

function statusBadge(status: unknown) {
  const base = "inline-block px-3 py-1 text-xs font-semibold rounded-full";
  if (status === "Pending") return <span className={base + " bg-yellow-100 text-yellow-800"}>Pending</span>;
  if (status === "Approved") return <span className={base + " bg-green-100 text-green-700"}>Approved</span>;
  return <span className={base + " bg-pink-100 text-pink-700"}>Declined</span>;
}

export default function RecentRequests() {
  const [requests] = useState([
    { id: "VR-001", requester: "John Doe", department: "Computer Science", reason: "Field Trip", date: "2024-03-15", status: "Pending" },
    { id: "VR-002", requester: "Jane Smith", department: "Engineering", reason: "Official Meeting", date: "2024-03-16", status: "Approved" },
    { id: "VR-003", requester: "Mike Johnson", department: "Business", reason: "Campus Transfer", date: "2024-03-14", status: "Declined" },
    { id: "VR-004", requester: "John Doe", department: "Computer Science", reason: "Field Trip", date: "2024-03-15", status: "Pending" },
    { id: "VR-005", requester: "Jane Smith", department: "Engineering", reason: "Official Meeting", date: "2024-03-16", status: "Approved" },
    { id: "VR-006", requester: "Mike Johnson", department: "Business", reason: "Campus Transfer", date: "2024-03-14", status: "Declined" },
  ]);
  const [dept, setDept] = useState("");
  const [stat, setStat] = useState("");

  const filtered = requests.filter(
    r => (dept === "" || r.department === dept) && (stat === "" || r.status === stat)
  );

  const departments = ["All Departments", ...Array.from(new Set(requests.map(r => r.department)))];
  const statuses = ["All Status", "Pending", "Approved", "Declined"];

  const router = useRouter()
  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-[#e6f2fa] to-[#f9fafb] w-full">
      {/* Remove max-w-3xl and mx-auto to allow full width */}
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <UserPlus className="w-7 h-7 text-[#0872B3]" />
              <h2 className="text-xl font-bold text-[#0872B3]">Recent Requests</h2>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-44">
                <select
                  className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] transition"
                  value={dept}
                  onChange={e => setDept(e.target.value === "All Departments" ? "" : e.target.value)}
                >
                  {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
              <div className="relative w-full sm:w-40">
                <select
                  className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] transition"
                  value={stat}
                  onChange={e => setStat(e.target.value === "All Status" ? "" : e.target.value)}
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[15px]">
              <thead>
                <tr className="text-gray-700 bg-gray-50 uppercase text-xs">
                  <th className="py-3 px-6 font-semibold">Request ID</th>
                  <th className="py-3 px-6 font-semibold">Requester</th>
                  <th className="py-3 px-6 font-semibold">Department</th>
                  <th className="py-3 px-6 font-semibold">Reason</th>
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400 text-lg">No requests found.</td>
                  </tr>
                ) : (
                  filtered.map((request, idx) => (
                    <tr
                    onClick={() => router.push('/dashboard/request-management')} 
                      key={request.id}
                      className={`
                        ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        hover:bg-blue-50/70 transition-colors cursor-pointer duration-150
                      `}
                      style={{ height: "56px" }}
                    >
                      <td className="py-3 px-6 font-mono">{request.id}</td>
                      <td className="py-3 px-6">{request.requester}</td>
                      <td className="py-3 px-6">{request.department}</td>
                      <td className="py-3 px-6">{request.reason}</td>
                      <td className="py-3 px-6">{request.date}</td>
                      <td className="py-3 px-6">{statusBadge(request.status)}</td>
                      <td className="py-3 px-6">
                        <button
                          className="p-2 rounded hover:bg-blue-100 transition"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <Eye className="w-5 h-5 text-[#0872B3]" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
