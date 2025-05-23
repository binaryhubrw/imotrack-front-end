'use client';
import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';

// Define types for TypeScript
interface Issue {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  reportedBy: string;
  date: string;
  vehicleId: string;
}

// Sample data for issues
const issues: Issue[] = [
  {
    id: 1,
    title: 'Vehicle Maintenance Required',
    description: 'Regular maintenance check due for Vehicle #123',
    status: 'pending',
    priority: 'high',
    reportedBy: 'John Doe',
    date: '2024-03-15',
    vehicleId: 'VH123',
  },
  {
    id: 2,
    title: 'Fuel System Issue',
    description: 'Abnormal fuel consumption reported',
    status: 'in-progress',
    priority: 'medium',
    reportedBy: 'Jane Smith',
    date: '2024-03-14',
    vehicleId: 'VH456',
  },
  {
    id: 3,
    title: 'Tire Replacement Needed',
    description: 'Front tires showing significant wear',
    status: 'resolved',
    priority: 'low',
    reportedBy: 'Mike Johnson',
    date: '2024-03-13',
    vehicleId: 'VH789',
  },
];

export default function IssueManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <main className="min-h-screen bg-[#e6f2fa] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0872B3]">Issue Management</h1>
          <p className="text-gray-600 mt-2">Track and manage vehicle-related issues reported by staff</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0872B3]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button className="bg-[#0872B3] text-white px-4 py-2 rounded-lg hover:bg-[#065d94] transition-colors">
              <Filter className="inline-block mr-2" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issues List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Issues List</h2>
              </div>
              <div className="divide-y">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{issue.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(issue.status)}`}>
                            {issue.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{issue.date}</p>
                        <p className="text-sm text-gray-600 mt-1">Vehicle: {issue.vehicleId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Issue Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Issue Details</h2>
              {selectedIssue ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedIssue.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedIssue.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`mt-1 px-2 py-1 rounded-full text-xs inline-block ${getStatusColor(selectedIssue.status)}`}>
                        {selectedIssue.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <p className={`mt-1 px-2 py-1 rounded-full text-xs inline-block ${getPriorityColor(selectedIssue.priority)}`}>
                        {selectedIssue.priority}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reported By</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedIssue.reportedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle ID</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedIssue.vehicleId}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <button className="w-full bg-[#0872B3] text-white px-4 py-2 rounded-lg hover:bg-[#065d94] transition-colors">
                      Update Status
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select an issue to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}