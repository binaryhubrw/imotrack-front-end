import React from 'react'

export default function IR() {
  return (
    <div>
      rd
    </div>
  )
}

// 'use client';
// import React from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { 
//   ArrowLeft, 
//   AlertTriangle, 
//   Calendar, 
//   MapPin, 
//   Users, 
//   Clock, 
//   Target,
//   FileText,
//   Download,
//   Edit,
//   Phone,
//   CheckCircle,
//   XCircle,
//   AlertCircle
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { Alert, AlertDescription } from '@/components/ui/alert';

// interface Issue {
//   id: string;
//   date: string;
//   purpose: string;
//   destination: string;
//   passengers: number;
//   issueType: "Accident" | "Delay" | "Fuel";
//   location: string;
//   reportedTime: string;
//   resolvedTime: string | null;
//   status: "Resolved" | "In Progress" | "Pending";
//   severity: "High" | "Medium" | "Low";
//   description: string;
//   reportedBy: string;
//   assignedTo: string;
//   vehicleId: string;
//   incidentLocation: string;
//   witnessCount: number;
//   policeReport: string | null;
//   insuranceClaim: string | null;
//   estimatedCost: string;
//   resolution: string;
//   followUpRequired: boolean;
//   nextReviewDate: string | null;
// }

// // Mock data - in real app, this would come from your API/database
// const ISSUES: Issue[] = [
//   {
//     id: "REQ-001",
//     date: "2024-02-22",
//     purpose: "Field Trip",
//     destination: "Huye Campus",
//     passengers: 15,
//     issueType: "Accident",
//     location: "Musanze",
//     reportedTime: "14:30",
//     resolvedTime: "16:45",
//     status: "Resolved",
//     severity: "High",
//     description: "Minor collision with roadside barrier during adverse weather conditions. No injuries reported, but front bumper sustained damage.",
//     reportedBy: "John Doe (Driver)",
//     assignedTo: "Sarah Wilson (Fleet Manager)",
//     vehicleId: "UR-001",
//     incidentLocation: "Musanze-Kigali Highway, KM 45",
//     witnessCount: 3,
//     policeReport: "PR-2024-0222-001",
//     insuranceClaim: "IC-2024-0045",
//     estimatedCost: "$1,200",
//     resolution: "Vehicle repaired at authorized service center. Driver received additional safety training.",
//     followUpRequired: true,
//     nextReviewDate: "2024-03-15"
//   },
//   {
//     id: "REQ-002",
//     date: "2024-02-21",
//     purpose: "Conference",
//     destination: "Kigali Convention Center",
//     passengers: 4,
//     issueType: "Delay",
//     location: "Kirehe",
//     reportedTime: "08:15",
//     resolvedTime: "09:30",
//     status: "Resolved",
//     severity: "Medium",
//     description: "Traffic congestion due to road construction caused significant delay. Passengers missed morning session of conference.",
//     reportedBy: "Prof. Michael Chen",
//     assignedTo: "Transport Coordinator",
//     vehicleId: "UR-002",
//     incidentLocation: "Kirehe-Kayonza Road",
//     witnessCount: 4,
//     policeReport: null,
//     insuranceClaim: null,
//     estimatedCost: "$0",
//     resolution: "Alternative route identified for future trips. Conference organizers notified of delay.",
//     followUpRequired: false,
//     nextReviewDate: null
//   },
//   {
//     id: "REQ-003",
//     date: "2024-02-20",
//     purpose: "Research Visit",
//     destination: "Kigali Heights",
//     passengers: 3,
//     issueType: "Fuel",
//     location: "Nyagatare",
//     reportedTime: "11:45",
//     resolvedTime: "13:20",
//     status: "Resolved",
//     severity: "Low",
//     description: "Vehicle ran out of fuel due to faulty fuel gauge reading. Passengers stranded for 1.5 hours.",
//     reportedBy: "Jane Smith (Driver)",
//     assignedTo: "Maintenance Team",
//     vehicleId: "UR-003",
//     incidentLocation: "Nyagatare Town Center",
//     witnessCount: 3,
//     policeReport: null,
//     insuranceClaim: null,
//     estimatedCost: "$150",
//     resolution: "Fuel gauge replaced and calibrated. Emergency fuel supplies restocked.",
//     followUpRequired: true,
//     nextReviewDate: "2024-03-01"
//   }
// ];

// export default function IssueDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const issueId = params.id as string;
  
//   const issue = ISSUES.find(i => i.id === issueId);
  
//   if (!issue) {
//     return (
//       <main className="min-h-screen bg-[#e6f2fa] px-4 py-10">
//         <div className="max-w-4xl mx-auto">
//           <Card className="text-center py-12">
//             <CardContent>
//               <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Not Found</h2>
//               <p className="text-gray-600 mb-6">The issue with ID "{issueId}" could not be found.</p>
//               <Button onClick={() => router.push('/dashboard/issue-reports')} className="bg-[#0872B3] hover:bg-blue-700">
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 Back to Issue History
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     );
//   }

//   const getIssueIcon = (type: Issue['issueType']) => {
//     switch (type) {
//       case 'Accident':
//         return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
//       case 'Delay':
//         return <Clock className="w-5 h-5 text-green-600" />;
//       case 'Fuel':
//         return <AlertCircle className="w-5 h-5 text-red-600" />;
//       default:
//         return <AlertTriangle className="w-5 h-5 text-gray-500" />;
//     }
//   };

//   const getIssueBadge = (type: Issue['issueType']) => {
//     switch (type) {
//       case 'Accident':
//         return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Accident</Badge>;
//       case 'Delay':
//         return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Delay</Badge>;
//       case 'Fuel':
//         return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Fuel</Badge>;
//       default:
//         return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{type}</Badge>;
//     }
//   };

//   const getSeverityBadge = (severity: Issue['severity']) => {
//     switch (severity) {
//       case 'High':
//         return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
//       case 'Medium':
//         return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
//       case 'Low':
//         return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
//       default:
//         return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{severity}</Badge>;
//     }
//   };

//   const getStatusBadge = (status: Issue['status']) => {
//     switch (status) {
//       case 'Resolved':
//         return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
//       case 'In Progress':
//         return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
//       case 'Pending':
//         return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
//       default:
//         return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
//     }
//   };

//   const generateReport = () => {
//     const reportData = `
// INCIDENT REPORT
// ===============
// Issue ID: ${issue.id}
// Date: ${issue.date}
// Time Reported: ${issue.reportedTime}
// Issue Type: ${issue.issueType}
// Severity: ${issue.severity}
// Status: ${issue.status}
// Location: ${issue.incidentLocation}

// TRIP DETAILS
// ============
// Purpose: ${issue.purpose}
// Destination: ${issue.destination}
// Passengers: ${issue.passengers}
// Vehicle ID: ${issue.vehicleId}

// INCIDENT DESCRIPTION
// ===================
// ${issue.description}

// PERSONNEL
// =========
// Reported By: ${issue.reportedBy}
// Assigned To: ${issue.assignedTo}
// Witnesses: ${issue.witnessCount}

// RESOLUTION
// ==========
// Resolved Time: ${issue.resolvedTime || 'N/A'}
// Resolution: ${issue.resolution}
// Estimated Cost: ${issue.estimatedCost}

// DOCUMENTATION
// =============
// Police Report: ${issue.policeReport || 'N/A'}
// Insurance Claim: ${issue.insuranceClaim || 'N/A'}

// FOLLOW-UP
// =========
// Follow-up Required: ${issue.followUpRequired ? 'Yes' : 'No'}
// Next Review Date: ${issue.nextReviewDate || 'N/A'}

// Generated on: ${new Date().toLocaleString()}
//     `.trim();
    
//     const blob = new Blob([reportData], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `incident-report-${issue.id}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleEdit = () => {
//     // TODO: Implement edit functionality
//     console.log('Edit issue:', issue.id);
//   };

//   const handleContact = () => {
//     // TODO: Implement contact functionality
//     console.log('Contact personnel for issue:', issue.id);
//   };

//   return (
//     <main className="min-h-screen bg-[#e6f2fa] px-4 py-10">
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center gap-4">
//             <Button 
//               variant="outline" 
//               onClick={() => router.push('/dashboard/issue-reports')}
//               className="flex items-center gap-2"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back
//             </Button>
//             <div className="flex items-center gap-3">
//               {getIssueIcon(issue.issueType)}
//               <div>
//                 <h1 className="text-3xl font-extrabold text-[#0872B3] tracking-tight">Issue Details</h1>
//                 <p className="text-gray-600 font-mono text-sm">{issue.id}</p>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             {getStatusBadge(issue.status)}
//           </div>
//         </div>

//         {/* Alert for High Severity */}
//         {issue.severity === 'High' && (
//           <Alert className="mb-6 border-red-200 bg-red-50">
//             <AlertTriangle className="h-4 w-4 text-red-600" />
//             <AlertDescription className="text-red-800">
//               This is a high-severity incident that requires immediate attention and follow-up.
//             </AlertDescription>
//           </Alert>
//         )}

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Main Details */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Issue Overview */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center justify-between">
//                   <span className="flex items-center gap-2">
//                     <Target className="w-5 h-5" />
//                     Issue Overview
//                   </span>
//                   <div className="flex items-center gap-2">
//                     {getIssueBadge(issue.issueType)}
//                     {getSeverityBadge(issue.severity)}
//                   </div>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex items-start gap-3">
//                     <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Date & Time</p>
//                       <p className="text-gray-600">{issue.date} at {issue.reportedTime}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Incident Location</p>
//                       <p className="text-gray-600">{issue.incidentLocation}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <Users className="w-5 h-5 text-gray-500 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Passengers Affected</p>
//                       <p className="text-gray-600">{issue.passengers} passengers</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <Target className="w-5 h-5 text-gray-500 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Trip Purpose</p>
//                       <p className="text-gray-600">{issue.purpose}</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Incident Description */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <FileText className="w-5 h-5" />
//                   Incident Description
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700 leading-relaxed">{issue.description}</p>
//               </CardContent>
//             </Card>

//             {/* Resolution */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <CheckCircle className="w-5 h-5" />
//                   Resolution & Actions Taken
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700 leading-relaxed mb-4">{issue.resolution}</p>
//                 {issue.resolvedTime && (
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Clock className="w-4 h-4" />
//                     Resolved at {issue.resolvedTime}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Column - Additional Info */}
//           <div className="space-y-6">
//             {/* Personnel */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Personnel Involved</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div>
//                   <p className="font-medium text-gray-900">Reported By</p>
//                   <p className="text-gray-600">{issue.reportedBy}</p>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">Assigned To</p>
//                   <p className="text-gray-600">{issue.assignedTo}</p>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">Witnesses</p>
//                   <p className="text-gray-600">{issue.witnessCount} people</p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Financial Impact */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Financial Impact</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Estimated Cost</span>
//                   <span className="font-medium text-lg">{issue.estimatedCost}</span>
//                 </div>
//                 {issue.insuranceClaim && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Insurance Claim</span>
//                     <span className="font-medium">{issue.insuranceClaim}</span>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Documentation */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Documentation</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div>
//                   <p className="font-medium text-gray-900">Vehicle ID</p>
//                   <p className="text-gray-600">{issue.vehicleId}</p>
//                 </div>
//                 {issue.policeReport && (
//                   <div>
//                     <p className="font-medium text-gray-900">Police Report</p>
//                     <p className="text-gray-600">{issue.policeReport}</p>
//                   </div>
//                 )}
//                 {issue.insuranceClaim && (
//                   <div>
//                     <p className="font-medium text-gray-900">Insurance Claim</p>
//                     <p className="text-gray-600">{issue.insuranceClaim}</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Follow-up */}
//             {issue.followUpRequired && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-orange-700">Follow-up Required</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="flex items-center gap-2 text-orange-600 mb-2">
//                     <AlertCircle className="w-4 h-4" />
//                     <span className="font-medium">Next Review</span>
//                   </div>
//                   <p className="text-gray-700">{issue.nextReviewDate}</p>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Actions */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Actions</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Button 
//                   onClick={generateReport} 
//                   className="w-full bg-[#0872B3] hover:bg-blue-700"
//                 >
//                   <Download className="w-4 h-4 mr-2" />
//                   Generate Report
//                 </Button>
//                 <Button 
//                   variant="outline" 
//                   className="w-full"
//                   onClick={handleEdit}
//                 >
//                   <Edit className="w-4 h-4 mr-2" />
//                   Update Issue
//                 </Button>
//                 <Button 
//                   variant="outline" 
//                   className="w-full"
//                   onClick={handleContact}
//                 >
//                   <Phone className="w-4 h-4 mr-2" />
//                   Contact Personnel
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }