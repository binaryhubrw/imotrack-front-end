"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "@/lib/queries";

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: logs = [],
    isLoading,
    isError,
  } = useAuditLogs({
    name: nameFilter,
    email: emailFilter,
    organization: orgFilter,
    startDate,
    endDate,
    page: currentPage,
    limit,
  });

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user?.first_name &&
        log.user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.user?.last_name &&
        log.user.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.user?.email &&
        log.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusColor = (action: string) => {
    if (action.toLowerCase().includes("delete"))
      return "bg-red-100 text-red-800";
    if (action.toLowerCase().includes("update"))
      return "bg-yellow-100 text-yellow-800";
    if (action.toLowerCase().includes("create"))
      return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading audit logs...</div>
    );
  }
  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load audit logs.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-500">
            Monitor system activity and user actions
          </p>
        </div>
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4"
            />
            <Input
              placeholder="Name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
            <Input
              placeholder="Organization"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
            />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="min-w-0"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="min-w-0"
            />
          </div>
        </CardContent>
      </Card>
      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No logs found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {log.user?.first_name} {log.user?.last_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.user?.email}
                          </span>
                          <span className="text-xs text-gray-400">
                            {log.user?.organization_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.table_name || "-"}</TableCell>
                      <TableCell>{log.record_id || "-"}</TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.ip_address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
