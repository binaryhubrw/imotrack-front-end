"use client";
import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useUnitPositions, useCreatePosition, useDeletePosition } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Types for permissions
interface PermissionSet {
  [key: string]: boolean;
}
interface PositionAccess {
  [module: string]: PermissionSet;
}

interface PositionUser {
  user_id: string;
  first_name: string;
  last_name: string;
  auth?: { email?: string };
}

interface Position {
  position_id: string;
  position_name: string;
  position_description: string;
  position_access: PositionAccess;
  created_at?: string;
  user_id?: string;
  unit_id?: string;
  position_status: string;
  user?: PositionUser;
}

// Mock units for dropdown (replace with real units query if available)
const mockUnits = [
  { unit_id: "c380feb3-619c-4a8a-99e0-a41d7ba66fdf", unit_name: "Administrative" },
  // Add more units as needed
];

// Create Position Modal
function CreatePositionModal({ open, onClose, onCreate, unitId }: { open: boolean; onClose: () => void; onCreate: (data: FormData) => void; unitId: string }) {
  const [form, setForm] = useState({
    position_name: '',
    position_description: '',
    position_access: {
      organizations: { create: false, view: false, update: false, delete: false },
      units: { create: false, view: false, update: false, delete: false },
      positions: { create: false, view: false, update: false, delete: false },
      users: { create: false, view: false, update: false, delete: false },
      vehicleModels: { create: false, view: false, viewSingle: false, update: false, delete: false },
      vehicles: { create: false, view: false, viewSingle: false, update: false, delete: false },
    } as PositionAccess,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAccessChange = (module: string, perm: string) => {
    setForm((prev) => ({
      ...prev,
      position_access: {
        ...prev.position_access,
        [module]: {
          ...prev.position_access[module],
          [perm]: !prev.position_access[module]?.[perm],
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('position_name', form.position_name);
      formData.append('position_description', form.position_description);
      formData.append('unit_id', unitId);
      formData.append('position_access', JSON.stringify(form.position_access));
      await onCreate(formData);
      setForm({
        position_name: '',
        position_description: '',
        position_access: {
          organizations: { create: false, view: false, update: false, delete: false },
          units: { create: false, view: false, update: false, delete: false },
          positions: { create: false, view: false, update: false, delete: false },
          users: { create: false, view: false, update: false, delete: false },
          vehicleModels: { create: false, view: false, viewSingle: false, update: false, delete: false },
          vehicles: { create: false, view: false, viewSingle: false, update: false, delete: false },
        },
      });
      onClose();
    } catch {
      // error handled in mutation
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Create Position</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="position_name" placeholder="Position Name" value={form.position_name} onChange={handleChange} required />
          <Input name="position_description" placeholder="Description" value={form.position_description} onChange={handleChange} required />
          {/* Permissions (simplified for demo) */}
          <div>
            <label className="block font-medium mb-1">Organizations Access</label>
            {['create', 'view', 'update', 'delete'].map((perm) => (
              <label key={perm} className="mr-3 text-xs">
                <input type="checkbox" checked={form.position_access.organizations[perm] ?? false} onChange={() => handleAccessChange('organizations', perm)} /> {perm}
              </label>
            ))}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
        </form>
      </div>
    </div>
  );
}

function AccessSummary({ access }: { access: PositionAccess }) {
  if (!access) return null;
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
      {Object.entries(access).map(([module, perms]) => (
        <div key={module} className="bg-gray-50 rounded p-2 border border-gray-100">
          <div className="font-semibold text-gray-700 mb-1 capitalize">{module}</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(perms).map(([perm, val]) => (
              val ? (
                <span key={perm} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{perm}</span>
              ) : null
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PositionsPage() {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(mockUnits[0].unit_id);
  const [showCreate, setShowCreate] = useState(false);

  const { data: positions, isLoading, isError } = useUnitPositions(selectedUnitId);
  const createPosition = useCreatePosition();
  const deletePosition = useDeletePosition();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Unit Selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <label className="font-medium">Select Unit:</label>
        <select
          value={selectedUnitId}
          onChange={e => setSelectedUnitId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          {mockUnits.map(unit => (
            <option key={unit.unit_id} value={unit.unit_id}>{unit.unit_name}</option>
          ))}
        </select>
        <Button className="ml-auto" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Position
        </Button>
      </div>
      {/* Card/List Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading positions...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load positions. Please try again.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(positions as Position[] || []).map((pos) => (
              <div key={pos.position_id} className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-blue-800 flex items-center gap-2">
                      {pos.position_name}
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${pos.position_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{pos.position_status}</span>
                    </div>
                    <div className="text-gray-600 text-sm mt-1">{pos.position_description}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      onClick={e => { e.stopPropagation(); toast.info('Edit not implemented'); }}
                      aria-label="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      onClick={e => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this position?')) {
                          deletePosition.mutate({ positionId: pos.position_id, unit_id: selectedUnitId });
                        }
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">Created: {pos.created_at ? new Date(pos.created_at).toLocaleString() : 'N/A'}</div>
                <div className="mt-2">
                  <span className="font-semibold text-gray-700">Assigned User: </span>
                  {pos.user ? (
                    <span className="text-gray-800">{pos.user.first_name} {pos.user.last_name} <span className="text-gray-500">({pos.user.auth?.email ?? 'N/A'})</span></span>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </div>
                <AccessSummary access={pos.position_access ?? {}} />
              </div>
            ))}
          </div>
        )}
      </div>
      <CreatePositionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (formData: FormData) => {
          await createPosition.mutateAsync(formData);
        }}
        unitId={selectedUnitId}
      />
    </div>
  );
}