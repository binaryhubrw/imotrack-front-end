'use client'
import { Check, X, Filter, Calendar, User, MapPin, Users, Car, Fuel } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VehicleRequestPage() {
  const router = useRouter()
  return (
    <div className="container mx-auto py-10 max-w-5xl bg-gray-50 min-h-screen px-4">
      {/* Filter Card */}
      <section className="bg-white rounded-xl border shadow-md mb-8 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 text-gray-600 font-semibold">
          <Filter className="w-5 h-5" />
          <span>Filter Requests</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />Status</span>
            <select className="h-9 w-[130px] px-3 py-1 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500">
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />Date Range</span>
            <select className="h-9 w-[130px] px-3 py-1 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 flex items-center gap-1"><Car className="w-3 h-3" />Reason</span>
            <select className="h-9 w-[130px] px-3 py-1 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500">
              <option value="all">All Reasons</option>
              <option value="meeting">Meeting</option>
              <option value="field">Field Work</option>
              <option value="other">Other</option>
            </select>
          </div>
          <input
            type="search"
            placeholder="Search by name or ID"
            className="h-9 mt-5 px-3 py-1 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* Main Request Card */}
      <section className="bg-white rounded-2xl border shadow-lg p-8">
        {/* Request Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Request <span className="text-blue-600">#VR-002</span></h2>
          <span className="inline-block px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">Pending</span>
        </div>

        {/* Requester & Trip Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><User className="w-4 h-4" />Requester</p>
              <p className="font-semibold text-gray-800">Jane Smith</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Department</p>
              <p className="font-semibold text-gray-800">Engineering</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Reason</p>
              <p className="font-semibold text-gray-800">Official Meeting</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-4 h-4" />Passengers</p>
              <p className="font-semibold text-gray-800">5</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4" />Destination</p>
              <p className="font-semibold text-gray-800">Nyaguta Campus</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Estimated Distance</p>
              <p className="font-semibold text-gray-800">180 km</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Start Date</p>
              <p className="font-semibold text-gray-800">2024-03-18</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">End Date</p>
              <p className="font-semibold text-gray-800">2024-03-30</p>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="mb-8">
          <p className="text-xs text-gray-500 flex items-center gap-1"><Car className="w-4 h-4" />Requested Vehicle</p>
          <p className="font-semibold text-gray-800">LR 004 - Toyota Hilux</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Assignment & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Driver Assignment</p>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500">
                <option value="vwanjau">V.Wanjau</option>
                <option value="jdoe">J.Doe</option>
                <option value="psmith">P.Smith</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500">Initial Odometer (km)</p>
              <div className="flex items-center h-10 px-3 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-gray-700">
                24,578
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Vehicle Assignment</p>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500">
                <option value="patrol">PatrolUnit23346</option>
                <option value="suv1">SUV-001</option>
                <option value="truck1">Truck-002</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500">End Odometer (km)</p>
              <div className="flex items-center h-10 px-3 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-gray-700">
                34,557
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><Fuel className="w-4 h-4" />Provided Fuel</p>
              <div className="flex items-center h-10 px-3 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-gray-700">
                2.5L
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Distance of Travel</p>
              <div className="flex items-center h-10 px-3 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-gray-700">
                9,980 km
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button
          onClick={() => router.push('/dashboard/request-overview')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition"
            title="Approve this request"
          >
            <Check className="h-5 w-5" />
            Approve
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition"
            title="Reject this request"
          >
            <X className="h-5 w-5" />
            Reject
          </button>
        </div>
      </section>
    </div>
  )
}
