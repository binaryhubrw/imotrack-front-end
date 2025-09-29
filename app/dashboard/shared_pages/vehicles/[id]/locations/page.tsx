"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, ArrowLeft, Wifi, WifiOff, Activity, Clock } from "lucide-react"
import Link from 'next/link'
import VehicleMap from '@/components/VehicleMap' // Adjust import path as needed

// Mock vehicle data - replace with actual API call
interface Vehicle {
  vehicle_id: string
  name: string
  license_plate: string
  driver_name?: string
  status: 'active' | 'inactive' | 'maintenance'
}

export default function VehicleLocationPage() {
  const params = useParams()
  const vehicleId = params.id as string
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load vehicle data
  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setLoading(true)
        // Replace with actual API call
        // const response = await fetch(`/api/vehicles/${vehicleId}`)
        // const vehicleData = await response.json()
        
        // Mock data for now
        const mockVehicle: Vehicle = {
          vehicle_id: vehicleId,
          name: `Vehicle ${vehicleId.slice(0, 8)}`,
          license_plate: 'ABC-123',
          driver_name: 'John Doe',
          status: 'active'
        }
        
        setVehicle(mockVehicle)
        setError(null)
      } catch (err) {
        console.error('Failed to load vehicle:', err)
        setError('Failed to load vehicle data')
      } finally {
        setLoading(false)
      }
    }

    if (vehicleId) {
      loadVehicle()
    }
  }, [vehicleId])

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

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-destructive font-medium">Vehicle Not Found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error || 'The requested vehicle could not be found'}
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
              Real-time GPS tracking for {vehicle.name}
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{vehicle.name}</h3>
              <p className="text-muted-foreground text-sm">License: {vehicle.license_plate}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge 
                  variant={vehicle.status === 'active' ? 'default' : 
                          vehicle.status === 'maintenance' ? 'destructive' : 'secondary'}
                >
                  {vehicle.status}
                </Badge>
              </div>
              
              {vehicle.driver_name && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Driver:</span>
                  <span className="text-sm font-medium">{vehicle.driver_name}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vehicle ID:</span>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {vehicleId.slice(0, 8)}...
                </span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Stream Status:</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Connected to live GPS feed
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button 
                size="sm" 
                className="w-full" 
                onClick={() => {
                  // Add functionality to share location
                  const url = `${window.location.origin}${window.location.pathname}`
                  navigator.clipboard.writeText(url)
                }}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Share Location
              </Button>
              
              <Link href={`/dashboard/shared_pages/vehicles/${vehicle.vehicle_id}/tracking`} className="w-full">
                <Button size="sm" variant="outline" className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  Track This Vehicle
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Map Container */}
        <Card className="lg:col-span-3 p-0 overflow-hidden">
          <div className="h-[600px] w-full">
            <VehicleMap 
              vehicleId={vehicleId}
              vehicles={[{
                id: vehicleId,
                name: vehicle.name,
                lat: 40.7128, // Default coordinates - will be updated by stream
                lng: -74.006,
                speed: 0,
                heading: 0,
                status: vehicle.status,
                fuel: 100,
                driver: vehicle.driver_name || 'Unknown Driver',
                lastUpdate: new Date().toISOString()
              }]}
            />
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