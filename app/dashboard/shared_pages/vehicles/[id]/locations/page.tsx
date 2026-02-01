"use client"

import { useParams } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, ArrowLeft, Activity, Clock, User, Gauge, Fuel, Navigation2, Zap } from "lucide-react"
import Link from 'next/link'
import VehicleMap from '@/components/VehicleMap'
import { useVehicle, useVehicleLocationStream } from '@/lib/queries'
import { useState, useEffect } from 'react'


export default function VehicleLocationPage() {
  const params = useParams()
  const vehicleId = params.id as string
  
  // Fetch vehicle data using the API hook
  const { data: vehicle, isLoading: loading, isError } = useVehicle(vehicleId)
  
  // Stream location data
  const { location: locationStream } = useVehicleLocationStream(vehicleId, !!vehicleId)
  
  // State for real location data
  const [realLocation, setRealLocation] = useState({
    latitude: -2.0434,
    longitude: 29.8739,
    locationName: "Loading location..."
  })
  const [locationLoading, setLocationLoading] = useState(false)

  // Reverse geocode coordinates to get location name
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLocationLoading(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      
      // Extract location name from response
      let locationName = "Unknown Location"
      if (data.address) {
        const { city, town, village, county, district, province, region, country } = data.address
        locationName = [village, town, city, district, county, region, province, country]
          .filter(Boolean)
          .slice(0, 4)
          .join(", ")
      }
      
      setRealLocation({
        latitude: lat,
        longitude: lng,
        locationName: locationName || "Location Unknown"
      })
    } catch (error) {
      console.error("Geocoding error:", error)
      setRealLocation(prev => ({
        ...prev,
        locationName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      }))
    } finally {
      setLocationLoading(false)
    }
  }

  // Update location when stream data changes
  useEffect(() => {
    if (locationStream?.coords?.latitude && locationStream?.coords?.longitude) {
      reverseGeocode(locationStream.coords.latitude, locationStream.coords.longitude)
    }
  }, [locationStream])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading vehicle data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-destructive font-medium">Vehicle Not Found</p>
            <p className="text-sm text-muted-foreground mt-1">
              The requested vehicle could not be found
            </p>
            <Button
              className="mt-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Function to get dynamic tabs based on vehicle type
  const getDynamicTabs = () => {
    const tabs = [];
    
    // Always show odometer
    tabs.push({
      id: 'odometer',
      icon: Gauge,
      label: 'Odometer',
      value: `${sampleData.odometer} Km`,
      color: 'cyan'
    });
    
    // Show fuel for non-electric vehicles
    if (vehicle.energy_type && vehicle.energy_type.toLowerCase() !== 'electric') {
      tabs.push({
        id: 'fuel',
        icon: Fuel,
        label: 'Fuel Tank',
        value: `${sampleData.fuel} L`,
        color: 'amber'
      });
    }
    
    // Always show speed
    tabs.push({
      id: 'speed',
      icon: Navigation2,
      label: 'Speed',
      value: `${sampleData.speed} Km/h`,
      color: 'green'
    });
    
    // Show battery for electric and hybrid vehicles
    if (vehicle.energy_type && (vehicle.energy_type.toLowerCase() === 'electric' || vehicle.energy_type.toLowerCase() === 'hybrid')) {
      tabs.push({
        id: 'battery',
        icon: Zap,
        label: 'Battery',
        value: `${sampleData.battery}V`,
        color: 'yellow'
      });
    }
    
    // Always show ignition
    tabs.push({
      id: 'ignition',
      icon: Activity,
      label: 'Ignition',
      value: sampleData.ignition,
      color: 'red'
    });
    
    return tabs;
  };

  // Sample Data for Demo
  const sampleData = {
    driver: "John Okafor",
    location: realLocation.locationName,
    lastUpdate: new Date(2026, 0, 4, 14, 19, 57),
    odometer: 6728.34,
    fuel: 145,
    speed: 50,
    battery: 25.55,
    ignition: "Off",
    movement: "Off",
    imei: "3540171186272252",
    coordinates: {
      lat: realLocation.latitude,
      lng: realLocation.longitude
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href={`/dashboard/shared_pages/vehicles/${vehicleId}`}
            className="inline-flex"
          >
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vehicle
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Live Location Tracking
            </h1>
            <p className="text-muted-foreground">
              Real-time GPS tracking for {vehicle.vehicle_model?.vehicle_model_name || 'Vehicle'}
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Info Card - Left Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1 space-y-4">
          {/* Vehicle Status Summary Card - Modern Gradient */}
          <Card className="p-0 overflow-hidden text-white shadow-lg border-0" style={{ backgroundColor: '#0872b3' }}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-sm font-semibold opacity-90">Live Tracking</h2>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {vehicle.plate_number}
              </div>
              <p className="text-xs font-medium opacity-75 mb-4">
                {vehicle.vehicle_model?.manufacturer_name} {vehicle.vehicle_year}
              </p>
              
              {/* Key Info Section */}
              <div className="space-y-2.5 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-3.5 h-3.5 opacity-75" />
                  <span className="opacity-80">Driver:</span>
                  <span className="font-semibold ml-auto">{sampleData.driver}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 opacity-75" />
                  <span className="opacity-80">Location:</span>
                  <span className="font-semibold ml-auto text-right max-w-[50%]">{sampleData.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 opacity-75" />
                  <span className="opacity-80">Time:</span>
                  <span className="font-semibold ml-auto">{sampleData.lastUpdate.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                    <span className="text-xs">GPS Connected</span>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize bg-white/20 text-white hover:bg-white/30">
                    {vehicle.vehicle_status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Vehicle Details Card */}
          <Card className="p-4 space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-semibold text-sm mb-2">Vehicle Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{vehicle.vehicle_model?.vehicle_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transmission:</span>
                  <span className="font-medium capitalize">{vehicle.transmission_mode || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Energy Type:</span>
                  <span className="font-medium capitalize">{vehicle.energy_type || 'N/A'}</span>
                </div>
                {vehicle.vehicle_model?.vehicle_capacity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-medium">{vehicle.vehicle_model.vehicle_capacity} passengers</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-600">2026</div>
                <div className="text-xs text-muted-foreground">Model Year</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-purple-600">Active</div>
                <div className="text-xs text-muted-foreground">Current Status</div>
              </div>
            </div>

            {/* Last Service */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Last Service:</span> {new Date(vehicle.last_service_date).toLocaleDateString()}
              </p>
            </div>
          </Card>

          {/* Quick Stats Card */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700">▲</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Running</span>
                </div>
                <span className="font-semibold text-lg">4</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-red-700">■</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Stopped</span>
                </div>
                <span className="font-semibold text-lg">23</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-yellow-700">◯</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Idle</span>
                </div>
                <span className="font-semibold text-lg">0</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Map Container */}
        <Card className="lg:col-span-3 p-0 overflow-hidden flex flex-col">
          <div className="h-[600px] w-full flex-1">
            <VehicleMap 
              vehicleId={vehicleId}
              vehicles={[{
                id: vehicleId,
                name: vehicle.vehicle_model?.vehicle_model_name || 'Unknown Vehicle',
                lat: 40.7128, // Default coordinates - will be updated by stream
                lng: -74.006,
                speed: 0,
                heading: 0,
                status: "inactive",
                fuel: 100,
                driver: 'Unknown Driver', // Add driver info when available
                lastUpdate: new Date().toISOString()
              }]}
            />
          </div>
          
          {/* Vehicle Tracking Details - Bottom Card on Map */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 border-t border-slate-700">
            <div className={`grid gap-3 ${getDynamicTabs().length <= 3 ? 'grid-cols-2 md:grid-cols-3' : getDynamicTabs().length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'}`}>
              {getDynamicTabs().map((tab) => {
                const colorMap = {
                  cyan: 'text-cyan-400',
                  amber: 'text-amber-400',
                  green: 'text-green-400',
                  yellow: 'text-yellow-400',
                  red: 'text-red-400'
                };
                const Icon = tab.icon;
                return (
                  <div key={tab.id} className="flex flex-col items-center p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-4 h-4 ${colorMap[tab.color as keyof typeof colorMap]}`} />
                      <span className={`text-xs font-semibold ${colorMap[tab.color as keyof typeof colorMap]}`}>{tab.value}</span>
                    </div>
                    <span className="text-xs text-gray-400">{tab.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Live GPS Tracking</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• This page shows real-time location updates from the vehicle's GPS system</p>
              <p>• Green markers indicate active tracking with live data</p>
              <p>• Gray markers show the last known position when tracking is inactive</p>
              <p>• Click on the vehicle marker for detailed information</p>
              <p>• Use the map controls to zoom and navigate around the area</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Location updates are received in real-time via secure Server-Sent Events (SSE) connection
        </p>
      </div>
    </div>
  )
}