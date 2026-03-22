"use client";
import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVehicle, useReservations } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCar, faDownload } from "@fortawesome/free-solid-svg-icons";
import { exportToStyledExcel } from "@/lib/excel-export";

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  APPROVED: "bg-yellow-100 text-yellow-700",
  CANCELED: "bg-red-100 text-red-600",
  REJECTED: "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: "Ongoing",
};

export default function VehicleTripHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(id);
  const canViewReservations = !!user?.position?.position_access?.reservations?.view;
  const { data: allReservations, isLoading: resLoading } = useReservations({ enabled: canViewReservations });

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const trips = useMemo(() => {
    if (!allReservations || !id) return [];
    return allReservations.filter((res: any) =>
      res.reserved_vehicles?.some((rv: any) => rv.vehicle_id === id)
    );
  }, [allReservations, id]);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return trips;
    return trips.filter((r: any) => r.reservation_status === statusFilter);
  }, [trips, statusFilter]);

  // Summary stats
  const completed = trips.filter((r: any) => r.reservation_status === "COMPLETED").length;
  const ongoing = trips.filter((r: any) => r.reservation_status === "IN_PROGRESS").length;
  const totalPassengers = trips.reduce((sum: number, r: any) => sum + (r.passengers || 0), 0);

  const handleExport = async () => {
    await exportToStyledExcel({
      title: `Trip History — ${vehicle?.plate_number ?? id}`,
      sheetName: "Trip History",
      filename: `trip-history-${vehicle?.plate_number ?? id}`,
      columns: ["#", "Purpose", "From", "To", "Departure", "Expected Return", "Passengers", "Status"],
      statusColumn: "Status",
      data: filtered.map((res: any, i: number) => ({
        "#": i + 1,
        "Purpose": res.reservation_purpose,
        "From": res.start_location,
        "To": res.reservation_destination,
        "Departure": new Date(res.departure_date).toLocaleDateString(),
        "Expected Return": new Date(res.expected_returning_date).toLocaleDateString(),
        "Passengers": res.passengers,
        "Status": res.reservation_status,
      })),
    });
  };

  const isLoading = vehicleLoading || resLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#0872b3] hover:text-[#065d8f] mb-6 text-sm font-medium"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>

        {/* Page header */}
        <div className="bg-[#0872b3] rounded-2xl px-8 py-6 text-white flex items-center justify-between mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-xl p-3">
              <FontAwesomeIcon icon={faCar} className="text-2xl" />
            </div>
            <div>
              <p className="text-white/70 text-xs uppercase tracking-widest">Vehicle Activities</p>
              <h1 className="text-2xl font-bold">
                {vehicleLoading ? "Loading..." : `${vehicle?.plate_number} — Trip History`}
              </h1>
              {vehicle && (
                <p className="text-white/70 text-sm mt-0.5">
                  {vehicle.vehicle_model?.manufacturer_name} {vehicle.vehicle_model?.vehicle_model_name} · {vehicle.energy_type}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0872b3] font-semibold rounded-xl shadow hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            <FontAwesomeIcon icon={faDownload} />
            Export
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Trips", value: trips.length, color: "text-gray-800" },
            { label: "Completed", value: completed, color: "text-green-600" },
            { label: "Ongoing", value: ongoing, color: "text-blue-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-1 px-6 pt-5 pb-0 border-b border-gray-100">
            {["ALL", "COMPLETED", "IN_PROGRESS", "APPROVED", "CANCELED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  statusFilter === s
                    ? "border-[#0872b3] text-[#0872b3]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {s === "ALL" ? "All" : s === "IN_PROGRESS" ? "Ongoing" : s.charAt(0) + s.slice(1).toLowerCase()}
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                  {s === "ALL" ? trips.length : trips.filter((r: any) => r.reservation_status === s).length}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading trips...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No trips found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-6 py-3 text-left">Purpose</th>
                    <th className="px-6 py-3 text-left">From</th>
                    <th className="px-6 py-3 text-left">To</th>
                    <th className="px-6 py-3 text-left">Departure</th>
                    <th className="px-6 py-3 text-left">Expected Return</th>
                    <th className="px-6 py-3 text-left">Passengers</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Map</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((res: any, i: number) => (
                    <tr
                      key={res.reservation_id}
                      onClick={() => router.push(`/dashboard/shared_pages/reservations/${res.reservation_id}`)}
                      className="border-t border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{res.reservation_purpose}</td>
                      <td className="px-6 py-4 text-gray-600">{res.start_location}</td>
                      <td className="px-6 py-4 text-gray-600">{res.reservation_destination}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(res.departure_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(res.expected_returning_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-600">{res.passengers}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[res.reservation_status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABEL[res.reservation_status] ?? res.reservation_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/shared_pages/vehicles/${id}/locations`);
                          }}
                          title="View on map"
                          className="p-2 rounded-lg text-[#0872b3] hover:bg-[#0872b3]/10 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                            <line x1="9" y1="3" x2="9" y2="18"/>
                            <line x1="15" y1="6" x2="15" y2="21"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
