'use client'
import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, AlertTriangle } from "lucide-react";
import { useVehicleIssues } from "@/lib/queries";
import Link from "next/link";
import { SkeletonVehicleIssueDetails } from "@/components/ui/skeleton";

export default function IssueManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { data: issues = [], isLoading, isError } = useVehicleIssues();

  const statusLabels: Record<string, string> = {
    OPEN: "Reported",
    CLOSED: "Closed",
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.issue_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issue_description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (issue.reserved_vehicle_id &&
          issue.reserved_vehicle_id
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));
      const matchesStatus =
        filterStatus === "all" || issue.issue_status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [issues, searchQuery, filterStatus]);

  if (isLoading) {
    return <SkeletonVehicleIssueDetails />;
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-red-50 border border-red-200 shadow-sm">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-red-600 mb-2">
        Failed to load vehicle issues
      </h2>
      <p className="text-sm text-red-500 mb-4">
        Something went wrong while fetching data. Please try again later.
      </p>
      <button
        onClick={() => location.reload()}
        className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
      >
        Retry
      </button>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Issue Management</CardTitle>
            <CardDescription>
              View and manage reported vehicle issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Reported</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Table */}
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Reported</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500 py-8"
                      >
                        No issues found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIssues.map((issue) => (
                      <TableRow key={issue.issue_id}>
                        <TableCell>{issue.issue_title}</TableCell>
                        <TableCell>{issue.issue_description}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              issue.issue_status === "RESOLVED"
                                ? "default"
                                : issue.issue_status === "IN_PROGRESS"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {statusLabels[issue.issue_status] ||
                              issue.issue_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(issue.issue_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/dashboard/shared_pages/vehicle-issues/${issue.issue_id}`}
                            legacyBehavior
                          >
                            <a>
                              <Button size="icon" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </a>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
