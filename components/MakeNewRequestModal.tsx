'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';



interface MakeNewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmitRequest: (requestData: any) => void; // Replace 'any' with a proper type for request data
}

const MakeNewRequestModal: React.FC<MakeNewRequestModalProps> = ({ isOpen, onClose, onSubmitRequest }) => {
  const [requestType, setRequestType] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [numberOfPassengers, setNumberOfPassengers] = useState<number | string>('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnTime, setReturnTime] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requestData = {
      requestType,
      destination,
      startDate,
      endDate,
      purpose,
      numberOfPassengers: Number(numberOfPassengers),
      pickupTime,
      returnTime,
    };
    onSubmitRequest(requestData);
    onClose();
    // Reset form fields
    setRequestType('');
    setDestination('');
    setStartDate('');
    setEndDate('');
    setPurpose('');
    setNumberOfPassengers('');
    setPickupTime('');
    setReturnTime('');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Make New Request</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Request Type */}
          <div>
            <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-1">Request Type <span className="text-red-500">*</span></label>
            <select
              id="requestType"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Request Type</option>
              <option value="Vehicle">Vehicle</option>
              {/* Add more request types as needed */}
            </select>
          </div>
          {/* Destination (top) - This seems to be a separate field in the image */}
          <div>
            <label htmlFor="topDestination" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input
              type="text"
              id="topDestination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {/* Purpose */}
          <div className="md:col-span-2">
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">Purpose <span className="text-red-500">*</span></label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Please describe the purpose of your request..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {/* Number of Passengers */}
          <div>
            <label htmlFor="numPassengers" className="block text-sm font-medium text-gray-700 mb-1">Number of Passengers</label>
            <input
              type="number"
              id="numPassengers"
              value={numberOfPassengers}
              onChange={(e) => setNumberOfPassengers(e.target.value)}
              placeholder="1...n"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Destination (bottom) - Assuming this is the same as the top one, or a specific location */}
          <div>
            <label htmlFor="bottomDestination" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input
              type="text"
              id="bottomDestination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="enter your destination..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Pickup Time */}
          <div>
            <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
            <input
              type="time"
              id="pickupTime"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Return Time */}
          <div>
            <label htmlFor="returnTime" className="block text-sm font-medium text-gray-700 mb-1">Return Time</label>
            <input
              type="time"
              id="returnTime"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-[#0872B3] text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MakeNewRequestModal; 