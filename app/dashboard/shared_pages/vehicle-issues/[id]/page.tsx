

'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Calendar, 
  Car,
  Clock, 
  Download,
  Phone,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVehicleIssue } from '@/lib/queries';


export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as string;
  const { data: issue, isLoading, isError } = useVehicleIssue(issueId);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#e6f2fa] px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0872B3]" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !issue) {
    return (
      <main className="min-h-screen bg-[#e6f2fa] px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Not Found</h2>
              <p className="text-gray-600 mb-6">The issue could not be found.</p>
              <Button onClick={() => router.push('/dashboard/staff/issue-management')} className="bg-[#0872B3] hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Issue History
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Reported</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      case 'CLOSED':
        return <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-200">Closed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'RESOLVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CLOSED':
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const generateReport = () => {
    const reportData = `
Issue Report
============

Title: ${issue.issue_title}
Status: ${issue.issue_status}
Date Reported: ${new Date(issue.issue_date).toLocaleString()}

Description:
${issue.issue_description}

---
Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `issue_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-[#e6f2fa] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => router.push('/dashboard/shared_pages/vehicle-issues')}
            variant="ghost" 
            className="text-[#0872B3] hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Issues
          </Button>
          <div className="flex gap-2">
            <Button onClick={generateReport} variant="outline" className="border-[#0872B3] text-[#0872B3] hover:bg-[#0872B3] hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Issue Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(issue.issue_status)}
                    <div>
                      <CardTitle className="text-xl text-gray-900">Issue Details</CardTitle>
                      <p className="text-sm text-gray-600">Issue ID: {issue.issue_id}</p>
                    </div>
                  </div>
                  {getStatusBadge(issue.issue_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{issue.issue_description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Reserved Vehicle ID</p>
                        <p className="font-medium text-gray-900">{issue.reserved_vehicle_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Date Reported</p>
                        <p className="font-medium text-gray-900">{new Date(issue.issue_date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Status Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    {getStatusIcon(issue.issue_status)}
                    <p className="mt-2 font-medium text-gray-900">{issue.issue_status}</p>
                    <p className="text-sm text-gray-600">
                      {issue.issue_status === 'OPEN' && 'Issue has been reported and is awaiting review'}
                      {issue.issue_status === 'IN_PROGRESS' && 'Issue is currently being addressed'}
                      {issue.issue_status === 'RESOLVED' && 'Issue has been resolved'}
                      {issue.issue_status === 'CLOSED' && 'Issue has been closed'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Contact Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full bg-[#0872B3] hover:bg-[#065d8f]">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    If you need immediate assistance, please contact the fleet management team.
                  </p>
                </div>
              </CardContent>
            </Card>
            {/* Emergency Alert */}
            {issue.issue_status === 'OPEN' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  This issue has been reported and is awaiting review. You will be notified once its being addressed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}