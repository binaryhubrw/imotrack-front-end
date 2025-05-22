'use client';
import React, { useState } from 'react';
import { Trash2, Pencil, Eye, X, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ISSUES = [
  { id: 'REQ-001', date: '2024-02-22', purpose: 'Field Trip', destination: 'Huye Campus', passengers: 15, issueType: 'Accident', location: 'Musanze' },
  { id: 'REQ-002', date: '2024-02-21', purpose: 'Conference', destination: 'Kigali Convention Center', passengers: 4, issueType: 'Delay', location: 'Kirehe' },
  { id: 'REQ-003', date: '2024-02-20', purpose: 'Research Visit', destination: 'Kigali Heights', passengers: 3, issueType: 'Fuel', location: 'Nyagatare' },
  { id: 'REQ-004', date: '2024-02-19', purpose: 'Staff Meeting', destination: 'Kigali Business Center', passengers: 8, issueType: 'Accident', location: 'Gasabo' },
  { id: 'REQ-005', date: '2024-02-18', purpose: 'Student Tour', destination: 'Kigali Genocide Memorial', passengers: 25, issueType: 'Delay', location: 'Kicukiro' },
  { id: 'REQ-006', date: '2024-02-17', purpose: 'Official Visit', destination: 'Ministry of Education', passengers: 5, issueType: 'Fuel', location: 'Nyarugenge' },
];

function issueBadge(type: string) {
  const base = 'px-3 py-1 rounded-full text-xs font-semibold';
  switch (type) {
    case 'Accident':
      return <span className={base + ' bg-yellow-300 text-gray-900'}>Accident</span>;
    case 'Delay':
      return <span className={base + ' bg-green-400 text-white'}>Delay</span>;
    case 'Fuel':
      return <span className={base + ' bg-red-400 text-white'}>Fuel</span>;
    default:
      return <span className={base + ' bg-gray-200 text-gray-700'}>{type}</span>;
  }
}

export default function IssueReportTablePage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [time, setTime] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [issues, setIssues] = useState(ISSUES);

  const handleDelete = (id: string) => {
    setIssues(issues.filter(issue => issue.id !== id));
    setShowDeleteConfirm(false);
  };

  const handleEdit = (issue: any) => {
    setSelectedIssue(issue);
    setShowEditModal(true);
  };

  const handleView = (issue: any) => {
    setSelectedIssue(issue);
    setShowViewModal(true);
  };

  const handleExport = () => {
    const headers = ['Request ID', 'Date', 'Purpose', 'Destination', 'Passengers', 'Issue Type', 'Location'];
    const csvData = issues
      .filter(i => !status || i.issueType === status)
      .map(issue => [
        issue.id,
        issue.date,
        issue.purpose,
        issue.destination,
        issue.passengers,
        issue.issueType,
        issue.location
      ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `issue_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-[#e6f2fa] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0872B3]">Issue History</h1>
          <div className="flex gap-2 items-center w-full md:w-auto">
            <select
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Accident">Accident</option>
              <option value="Delay">Delay</option>
              <option value="Fuel">Fuel</option>
            </select>
            <select
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
              value={time}
              onChange={e => setTime(e.target.value)}
            >
              <option value="">All Time</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button 
              onClick={handleExport}
              className="ml-2 px-4 py-2 bg-[#0872B3] text-white rounded shadow hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                <th className="px-4 py-2 text-left font-semibold">Request ID</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Purpose</th>
                <th className="px-4 py-2 text-left font-semibold">Destination</th>
                <th className="px-4 py-2 text-left font-semibold">Passengers</th>
                <th className="px-4 py-2 text-left font-semibold">Issue Type</th>
                <th className="px-4 py-2 text-left font-semibold">Location When Issue Occurred</th>
                <th className="px-4 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.filter(i => !status || i.issueType === status).map((issue, idx) => (
                <tr key={issue.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 font-mono">{issue.id}</td>
                  <td className="px-4 py-2">{issue.date}</td>
                  <td className="px-4 py-2">{issue.purpose}</td>
                  <td className="px-4 py-2">{issue.destination}</td>
                  <td className="px-4 py-2 text-center">{issue.passengers}</td>
                  <td className="px-4 py-2">{issueBadge(issue.issueType)}</td>
                  <td className="px-4 py-2">{issue.location}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedIssue(issue);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-1 rounded hover:bg-gray-100" 
                      aria-label="Delete" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => handleEdit(issue)}
                      className="p-1 rounded hover:bg-gray-100" 
                      aria-label="Edit" 
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => handleView(issue)}
                      className="p-1 rounded hover:bg-gray-100" 
                      aria-label="View" 
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#0872B3]">Issue Details</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Request ID</p>
                  <p className="font-semibold">{selectedIssue.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{selectedIssue.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="font-semibold">{selectedIssue.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="font-semibold">{selectedIssue.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Passengers</p>
                  <p className="font-semibold">{selectedIssue.passengers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Type</p>
                  <div className="mt-1">{issueBadge(selectedIssue.issueType)}</div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Location When Issue Occurred</p>
                  <p className="font-semibold">{selectedIssue.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#0872B3]">Edit Issue</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Issue Type</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0872B3] focus:ring-[#0872B3]"
                    defaultValue={selectedIssue.issueType}
                  >
                    <option value="Accident">Accident</option>
                    <option value="Delay">Delay</option>
                    <option value="Fuel">Fuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0872B3] focus:ring-[#0872B3]"
                    defaultValue={selectedIssue.location}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0872B3] rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#0872B3]">Confirm Delete</h2>
              <button onClick={() => setShowDeleteConfirm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="mb-6">Are you sure you want to delete issue {selectedIssue.id}? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedIssue.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}