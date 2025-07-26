"use client";

import { useParams, useRouter } from "next/navigation";
import { faArrowLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { useUser, useUpdateUser } from "@/lib/queries";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SkeletonEntityDetails } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import type { UpdateUserDto } from '@/types/next-auth';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";

function EditUserModal({ open, onClose, userId, onUpdated }: { open: boolean; onClose: () => void; userId: string | null; onUpdated: () => void }) {
  const { data: user, isLoading } = useUser(userId || '');
  const updateUser = useUpdateUser(userId || '');
  const [form, setForm] = useState<UpdateUserDto>({});
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (user && open) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        user_phone: user.user_phone || '',
        user_gender: user.user_gender || '',
        user_dob: user.user_dob || '',
        street_address: user.street_address || '',
      });
    }
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f: UpdateUserDto) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateUser.mutateAsync(form);
      onClose();
      onUpdated();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#0872b3]">Edit User</h2>
          <button className="text-gray-400 hover:text-[#0872b3] p-1 rounded-full hover:bg-gray-100" onClick={onClose} disabled={submitting}><X className="w-5 h-5" /></button>
        </div>
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">First Name</label>
              <Input name="first_name" value={form.first_name || ''} onChange={handleChange} className="w-full" required disabled={isLoading || submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">Last Name</label>
              <Input name="last_name" value={form.last_name || ''} onChange={handleChange} className="w-full" required disabled={isLoading || submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">Phone</label>
              <Input name="user_phone" value={form.user_phone || ''} onChange={handleChange} className="w-full" disabled={isLoading || submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">Gender</label>
              <select name="user_gender" value={form.user_gender || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2" disabled={isLoading || submitting}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">Date of Birth</label>
              <Input name="user_dob" type="date" value={form.user_dob || ''} onChange={handleChange} className="w-full" disabled={isLoading || submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">Street Address</label>
              <Input name="street_address" value={form.street_address || ''} onChange={handleChange} className="w-full" disabled={isLoading || submitting} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" className="bg-[#0872b3] text-white min-w-[120px]" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading, isError, refetch } = useUser(id);
  const [showEdit, setShowEdit] = useState(false);
  const { user: currentUser, isLoading: authLoading } = useAuth();

  // Permission checks
  const canView = !!currentUser?.position?.position_access?.users?.view;
  const canUpdate = !!currentUser?.position?.position_access?.users?.update;
  

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!canView) {
    return <NoPermissionUI resource="users" />;
  }

  if (isLoading) {
    return <SkeletonEntityDetails />;
  }
  if (isError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading user details</div>
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
              {canUpdate && (
                <Button
                  className="bg-[#0872b3] text-white hover:bg-[#065d8f]"
                  onClick={() => setShowEdit(true)}
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Edit User
                </Button>
              )}
            </div>
        </div>
        {/* Edit Modal */}
        {showEdit && canUpdate && (
          <EditUserModal open={showEdit} onClose={() => setShowEdit(false)} userId={id} onUpdated={refetch} />
        )}
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#0872b3] text-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">User Details</h1>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">First Name</div>
                <div className="font-medium text-gray-900">{user.first_name}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Last Name</div>
                <div className="font-medium text-gray-900">{user.last_name}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Email</div>
                <div className="font-medium text-gray-900">{user.email}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Phone</div>
                <div className="font-medium text-gray-900">{user.user_phone}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Gender</div>
                <div className="font-medium text-gray-900">{user.user_gender}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Date of Birth</div>
                <div className="font-medium text-gray-900">{user.user_dob || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Street Address</div>
                <div className="font-medium text-gray-900">{user.street_address || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">NID</div>
                <div className="font-medium text-gray-900">{user.user_nid || 'N/A'}</div>
              </div>
            </div>
          </div>
          {/* Positions List for this User */}
          <div className="mt-10 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-indigo-600" />
                Positions
              </h2>
            </div>
            {user.positions && user.positions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {user.positions.map((pos) => {
                  // determine color classes based on status
                  let cardColor = "bg-gray-50 border-gray-200";
                  if (pos.position_status === "ACTIVE") {
                    cardColor = "bg-green-50 border-green-300";
                  } else if (pos.position_status === "DISACTIVATED") {
                    cardColor = "bg-yellow-50 border-yellow-300";
                  } else if (pos.position_status === "INACTIVE") {
                    cardColor = "bg-red-50 border-red-300";
                  }
                  return (
                    <div
                      key={pos.position_id}
                      className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${cardColor}`}
                      onClick={() => router.push(`/dashboard/shared_pages/positions/${pos.position_id}`)}
                    >
                      <h3 className="text-lg font-bold text-gray-900">
                        {pos.position_name}
                      </h3>
                      <div className="text-sm text-gray-700 mt-1">
                        {pos.position_description}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Unit: {pos.unit.unit_name}<br />
                        Org: {pos.unit.organization.organization_name}
                      </div>
                      <p className="mt-2 text-sm">
                        Status: <span className="font-medium">{pos.position_status}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 italic text-sm">
                No positions found for this user.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
