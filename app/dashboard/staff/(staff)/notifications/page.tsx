import React from 'react'

export default function Not() {
  return (
    <div>
      not
    </div>
  )
}

// 'use client';
// import React, { useState } from 'react';
// import { Bell, CheckCircle, AlertTriangle, Info, Eye } from 'lucide-react';

// const NOTIFICATIONS = [
//   {
//     id: 1,
//     type: 'success',
//     title: 'New Trip Request Approved',
//     message: 'Your trip request for Huye Campus has been approved. Vehicle UR-001 has been assigned.',
//     time: '2 hours ago',
//     read: false,
//     details: {
//       requestId: 'REQ-001',
//       vehicle: 'UR-001',
//       more: 'Approved by admin John Doe. Departure: 2024-02-23.'
//     }
//   },
//   {
//     id: 2,
//     type: 'info',
//     title: 'Vehicle Assignment',
//     message: 'Vehicle UR-002 has been assigned to your upcoming trip to Kigali Convention Center.',
//     time: '1 day ago',
//     read: false,
//     details: {
//       requestId: 'REQ-002',
//       vehicle: 'UR-002',
//       more: 'Assignment for Conference. Departure: 2024-02-22.'
//     }
//   },
//   {
//     id: 3,
//     type: 'error',
//     title: 'Request Rejected',
//     message: 'Your trip request for Kigali Heights has been rejected due to vehicle unavailability.',
//     time: '3 days ago',
//     read: false,
//     details: {
//       requestId: 'REQ-003',
//       vehicle: 'N/A',
//       more: 'Rejected by admin Jane Smith. Reason: No available vehicles.'
//     }
//   },
// ];

// function getIcon(type: string) {
//   switch (type) {
//     case 'success':
//       return <CheckCircle className="w-6 h-6 text-green-600" />;
//     case 'error':
//       return <AlertTriangle className="w-6 h-6 text-red-500" />;
//     case 'info':
//     default:
//       return <Info className="w-6 h-6 text-blue-500" />;
//   }
// }

// function getBg(type: string) {
//   switch (type) {
//     case 'success':
//       return 'bg-green-100 border-green-200';
//     case 'error':
//       return 'bg-red-100 border-red-200';
//     case 'info':
//     default:
//       return 'bg-blue-50 border-blue-100';
//   }
// }

// export default function NotificationsPage() {
//   const [notifications, setNotifications] = useState(NOTIFICATIONS);
//   const [typeFilter, setTypeFilter] = useState('');
//   const [timeFilter, setTimeFilter] = useState('');
//   const [openId, setOpenId] = useState<number | null>(null);

//   function markAllAsRead() {
//     setNotifications(notifications.map(n => ({ ...n, read: true })));
//   }

//   const filtered = notifications.filter(n =>
//     (typeFilter === '' || n.type === typeFilter)
//   );

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-[#e6f2fa] via-gray-50 to-[#e6f2fa] px-4 py-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
//           <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 text-gray-800">
//             <Bell className="w-7 h-7 text-[#0872B3]" /> Notifications
//           </h1>
//           <div className="flex gap-2 items-center w-full md:w-auto">
//             <select
//               className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
//               value={typeFilter}
//               onChange={e => setTypeFilter(e.target.value)}
//             >
//               <option value="">All Notifications</option>
//               <option value="success">Success</option>
//               <option value="info">Info</option>
//               <option value="error">Error</option>
//             </select>
//             <select
//               className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
//               value={timeFilter}
//               onChange={e => setTimeFilter(e.target.value)}
//             >
//               <option value="">All Time</option>
//               <option value="today">Today</option>
//               <option value="week">This Week</option>
//             </select>
//             <button
//               onClick={markAllAsRead}
//               className="ml-2 flex items-center gap-2 px-6 py-2 text-[#0872B3] border border-[#0872B3] rounded-lg shadow-none hover:bg-[#0872B3] hover:text-white transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0872B3] min-w-[160px] justify-center"
//             >
//               Mark All as Read
//             </button>
//           </div>
//         </div>
//         <div className="space-y-4">
//           {filtered.length === 0 ? (
//             <div className="text-center text-gray-400 py-16">No notifications.</div>
//           ) : (
//             filtered.map(n => (
//               <div
//                 key={n.id}
//                 className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border ${getBg(n.type)} transition-all hover:shadow-md`}
//               >
//                 <div className="flex items-center gap-4 flex-1">
//                   {getIcon(n.type)}
//                   <div>
//                     <div className="font-bold text-base md:text-lg text-gray-800 mb-1">{n.title}</div>
//                     <div className="text-gray-700 text-sm">{n.message}</div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 min-w-[120px] justify-end">
//                   <span className="text-xs text-gray-500">{n.time}</span>
//                   <button
//                     className={`p-1 rounded hover:bg-gray-200 ${openId === n.id ? 'bg-gray-200' : ''}`}
//                     aria-label="View notification details"
//                     onClick={() => setOpenId(openId === n.id ? null : n.id)}
//                   >
//                     <Eye className="w-5 h-5 text-gray-400" />
//                   </button>
//                 </div>
//                 {/* Details section */}
//                 {openId === n.id && (
//                   <div className="w-full mt-4 md:mt-2 bg-white border border-gray-200 rounded-lg p-4 shadow animate-fade-in">
//                     <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Request ID:</span> {n.details.requestId}</div>
//                     <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Vehicle:</span> {n.details.vehicle}</div>
//                     <div className="text-sm text-gray-700"><span className="font-semibold">Details:</span> {n.details.more}</div>
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//       <style jsx global>{`
//         @keyframes fade-in {
//           from { opacity: 0; transform: translateY(16px); }
//           to { opacity: 1; transform: none; }
//         }
//         .animate-fade-in { animation: fade-in 0.5s cubic-bezier(.4,0,.2,1) both; }
//       `}</style>
//     </main>
//   );
// }