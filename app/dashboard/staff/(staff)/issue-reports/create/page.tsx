
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, MapPin, Calendar } from 'lucide-react';

// Mock data for requests
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

export default function CreateIssueReportPage() {
  const router = useRouter();
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [request, setRequest] = useState<any>(null);
  const [formData, setFormData] = useState({
    issueType: 'Accident',
    location: '',
    details: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get only active requests for the dropdown
  const activeRequests = requests.filter((req) => req.status === 'Active');

  useEffect(() => {
    if (selectedRequestId) {
      const foundRequest = activeRequests.find(req => req.id === selectedRequestId);
      setRequest(foundRequest || null);
    } else {
      setRequest(null);
    }
  }, [selectedRequestId]);

  const goBack = () => {
    router.back();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      router.push('/dashboard/issue-reports');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={goBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-800">Create Issue Report</h1>
            </div>
            <p className="text-gray-500">
              Select an <span className="font-semibold text-blue-600">Active</span> vehicle request to report an issue.
            </p>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <label htmlFor="request" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Request*
              </label>
              <select
                id="request"
                name="request"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                required
              >
                <option value="">Select a request...</option>
                {activeRequests.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.id} - {req.purpose} ({req.destination})
                  </option>
                ))}
              </select>
            </div>

            {request && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <div className="flex gap-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Trip Duration</p>
                        <p className="font-medium">
                          {request.startDate} {request.startDate !== request.endDate ? `- ${request.endDate}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Destination</p>
                        <p className="font-medium">{request.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Type*
                      </label>
                      <select
                        id="issueType"
                        name="issueType"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.issueType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Accident">Accident</option>
                        <option value="Delay">Delay</option>
                        <option value="Fuel">Fuel</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Issue*
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location When Issue Occurred*
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        placeholder="e.g., Near Kigali International Airport, Remera"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Details*
                      </label>
                      <textarea
                        id="details"
                        name="details"
                        rows={4}
                        placeholder="Describe what happened in detail..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.details}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={goBack}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Issue Report'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
            {!request && selectedRequestId && (
              <div className="text-red-600 mt-4">
                This request is not available or not active.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
