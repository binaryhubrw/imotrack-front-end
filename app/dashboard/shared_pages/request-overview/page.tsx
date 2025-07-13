import React from 'react'

export default function page() {
  return (
    <div>
      request overview
    </div>
  )
}


// "use client";

// import { useState } from "react";
// import { UserPlus, Eye } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useFmRequests } from '@/lib/queries';
// import type { StaffRequestResponse } from '@/types/next-auth';


// function statusBadge(status: string) {
//   const base = "inline-block px-3 py-1 text-xs font-semibold rounded-full";
//   if (status?.toUpperCase() === "PENDING") return <span className={base + " bg-yellow-100 text-yellow-800"}>Pending</span>;
//   if (status?.toUpperCase() === "APPROVED") return <span className={base + " bg-green-100 text-green-700"}>Approved</span>;
//   if (status?.toUpperCase() === "REJECTED") return <span className={base + " bg-pink-100 text-pink-700"}>Rejected</span>;
//   if (status?.toUpperCase() === "COMPLETED") return <span className={base + " bg-blue-100 text-blue-700"}>Completed</span>;
//   if (status?.toUpperCase() === "ACTIVE") return <span className={base + " bg-indigo-100 text-indigo-700"}>Active</span>;
//   return <span className={base + " bg-gray-100 text-gray-700"}>{status}</span>;
// }

// // Helper to get department safely
// type RequesterWithDepartment = { department: string };

// function getDepartment(requester: unknown): string {
//   if (
//     requester &&
//     typeof requester === 'object' &&
//     'department' in requester &&
//     typeof (requester as RequesterWithDepartment).department === 'string'
//   ) {
//     return (requester as RequesterWithDepartment).department;
//   }
//   return 'Unknown';
// }

// // Helper to get requester full name safely
// function getRequesterName(request: StaffRequestResponse): string {
//   if (request.full_name) return request.full_name;
//   const requester = request.requester;
//   if (
//     requester &&
//     typeof requester === 'object' &&
//     'first_name' in requester &&
//     'last_name' in requester &&
//     typeof (requester as { first_name: unknown }).first_name === 'string' &&
//     typeof (requester as { last_name: unknown }).last_name === 'string'
//   ) {
//     return `${(requester as { first_name: string }).first_name} ${(requester as { last_name: string }).last_name}`;
//   }
//   return '';
// }

// export default function RecentRequests() {
//   const { data: requests = [], isLoading, isError } = useFmRequests();
//   const [dept, setDept] = useState("");
//   const [stat, setStat] = useState("");
//   const router = useRouter();

//   // Extract unique departments from real data
//   const departments = [
//     "All Departments",
//     ...Array.from(new Set((requests || []).map(r => getDepartment(r.requester))))
//   ];
//   const statuses = ["All Status", "PENDING", "APPROVED", "REJECTED", "COMPLETED", "ACTIVE"];

//   // Filtering logic for real data
//   const filtered = (requests || []).filter(r => {
//     const department = getDepartment(r.requester);
//     const status = r.status?.toUpperCase() || '';
//     return (dept === '' || department === dept) && (stat === '' || status === stat);
//   });

//   return (
//     <div className="p-4 min-h-screen bg-gradient-to-br from-[#e6f2fa] to-[#f9fafb] w-full">
//       <div className="w-full">
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-6 border-b border-gray-100">
//             <div className="flex items-center gap-3">
//               <UserPlus className="w-7 h-7 text-[#0872B3]" />
//               <h2 className="text-xl font-bold text-[#0872B3]">Recent Requests</h2>
//             </div>
//             <div className="flex gap-2 w-full sm:w-auto">
//               <div className="relative w-full sm:w-44">
//                 <select
//                   className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] transition"
//                   value={dept}
//                   onChange={e => setDept(e.target.value === "All Departments" ? "" : e.target.value)}
//                 >
//                   {departments.map(dep => (
//                     <option key={dep} value={dep}>{dep}</option>
//                   ))}
//                 </select>
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                 </span>
//               </div>
//               <div className="relative w-full sm:w-40">
//                 <select
//                   className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] transition"
//                   value={stat}
//                   onChange={e => setStat(e.target.value === "All Status" ? "" : e.target.value)}
//                 >
//                   {statuses.map(s => (
//                     <option key={s} value={s}>{s}</option>
//                   ))}
//                 </select>
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                 </span>
//               </div>
//             </div>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-[15px]">
//               <thead>
//                 <tr className="text-gray-700 bg-gray-50 uppercase text-xs">
//                   <th className="py-3 px-6 font-semibold">Request ID</th>
//                   <th className="py-3 px-6 font-semibold">Requester</th>
//                   <th className="py-3 px-6 font-semibold">Reason</th>
//                   <th className="py-3 px-6 font-semibold">Date</th>
//                   <th className="py-3 px-6 font-semibold">Status</th>
//                   <th className="py-3 px-6 font-semibold">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {isLoading ? (
//                   <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-lg">Loading...</td></tr>
//                 ) : isError ? (
//                   <tr><td colSpan={7} className="text-center py-10 text-red-500 text-lg">Failed to load requests.</td></tr>
//                 ) : filtered.length === 0 ? (
//                   <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-lg">No requests found.</td></tr>
//                 ) : (
//                   filtered.map((request, idx) => (
//                     <tr
//                       onClick={() => router.push(`/dashboard/fleet-manager/request-management?id=${request.id}`)}
//                       key={request.id}
//                       className={`
//                         ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                         hover:bg-blue-50/70 transition-colors cursor-pointer duration-150
//                       `}
//                       style={{ height: "56px" }}
//                     >
//                       <td className="py-3 px-6 font-mono">{request.id}</td>
//                       <td className="py-3 px-6">{getRequesterName(request)}</td>
//                       <td className="py-3 px-6">{request.trip_purpose}</td>
//                       <td className="py-3 px-6">{request.requested_at ? new Date(request.requested_at).toLocaleDateString() : '-'}</td>
//                       <td className="py-3 px-6">{statusBadge(request.status)}</td>
//                       <td className="py-3 px-6">
//                         <button
//                           className="p-2 rounded hover:bg-blue-100 transition"
//                           title="View Details"
//                           aria-label="View Details"
//                           onClick={e => { e.stopPropagation(); router.push(`/dashboard/fleet-manager/request-management?id=${request.id}`); }}
//                         >
//                           <Eye className="w-5 h-5 text-[#0872B3]" />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
