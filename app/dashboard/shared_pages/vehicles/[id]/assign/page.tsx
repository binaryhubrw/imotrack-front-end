"use client";
import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVehicle, useReservations, useAddVehicleToReservation, useUpdateReservation } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCar, faMapMarkerAlt, faCalendarAlt, faUsers, faMap } from "@fortawesome/free-solid-svg-icons";
import { Reservation } from "@/types/next-auth";

export default function AssignCarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(id);
  const canViewReservations = !!user?.position?.position_access?.reservations?.view;
  const { data: allReservations, isLoading: resLoading } = useReservations({ enabled: canViewReservations });
  const addVehicle = useAddVehicleToReservation();
  const updateStatus = useUpdateReservation();

  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // UNDER_REVIEW or ACCEPTED reservations that don't already have this vehicle
  const eligible = useMemo(() => {
    if (!allReservations) return [];
    return (allReservations as Reservation[]).filter(
      (r) =>
        (r.reservation_status === "UNDER_REVIEW" || r.reservation_status === "ACCEPTED") &&
        !r.reserved_vehicles?.some((rv: any) => rv.vehicle_id === id || rv.vehicle?.vehicle_id === id)
    );
  }, [allReservations, id]);

  const filtered = useMemo(() => {
    if (!search.trim()) return eligible;
    const q = search.toLowerCase();
    return eligible.filter(
      (r) =>
        r.reservation_purpose.toLowerCase().includes(q) ||
        r.start_location.toLowerCase().includes(q) ||
        r.reservation_destination.toLowerCase().includes(q) ||
        r.user?.first_name?.toLowerCase().includes(q) ||
        r.user?.last_name?.toLowerCase().includes(q)
    );
  }, [eligible, search]);

  const selected = filtered.find((r) => r.reservation_id === selectedId);

  const handleAssign = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      const reservation = eligible.find(r => r.reservation_id === selectedId);

      // If still under review, accept it first
      if (reservation?.reservation_status === "UNDER_REVIEW") {
        await updateStatus.mutateAsync({
          id: selectedId,
          dto: { status: "ACCEPTED" },
        });
      }

      // Then assign the vehicle
      await addVehicle.mutateAsync({ id: selectedId, dto: { vehicle_id: id } });
      router.push(`/dashboard/shared_pages/reservations/${selectedId}`);
    } catch {
      // error handled by mutations
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = vehicleLoading || resLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-screen-xl mx-auto px-4">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#0872b3] hover:text-[#065d8f] mb-6 text-sm font-medium"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>

        {/* Header */}
        <div className="bg-[#0872b3] rounded-2xl px-8 py-6 text-white flex items-center gap-5 mb-6 shadow-lg">
          <div className="bg-white/20 rounded-xl p-3 shrink-0">
            <FontAwesomeIcon icon={faCar} className="text-2xl" />
          </div>
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest">Assign Vehicle</p>
            <h1 className="text-2xl font-bold">
              {vehicleLoading ? "Loading..." : vehicle?.plate_number}
            </h1>
            {vehicle && (
              <p className="text-white/70 text-sm mt-0.5">
                {vehicle.vehicle_model?.manufacturer_name} {vehicle.vehicle_model?.vehicle_model_name}
                {" · "}{vehicle.transmission_mode}{" · "}{vehicle.energy_type}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — reservation list */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Pending Reservations</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {eligible.length} available
              </span>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b border-gray-50">
              <input
                type="text"
                placeholder="Search by purpose, location or requester..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872b3]/30"
              />
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Loading reservations...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                No pending reservations available to assign this vehicle to.
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                {filtered.map((res) => {
                  const isSelected = selectedId === res.reservation_id;
                  return (
                    <div
                      key={res.reservation_id}
                      onClick={() => setSelectedId(isSelected ? "" : res.reservation_id)}
                      className={`flex items-start gap-4 px-6 py-4 cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50 border-l-4 border-[#0872b3]" : "hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                    >
                      {/* Radio */}
                      <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-[#0872b3] bg-[#0872b3]" : "border-gray-300"
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-gray-800 truncate">{res.reservation_purpose}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              res.reservation_status === "ACCEPTED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {res.reservation_status === "ACCEPTED" ? "Accepted" : "Under Review"}
                            </span>
                            {/* Map view button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/shared_pages/vehicles/${id}/locations`);
                              }}
                              title="View on map"
                              className="p-1.5 rounded-lg text-[#0872b3] hover:bg-[#0872b3]/10 transition-colors"
                            >
                              <FontAwesomeIcon icon={faMap} className="text-sm" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                            {res.start_location} → {res.reservation_destination}
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                            {new Date(res.departure_date).toLocaleDateString()} – {new Date(res.expected_returning_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
                            {res.passengers} passengers
                          </span>
                        </div>
                        {res.user && (
                          <p className="text-xs text-gray-400 mt-1">
                            Requested by {res.user.first_name} {res.user.last_name}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right — summary + confirm */}
          <div className="flex flex-col gap-4">
            {/* Vehicle summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">Vehicle</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#0872b3]/10 rounded-xl p-3">
                  <FontAwesomeIcon icon={faCar} className="text-[#0872b3] text-lg" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{vehicle?.plate_number ?? "—"}</p>
                  <p className="text-xs text-gray-500">{vehicle?.vehicle_model?.manufacturer_name} {vehicle?.vehicle_model?.vehicle_model_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Status", value: vehicle?.vehicle_status },
                  { label: "Energy", value: vehicle?.energy_type },
                  { label: "Transmission", value: vehicle?.transmission_mode },
                  { label: "Year", value: vehicle?.vehicle_year },
                ].map((f) => (
                  <div key={f.label} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 uppercase tracking-wide text-[10px]">{f.label}</p>
                    <p className="font-semibold text-gray-700 mt-0.5">{f.value ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected reservation summary */}
            <div className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${selected ? "border-[#0872b3]/30" : "border-gray-100"}`}>
              <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">Selected Reservation</h3>
              {selected ? (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-gray-800">{selected.reservation_purpose}</p>
                  <p className="text-gray-500 text-xs">{selected.start_location} → {selected.reservation_destination}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(selected.departure_date).toLocaleDateString()} – {new Date(selected.expected_returning_date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 text-xs">{selected.passengers} passengers</p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No reservation selected yet.</p>
              )}
            </div>

            {/* Confirm button */}
            <button
              onClick={handleAssign}
              disabled={!selectedId || submitting}
              className="w-full py-3 bg-[#0872b3] hover:bg-[#065d8f] text-white font-semibold rounded-xl shadow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
            {submitting ? "Processing..." : selected?.reservation_status === "UNDER_REVIEW" ? "Accept & Assign Vehicle" : "Assign Vehicle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
