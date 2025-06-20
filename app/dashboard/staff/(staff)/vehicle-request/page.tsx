// "use client";
// import { Star, Search, X } from "lucide-react";
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";

// const requests = [
//   {
//     id: "REQ-001",
//     date: "2024-02-22",
//     purpose: "Field Trip",
//     destination: "Huye Campus",
//     passengers: 15,
//     status: "Pending",
//     startDate: "2024-02-23",
//     endDate: "2024-02-23",
//   },
//   {
//     id: "REQ-002",
//     date: "2024-02-21",
//     purpose: "Conference",
//     destination: "Kigali Convention Center",
//     passengers: 4,
//     status: "Approved",
//     startDate: "2024-02-22",
//     endDate: "2024-02-22",
//   },
//   {
//     id: "REQ-003",
//     date: "2024-02-20",
//     purpose: "Research Visit",
//     destination: "Kigali Heights",
//     passengers: 3,
//     status: "Rejected",
//     startDate: "2024-02-21",
//     endDate: "2024-02-21",
//   },
//   {
//     id: "REQ-004",
//     date: "2024-02-18",
//     purpose: "Workshop",
//     destination: "Rubavu Beach",
//     passengers: 8,
//     status: "Active",
//     startDate: "2024-02-19",
//     endDate: "2024-02-20",
//   },
//   {
//     id: "REQ-005",
//     date: "2024-02-15",
//     purpose: "Team Building",
//     destination: "Nyungwe Forest",
//     passengers: 10,
//     status: "Pending",
//     startDate: "2024-02-16",
//     endDate: "2024-02-17",
//   },
//   {
//     id: "REQ-006",
//     date: "2024-02-10",
//     purpose: "Site Visit",
//     destination: "Musanze",
//     passengers: 6,
//     status: "Completed",
//     startDate: "2024-02-11",
//     endDate: "2024-02-12",
//   },
//   {
//     id: "REQ-007",
//     date: "2024-02-08",
//     purpose: "Seminar",
//     destination: "Karongi",
//     passengers: 5,
//     status: "Active",
//     startDate: "2024-02-09",
//     endDate: "2024-02-10",
//   },
//   {
//     id: "REQ-008",
//     date: "2024-02-07",
//     purpose: "Inspection",
//     destination: "Bugesera",
//     passengers: 7,
//     status: "Pending",
//     startDate: "2024-02-08",
//     endDate: "2024-02-08",
//   },
//   {
//     id: "REQ-009",
//     date: "2024-02-06",
//     purpose: "Training",
//     destination: "Rwamagana",
//     passengers: 12,
//     status: "Completed",
//     startDate: "2024-02-07",
//     endDate: "2024-02-07",
//   },
//   {
//     id: "REQ-010",
//     date: "2024-02-05",
//     purpose: "Field Trip",
//     destination: "Gicumbi",
//     passengers: 9,
//     status: "Rejected",
//     startDate: "2024-02-06",
//     endDate: "2024-02-06",
//   },
// ];

// function statusBadge(status: string) {
//   const base =
//     "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1";
//   switch (status) {
//     case "Pending":
//       return (
//         <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>
//       );
//     case "Approved":
//       return (
//         <span className={`${base} bg-green-100 text-green-800`}>
//           Approved
//           <span title="Ready for Issue Submission">
//             <Star className="w-4 h-4 text-blue-500 ml-1" fill="#3b82f6" />
//           </span>
//         </span>
//       );
//     case "Active":
//       return (
//         <span className={`${base} bg-purple-100 text-purple-800`}>Active</span>
//       );
//     case "Completed":
//       return (
//         <span className={`${base} bg-blue-100 text-blue-800`}>Completed</span>
//       );
//     case "Rejected":
//       return (
//         <span className={`${base} bg-red-100 text-red-800`}>Rejected</span>
//       );
//     default:
//       return <span className={base}>{status}</span>;
//   }
// }

// export default function VehicleRequestsPage() {
//   const router = useRouter();
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("");
//   const [time, setTime] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const filtered = requests.filter((req) => {
//     const matchesSearch =
//       req.id.toLowerCase().includes(search.toLowerCase()) ||
//       req.purpose.toLowerCase().includes(search.toLowerCase()) ||
//       req.destination.toLowerCase().includes(search.toLowerCase());
//     const matchesStatus = status === "" || req.status === status;
//     // For demo, time filter is not implemented
//     return matchesSearch && matchesStatus;
//   });

//   const handleRowClick = (id: string) => {
//     router.push(`/dashboard/vehicle-request/${id}`);
//   };

//   function handleFormSubmit(e) {
//     e.preventDefault();
//     setShowModal(false);
//     setSuccess(true);
//     setTimeout(() => setSuccess(false), 2000);
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-6xl mx-auto">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
//             <h1 className="text-2xl md:text-3xl font-bold text-[#0872B3]">
//               Vehicle Requests
//             </h1>
//             <div className="flex gap-2 items-center w-full md:w-auto">
//               <div className="relative w-full max-w-xs">
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white w-full pl-9"
//                 />
//                 <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
//               </div>
//               <select
//                 className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//               >
//                 <option value="">All Status</option>
//                 <option value="Pending">Pending</option>
//                 <option value="Approved">Approved</option>
//                 <option value="Active">Active</option>
//                 <option value="Rejected">Rejected</option>
//                 <option value="Completed">Completed</option>
//               </select>
//               <select
//                 className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
//                 value={time}
//                 onChange={(e) => setTime(e.target.value)}
//               >
//                 <option value="">All Time</option>
//                 <option value="month">This Month</option>
//                 <option value="year">This Year</option>
//               </select>
//               <button
//                 onClick={() => setShowModal(true)}
//                 className="ml-2 flex items-center gap-2 cursor-pointer px-6 py-2 text-blue-700 border border-blue-700 rounded-lg shadow-none hover:bg-blue-50 transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[160px] justify-center"
//               >
//                 <span className="inline-flex items-center">
//                   <span className="mr-1">+</span> New Request
//                 </span>
//               </button>
//             </div>
//           </div>
//           {/* Success message */}
//           {success && (
//             <div className="mb-4 text-green-700 bg-green-100 border border-green-200 rounded-lg px-4 py-2 text-center font-semibold transition-all">
//               Request submitted successfully!
//             </div>
//           )}
//           <div className="bg-white rounded-1xl shadow-xl border border-gray-100 overflow-x-auto">
//             <table className="min-w-full text-[14px]">
//               <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
//                 <tr className="text-gray-700">
//                   <th className="px-6 py-4 text-left font-semibold">
//                     Request ID
//                   </th>
//                   <th className="px-6 py-4 text-left font-semibold">Date</th>
//                   <th className="px-6 py-4 text-left font-semibold">Purpose</th>
//                   <th className="px-6 py-4 text-left font-semibold">
//                     Destination
//                   </th>
//                   <th className="px-6 py-4 text-left font-semibold">
//                     Passengers
//                   </th>
//                   <th className="px-6 py-4 text-left font-semibold">Status</th>
//                   <th className="px-6 py-4 text-left font-semibold">
//                     Start Date
//                   </th>
//                   <th className="px-6 py-4 text-left font-semibold">
//                     End Date
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={8}
//                       className="text-center py-12 text-gray-400 text-lg"
//                     >
//                       No requests found.
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((req, idx) => (
//                     <tr
//                       key={req.id}
//                       className={`
//               ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//               hover:bg-blue-50/70
//               cursor-pointer
//               transition-colors
//               duration-150
//               rounded-lg
//             `}
//                       style={{ height: "64px" }}
//                       onClick={() => handleRowClick(req.id)}
//                     >
//                       <td className="px-6 py-4 font-mono">{req.id}</td>
//                       <td className="px-6 py-4">{req.date}</td>
//                       <td className="px-6 py-4">{req.purpose}</td>
//                       <td className="px-6 py-4">{req.destination}</td>
//                       <td className="px-6 py-4 text-center">
//                         {req.passengers}
//                       </td>
//                       <td className="px-6 py-4">{statusBadge(req.status)}</td>
//                       <td className="px-6 py-4">{req.startDate}</td>
//                       <td className="px-6 py-4">{req.endDate}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//       {/* Modal for New Request */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-8 overflow-y-auto max-h-[90vh] relative">
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
//             >
//               <X className="w-5 h-5 text-gray-500" />
//             </button>
//             <h2
//               className="text-2xl font-bold text-center mb-8"
//               style={{ color: "#0872B3" }}
//             >
//               Vehicle Request
//             </h2>
//             <form onSubmit={handleFormSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="space-y-6">
//                   <div>
//                     <label
//                       className="block text-sm font-semibold mb-1"
//                       style={{ color: "#0872B3" }}
//                     >
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
//                       placeholder="Full Name"
//                     />
//                   </div>
//                   <div>
//                     <label
//                       className="block text-sm font-semibold mb-1"
//                       style={{ color: "#0872B3" }}
//                     >
//                       Reason
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
//                       placeholder="Reason"
//                     />
//                   </div>
//                   <div>
//                     <label
//                       className="block text-sm font-semibold mb-1"
//                       style={{ color: "#0872B3" }}
//                     >
//                       Destination
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
//                       placeholder="Destination"
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-6">
//                   <div>
//                     <label
//                       className="block text-sm font-semibold mb-1"
//                       style={{ color: "#0872B3" }}
//                     >
//                       Passengers
//                     </label>
//                     <input
//                       type="number"
//                       min={1}
//                       required
//                       className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
//                       placeholder="Passengers"
//                     />
//                   </div>
//                   <div>
//                     <label
//                       className="block text-sm font-semibold mb-1"
//                       style={{ color: "#0872B3" }}
//                     >
//                       Trip Dates
//                     </label>
//                     <div className="flex gap-4">
//                       <input
//                         type="date"
//                         required
//                         className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
//                         placeholder="Start Date"
//                       />
//                       <input
//                         type="date"
//                         required
//                         className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
//                         placeholder="End Date"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <button
//                 type="submit"
//                 className="w-full mt-4 py-2 rounded font-bold text-white text-base"
//                 style={{ background: "#0872B3" }}
//               >
//                 Submit
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }
