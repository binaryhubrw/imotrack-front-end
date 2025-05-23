'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, Briefcase, Clock, Plus, Pencil } from 'lucide-react';
import Link from 'next/link';

// Mock data for requests (same as in the main page)
const requests = [
  { id: "REQ-001", date: "2024-02-22", purpose: "Field Trip", destination: "Huye Campus", passengers: 15, status: "Pending", startDate: "2024-02-23", endDate: "2024-02-23" },
  { id: "REQ-002", date: "2024-02-21", purpose: "Conference", destination: "Kigali Convention Center", passengers: 4, status: "Approved", startDate: "2024-02-22", endDate: "2024-02-22" },
  { id: "REQ-003", date: "2024-02-20", purpose: "Research Visit", destination: "Kigali Heights", passengers: 3, status: "Rejected", startDate: "2024-02-21", endDate: "2024-02-21" },
  { id: "REQ-004", date: "2024-02-18", purpose: "Workshop", destination: "Rubavu Beach", passengers: 8, status: "Active", startDate: "2024-02-19", endDate: "2024-02-20" },
  { id: "REQ-005", date: "2024-02-15", purpose: "Team Building", destination: "Nyungwe Forest", passengers: 10, status: "Pending", startDate: "2024-02-16", endDate: "2024-02-17" },
  { id: "REQ-006", date: "2024-02-10", purpose: "Site Visit", destination: "Musanze", passengers: 6, status: "Completed", startDate: "2024-02-11", endDate: "2024-02-12" },
  { id: "REQ-007", date: "2024-02-08", purpose: "Seminar", destination: "Karongi", passengers: 5, status: "Active", startDate: "2024-02-09", endDate: "2024-02-10" },
  { id: "REQ-008", date: "2024-02-07", purpose: "Inspection", destination: "Bugesera", passengers: 7, status: "Pending", startDate: "2024-02-08", endDate: "2024-02-08" },
  { id: "REQ-009", date: "2024-02-06", purpose: "Training", destination: "Rwamagana", passengers: 12, status: "Completed", startDate: "2024-02-07", endDate: "2024-02-07" },
  { id: "REQ-010", date: "2024-02-05", purpose: "Field Trip", destination: "Gicumbi", passengers: 9, status: "Rejected", startDate: "2024-02-06", endDate: "2024-02-06" },
];

function statusBadge(status: string) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1";
  switch (status) {
    case "Pending":
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
    case "Approved":
      return <span className={`${base} bg-green-100 text-green-800`}>Approved</span>;
    case "Active":
      return <span className={`${base} bg-purple-100 text-purple-800`}>Active</span>;
    case "Completed":
      return <span className={`${base} bg-blue-100 text-blue-800`}>Completed</span>;
    case "Rejected":
      return <span className={`${base} bg-red-100 text-red-800`}>Rejected</span>;
    default:
      return <span className={base}>{status}</span>;
  }
}

export default function VehicleRequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch with setTimeout
    const timer = setTimeout(() => {
      const foundRequest = requests.find(req => req.id === params.id);
      setRequest(foundRequest || null);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [params.id]);

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Request Not Found</h1>
          <p className="text-gray-600 mb-6">The vehicle request with ID {params.id} could not be found.</p>
          <button 
            onClick={goBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={goBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Requests</span>
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{request.purpose}</h1>
                <p className="text-gray-500 font-mono mt-1">ID: {request.id}</p>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(request.status)}
                
                {request.status === "Active" && (
                  <Link 
                    href={`/dashboard/issue-reports/create`}
                    className="px-4 py-2 bg-[#0872B3] text-white rounded-lg hover:bg-[#0872B3] transition-colors flex items-center gap-2"
                  >
                    <Pencil size={16} />
                    Edit Request
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Request Details</h2>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Request Date</p>
                        <p className="font-medium">{request.date}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Purpose</p>
                        <p className="font-medium">{request.purpose}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Number of Passengers</p>
                        <p className="font-medium">{request.passengers}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Trip Information</h2>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Destination</p>
                        <p className="font-medium">{request.destination}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Trip Duration</p>
                        <p className="font-medium">
                          {request.startDate} {request.startDate !== request.endDate ? `- ${request.endDate}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Activity Timeline</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-4">
                      <div className="relative pl-6 border-l-2 border-blue-200 pb-4">
                        <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                        <p className="text-xs text-gray-400">{request.date}</p>
                        <p className="font-medium text-gray-700">Request Created</p>
                      </div>
                      
                      {request.status !== "Pending" && (
                        <div className="relative pl-6 border-l-2 border-blue-200 pb-4">
                          <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                          <p className="text-xs text-gray-400">{new Date(new Date(request.date).getTime() + 86400000).toISOString().split('T')[0]}</p>
                          <p className="font-medium text-gray-700">Request {request.status === "Rejected" ? "Rejected" : "Approved"}</p>
                        </div>
                      )}
                      
                      {request.status === "Active" && (
                        <div className="relative pl-6 border-l-2 border-blue-200 pb-4">
                          <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                          <p className="text-xs text-gray-400">{request.startDate}</p>
                          <p className="font-medium text-gray-700">Trip Started</p>
                        </div>
                      )}
                      
                      {request.status === "Completed" && (
                        <>
                          <div className="relative pl-6 border-l-2 border-blue-200 pb-4">
                            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                            <p className="text-xs text-gray-400">{request.startDate}</p>
                            <p className="font-medium text-gray-700">Trip Started</p>
                          </div>
                          <div className="relative pl-6 pb-0">
                            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                            <p className="text-xs text-gray-400">{request.endDate}</p>
                            <p className="font-medium text-gray-700">Trip Completed</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
