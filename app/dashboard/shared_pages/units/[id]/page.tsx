"use client"

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { faArrowLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  useOrganizationDeleteUnit,
  useOrganizationUnit,
  useUpdateOrganizationUnit,
} from "@/lib/queries";
import { useState } from "react";
import { Position } from "@/types/next-auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SkeletonEntityDetails } from "@/components/ui/skeleton";
import { Ban, Building2 } from "lucide-react";

export default function UnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: unit, isLoading, isError, refetch } = useOrganizationUnit(id);
  const updateUnit = useUpdateOrganizationUnit();
  const DisActivateUnit = useOrganizationDeleteUnit();
  const [showEdit, setShowEdit] = useState(false);
  const [showDisActivateConfirm, setShowDisActivateConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    unit_name: "",
    status: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [DisActivateError, setDisActivateError] = useState<string | null>(null);

  // Open edit modal and prefill form
  const handleEdit = () => {
    if (!unit) return;
    setEditForm({
      unit_name: unit.unit_name || "",
      status: unit.status || "",
    });
    setShowEdit(true);
  };

  // Save edit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateUnit.mutateAsync({
        unit_id: id,
        updates: editForm,
      });
      setShowEdit(false);
      refetch();
    } finally {
      setSubmitting(false);
    }
  };

  // DisActivate handler
  const handleDisActivate = async () => {
    if (!id) return;
    setDeleting(true);
    setDisActivateError(null);
    try {
      await DisActivateUnit.mutateAsync({ unit_id: id });
      setShowDisActivateConfirm(false);
      router.back();
    } catch (error: unknown) {
      let message = "Failed to DisActivate unit.";
      if (typeof error === "object" && error && "message" in error) {
        message = (error as { message?: string }).message || message;
      }
      setDisActivateError(message);
      setDeleting(false);
    }
  };

  if (isLoading) {
    return <SkeletonEntityDetails />
  }
  if (isError || !unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading unit details</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="text-[#0872b3] hover:text-[#065d8f]"
            onClick={() => router.back()}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              className="bg-[#0872b3] text-white hover:bg-[#065d8f]"
              onClick={handleEdit}
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Edit Unit
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => setShowDisActivateConfirm(true)}
            >
              <Ban className="mr-2" />
              DisActivate
            </Button>
          </div>
        </div>
        {/* DisActivate Confirmation Modal */}
        {showDisActivateConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Ban className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    DisActivate Unit
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to DisActivate{" "}
                  <strong>{unit.unit_name}</strong>? This action cannot be
                  undone.
                </p>
                {DisActivateError && (
                  <div className="mb-4 text-red-600 text-sm">
                    {DisActivateError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDisActivateConfirm(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisActivate}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                        Deleting...
                      </>
                    ) : (
                      "DisActivate"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Edit Modal */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <form
              onSubmit={handleEditSave}
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4"
            >
              <h2 className="text-xl font-bold mb-2">Edit Unit</h2>
              <label className="text-sm font-medium">
                Unit Name
                <input
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={editForm.unit_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, unit_name: e.target.value }))
                  }
                  required
                />
              </label>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowEdit(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#0872b3] text-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Unit Details</h1>
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {unit.status}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Unit Name</div>
                <div className="font-medium text-gray-900">
                  {unit.unit_name}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Status</div>
                <div className="font-medium text-gray-900">{unit.status}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">
                  Created At
                </div>
                <div className="font-medium text-gray-900">
                  {unit.created_at
                    ? new Date(unit.created_at).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
            {/* Positions List */}
            <div className="mt-8">
              {/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
              {/* <h2 className="text-lg font-bold mb-2">Positions</h2> */}
              {unit.positions && unit.positions.length > 0 ? (
                <ul className="list-disc pl-5">
                  {(unit.positions as Position[]).map((pos) => (
                    <li key={pos.position_id} className="text-gray-800">
                      {pos.position_name}{" "}
                      <span className="text-xs text-gray-500">
                        ({pos.position_status})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                <p></p>
                // <div className="text-gray-500">No positions found for this unit.</div>
              )}
            </div>
            {/* Organizations List for this Unit */}
            <div className="mt-10 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-indigo-600" />
                Positions in this Unit
              </h2>
              {unit.positions && unit.positions.length > 0 ? (
                <ol className="list-decimal pl-6 space-y-3">
                  {unit.positions.map((pos) => (
                    <li
                      key={pos.position_id}
                      className="flex items-center gap-3 text-gray-700 text-base"
                    >
                      <span className="font-bold text-gray-900">
                        {pos.position_name}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({pos.position_status})
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-gray-500 italic text-sm">
                  No positions found for this unit.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
