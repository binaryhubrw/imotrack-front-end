// 'use client';
// import React from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { 
//   ArrowLeft, 
//   Car, 
//   Calendar, 
//   MapPin, 
//   User, 
//   Clock, 
//   Target,
//   CheckCircle,
//   XCircle,
//   Download,
//   Edit
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';

// interface Trip {
//   id: string;
//   date: string;
//   purpose: string;
//   destination: string;
//   status: 'Completed' | 'Cancelled';
//   driver: string;
//   vehicle: string;
//   startTime: string;
//   endTime: string;
//   distance: string;
//   fuelUsed: string;
//   passengers: number;
//   departureLocation: string;
//   notes: string;
//   approvedBy: string;
//   requestedBy: string;
// }

// // Mock data - in real app, this would come from your API/database
// const TRIPS: Trip[] = [
//   { 
//     id: 'TRIP-001', 
//     date: '2024-02-20', 
//     purpose: 'Field Trip', 
//     destination: 'Huye Campus', 
//     status: 'Completed', 
//     driver: 'John Doe', 
//     vehicle: 'UR-001',
//     startTime: '08:00',
//     endTime: '17:30',
//     distance: '125 km',
//     fuelUsed: '15.2 L',
//     passengers: 12,
//     departureLocation: 'University of Rwanda - Gikondo',
//     notes: 'Educational visit to agricultural research facilities. All participants attended scheduled presentations.',
//     approvedBy: 'Dr. Sarah Wilson',
//     requestedBy: 'Prof. Michael Chen'
//   },
//   { 
//     id: 'TRIP-002', 
//     date: '2024-02-18', 
//     purpose: 'Conference', 
//     destination: 'Kigali Convention Center', 
//     status: 'Completed', 
//     driver: 'Jane Smith', 
//     vehicle: 'UR-002',
//     startTime: '07:30',
//     endTime: '19:00',
//     distance: '45 km',
//     fuelUsed: '8.7 L',
//     passengers: 8,
//     departureLocation: 'University of Rwanda - Main Campus',
//     notes: 'International Education Conference. Successful presentation delivered by university delegation.',
//     approvedBy: 'Dr. Robert Kim',
//     requestedBy: 'Prof. Linda Johnson'
//   },
//   { 
//     id: 'TRIP-003', 
//     date: '2024-02-15', 
//     purpose: 'Research Visit', 
//     destination: 'Kigali Heights', 
//     status: 'Cancelled', 
//     driver: 'Mike Johnson', 
//     vehicle: 'UR-003',
//     startTime: '09:00',
//     endTime: '16:00',
//     distance: '0 km',
//     fuelUsed: '0 L',
//     passengers: 0,
//     departureLocation: 'University of Rwanda - Science Campus',
//     notes: 'Trip cancelled due to severe weather conditions. Rescheduled for next week.',
//     approvedBy: 'Dr. Amanda Foster',
//     requestedBy: 'Dr. James Patterson'
//   }
// ];

// export default function TripDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const tripId = params.id as string;
  
//   const trip = TRIPS.find(t => t.id === tripId);
  
//   if (!trip) {
//     return (
//       <main className="min-h-screen bg-gradient-to-br from-[#e6f2fa] to-[#f9fafb] px-4 py-10">
//         <div className="max-w-4xl mx-auto">
//           <Card className="text-center py-12">
//             <CardContent>
//               <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
//               <p className="text-gray-600 mb-6">The trip with ID "{tripId}" could not be found.</p>
//               <Button onClick={() => router.push('/dashboard/trip-history')} className="bg-[#0872B3] hover:bg-blue-700">
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 Back to Trip History
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     );
//   }

//   const getStatusIcon = (status: Trip['status']) => {
//     switch (status) {
//       case 'Completed':
//         return <CheckCircle className="w-5 h-5 text-green-600" />;
//       case 'Cancelled':
//         return <XCircle className="w-5 h-5 text-red-500" />;
//       default:
//         return <Clock className="w-5 h-5 text-yellow-500" />;
//     }
//   };

//   const getStatusBadge = (status: Trip['status']) => {
//     switch (status) {
//       case 'Completed':
//         return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
//       case 'Cancelled':
//         return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
//       default:
//         return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>;
//     }
//   };

//   const generateReport = () => {
//     const reportData = `
// TRIP REPORT
// ===========
// Trip ID: ${trip.id}
// Date: ${trip.date}
// Purpose: ${trip.purpose}
// Destination: ${trip.destination}
// Status: ${trip.status}
// Driver: ${trip.driver}
// Vehicle: ${trip.vehicle}
// Departure: ${trip.departureLocation}
// Time: ${trip.startTime} - ${trip.endTime}
// Distance: ${trip.distance}
// Fuel Used: ${trip.fuelUsed}
// Passengers: ${trip.passengers}
// Requested By: ${trip.requestedBy}
// Approved By: ${trip.approvedBy}

// Notes:
// ${trip.notes}

// Generated on: ${new Date().toLocaleString()}
//     `.trim();
    
//     const blob = new Blob([reportData], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `trip-report-${trip.id}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleEdit = () => {
//     // TODO: Implement edit functionality
//     console.log('Edit trip:', trip.id);
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-[#e6f2fa] to-[#f9fafb] px-4 py-10">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center gap-4">
//             <Button 
//               variant="outline" 
//               onClick={() => router.push('/dashboard/trip-history')}
//               className="flex items-center gap-2"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back
//             </Button>
//             <div className="flex items-center gap-3">
//               <Car className="w-8 h-8 text-[#0872B3]" />
//               <div>
//                 <h1 className="text-3xl font-extrabold text-[#0872B3] tracking-tight">Trip Details</h1>
//                 <p className="text-gray-600 font-mono text-sm">{trip.id}</p>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             {getStatusIcon(trip.status)}
//             {getStatusBadge(trip.status)}
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Main Details */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Trip Overview */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Target className="w-5 h-5" />
//                   Trip Overview
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex items-start gap-3">
//                     <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Date</p>
//                       <p className="text-gray-600">{trip.date}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Time</p>
//                       <p className="text-gray-600">{trip.startTime} - {trip.endTime}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Destination</p>
//                       <p className="text-gray-600">{trip.destination}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <Target className="w-5 h-5 text-gray-500 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Purpose</p>
//                       <p className="text-gray-600">{trip.purpose}</p>
//                     </div>
//                   </div>
//                 </div>
//                 <Separator />
//                 <div>
//                   <p className="font-medium text-gray-900 mb-2">Departure Location</p>
//                   <p className="text-gray-600">{trip.departureLocation}</p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Trip Notes */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Notes & Comments</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700 leading-relaxed">{trip.notes}</p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Column - Additional Info */}
//           <div className="space-y-6">
//             {/* Vehicle & Driver */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Car className="w-5 h-5" />
//                   Vehicle & Driver
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <p className="font-medium text-gray-900">Driver</p>
//                   <p className="text-gray-600 flex items-center gap-2">
//                     <User className="w-4 h-4" />
//                     {trip.driver}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">Vehicle</p>
//                   <p className="text-gray-600">{trip.vehicle}</p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Trip Metrics */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Trip Metrics</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Distance</span>
//                   <span className="font-medium">{trip.distance}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Fuel Used</span>
//                   <span className="font-medium">{trip.fuelUsed}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Passengers</span>
//                   <span className="font-medium">{trip.passengers}</span>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Approval Info */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Approval Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div>
//                   <p className="font-medium text-gray-900">Requested By</p>
//                   <p className="text-gray-600">{trip.requestedBy}</p>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">Approved By</p>
//                   <p className="text-gray-600">{trip.approvedBy}</p>
//                 </div>
//               </CardContent>
//             </Card>

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
//                   Edit Trip
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }