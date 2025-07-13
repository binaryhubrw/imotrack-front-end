import React from 'react'

export default function IssueDetailsPage() {
  return (
    <div>
      
    </div>
  )
}

// "use client";
// import React, { useState } from "react";
// import { Download, AlertTriangle } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useMyIssues } from '@/lib/queries';

// type StaffIssue = {
//   vehicle_model: string;
//   plate_number: string;
//   date_reported: string;
//   trip_purpose: string;
//   description: string;
//   status: string;
// };

// export default function IssueManagementPage() {
//   const { data: issues = [], isLoading, isError } = useMyIssues();
//   const [status, setStatus] = useState("");
//   const [time, setTime] = useState("");
//   const router = useRouter();

//   const handleIssueClick = (index: number) => {
//     // Since we don't have an ID, we'll use the index for now
//     // In a real app, you'd want the backend to return an issue ID
//     router.push(`/dashboard/staff/issue-management/${index}`);
//   };

//   const handleExport = () => {
//     const headers = [
//       "Vehicle Model",
//       "Plate Number", 
//       "Date Reported",
//       "Trip Purpose",
//       "Description",
//       "Status",
//     ];

//     const csvData: string[][] = (issues as StaffIssue[])
//       .filter((i: StaffIssue) => !status || i.status === status)
//       .map((issue: StaffIssue) => [
//         issue.vehicle_model,
//         issue.plate_number,
//         new Date(issue.date_reported).toLocaleDateString(),
//         issue.trip_purpose,
//         issue.description,
//         issue.status,
//       ]);

//     const csvContent = [
//       headers.join(","),
//       ...csvData.map((row) => row.join(",")),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     const url = URL.createObjectURL(blob);
//     link.setAttribute("href", url);
//     link.setAttribute(
//       "download",
//       `issue_history_${new Date().toISOString().split("T")[0]}.csv`
//     );
//     link.style.visibility = "hidden";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (isLoading) {
//     return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
//   }
//   if (isError) {
//     return <div className="min-h-screen flex items-center justify-center text-red-600">Failed to load issues.</div>;
//   }

//   return (
//     <main className="min-h-screen bg-[#e6f2fa] px-4 py-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
//           <div className="flex items-center gap-3">
//             <AlertTriangle className="w-8 h-8 text-[#0872B3]" />
//             <h1 className="text-2xl md:text-3xl font-extrabold text-[#0872B3]">
//               My Issue History
//             </h1>
//           </div>
//           <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center w-full md:w-auto">
//             <div className="flex-1 flex gap-2">
//               <div className="relative w-full md:w-44">
//                 <select
//                   className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] transition"
//                   value={status}
//                   onChange={(e) => setStatus(e.target.value)}
//                 >
//                   <option value="">All Status</option>
//                   <option value="REPORTED">Reported</option>
//                   <option value="IN_PROGRESS">In Progress</option>
//                   <option value="RESOLVED">Resolved</option>
//                 </select>
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
//                     <path
//                       d="M7 10l5 5 5-5"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//               </div>
//               <div className="relative w-full md:w-40">
//                 <select
//                   className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] transition"
//                   value={time}
//                   onChange={(e) => setTime(e.target.value)}
//                 >
//                   <option value="">All Time</option>
//                   <option value="month">This Month</option>
//                   <option value="year">This Year</option>
//                 </select>
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
//                     <path
//                       d="M7 10l5 5 5-5"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//               </div>
//             </div>
//             <button
//               onClick={handleExport}
//               className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0872B3] text-white font-semibold shadow transition-colors text-base focus:outline-none focus:ring-2 focus:ring-[#0872B3]"
//             >
//               <span className="inline-flex items-center justify-center bg-white/20 rounded-full p-1">
//                 <Download className="w-5 h-5" />
//               </span>
//               Export
//             </button>
//           </div>
//         </div>
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto">
//           <table className="min-w-full text-[15px]">
//             <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
//               <tr className="text-gray-700">
//                 <th className="px-6 py-4 text-left font-semibold">Vehicle</th>
//                 <th className="px-6 py-4 text-left font-semibold">Trip Purpose</th>
//                 <th className="px-6 py-4 text-left font-semibold">Description</th>
//                 <th className="px-6 py-4 text-left font-semibold">Status</th>
//                 <th className="px-6 py-4 text-left font-semibold">Date Reported</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(!issues || issues.length === 0) ? (
//                 <tr>
//                   <td colSpan={5} className="text-center py-12 text-gray-400 text-lg">No issues found.</td>
//                 </tr>
//               ) : (
//                 issues.map((issue: StaffIssue, idx: number) => (
//                   <tr
//                     key={idx}
//                     onClick={() => handleIssueClick(idx)}
//                     className={`
//                       ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                       hover:bg-blue-50/70
//                       cursor-pointer
//                       transition-colors
//                       duration-150
//                       rounded-lg
//                     `}
//                     style={{ height: "64px" }}
//                   >
//                     <td className="px-6 py-4">
//                       <div>
//                         <div className="font-medium text-gray-900">{issue.vehicle_model}</div>
//                         <div className="text-sm text-gray-500">{issue.plate_number}</div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">{issue.trip_purpose}</td>
//                     <td className="px-6 py-4 max-w-xs truncate">{issue.description}</td>
//                     <td className="px-6 py-4">
//                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                         issue.status === 'REPORTED' ? 'bg-yellow-100 text-yellow-800' :
//                         issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
//                         issue.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
//                         'bg-gray-100 text-gray-800'
//                       }`}>
//                         {issue.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">{issue.date_reported ? new Date(issue.date_reported).toLocaleString() : ''}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </main>
//   );
// }
