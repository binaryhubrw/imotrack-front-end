'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useOrganizationDetails } from '@/lib/queries';

export default function OrganizationIdPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: org, isLoading, isError, error } = useOrganizationDetails(id);

  if (isLoading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#0872B3]" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-red-600">
        <p className="text-lg">Error loading organization: {error?.message || 'Unknown error'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[#0872B3] text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </main>
    );
  }

  if (!org) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-lg text-gray-500">Organization not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[#0872B3] text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-10 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0872B3] px-8 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:bg-[#065a8e] rounded-full p-2 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">Organization Details</h1>
        </div>
        {/* Main Info */}
        <div className="px-8 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-7 h-7 text-[#0872B3]" />
              <span className="text-2xl font-bold text-gray-900">{org.name}</span>
            </div>
            <div className="text-sm text-gray-500 font-mono">ID: {org.customId}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><Mail className="w-4 h-4 mr-1" />Email</div>
              <div className="font-medium text-gray-900">{org.email}</div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><Phone className="w-4 h-4 mr-1" />Phone</div>
              <div className="font-medium text-gray-900">{org.phone}</div>
            </div>
            <div className="md:col-span-1">
              <div className="flex items-center text-sm text-gray-500 mb-1"><MapPin className="w-4 h-4 mr-1" />Address</div>
              <div className="font-medium text-gray-900">{org.address}</div>
            </div>
            {/* <div className="md:col-span-1">
              <div className="flex items-center text-sm text-gray-500 mb-1"><Timer className="w-4 h-4 mr-1" />Created At</div>
              <div className="font-medium text-gray-900">{org.created_at}</div>
            </div> */}
          </div>
        </div>
      </div>
    </main>
  );
}
